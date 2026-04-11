import dotenv from 'dotenv';
// Load environment variables (trying current dir and parent dir)
dotenv.config({ path: '../.env' });
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// AWS SDKs for direct DynamoDB & S3 operations (ported from old root server.js)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Custom operations from backend folders
import { saveToDB, getDocumentData, createUser, getUserByEmail, getDocumentsForStudent } from './dbOperations.js';
import generateHash from '../backend-security/hashing.js';
import signCertificate from '../backend-security/signature.js';
import verifySignature from '../backend-security/verifySignature.js';
import uploadFile from './uploadToS3.js';
import authMiddleware from './middleware/auth.js';

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// Setup Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Unified AWS Configurations (falling back to multiple common env vars to avoid crashes)
const ddbClient = new DynamoDBClient({
  region: process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Use a unified table name
const tableName = process.env.DYNAMO_TABLE_NAME || process.env.AWS_TABLE_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY,
  },
});

// 🧠 Temporary storage for verify demo (We will replace this with DynamoDB query later)
let storedData = {};

// =======================
// 🟢 BASIC API ROUTES
// =======================

app.get("/", (req, res) => {
  res.send("🚀 Consolidated Backend is running!");
});

// Get users from DynamoDB
app.get("/users", async (req, res) => {
  try {
    const data = await docClient.send(new ScanCommand({ TableName: tableName }));
    res.json(data.Items);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Pre-Signed URL for S3
app.get("/get-upload-url", async (req, res) => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';
    const fileName = `uploads/${Date.now()}.pdf`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: "application/pdf",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.json({
      url,
      fileUrl: `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`,
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ error: error.message });
  }
});

// =======================
// 🔐 AUTHENTICATION API
// =======================

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate student_id
        const studentId = `STU-${Date.now()}`;

        // Save to DB
        await createUser(studentId, name, email, hashedPassword);

        // Generate JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
        const token = jwt.sign({ student_id: studentId, email }, jwtSecret, { expiresIn: '2h' });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                student_id: studentId,
                name,
                email
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password.S);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
        const token = jwt.sign({ student_id: user.student_id.S, email }, jwtSecret, { expiresIn: '2h' });

        res.json({
            message: "Login successful",
            token,
            user: {
                student_id: user.student_id.S,
                name: user.name.S,
                email: user.email.S
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
});

app.get('/documents', authMiddleware, async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const studentId = req.user.student_id;
        const documents = await getDocumentsForStudent(studentId);
        
        const formattedDocs = documents.map(doc => ({
            document_id: doc.document_id.S,
            hash: doc.hash?.S,
            signature: doc.signature?.S,
            uploadDate: new Date().toISOString() // We can enhance Dynamo later with exact timestamps
        }));

        res.json({ documents: formattedDocs });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Failed to fetch documents", error: error.message });
    }
});

// =======================
// 🚀 FILE VERIFICATION & UPLOADS
// =======================

app.post('/upload', authMiddleware, upload.single('certificate'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 🔐 Generate hash
        const hash = generateHash(file.buffer);

        // ✍️ Generate signature
        const signature = signCertificate(file.buffer);

        // ☁️ Upload to S3
        const fileURL = await uploadFile(file);
        
        // Use student_id from request, or generate one if testing
        const id = req.body.student_id || Date.now().toString(); 
        await saveToDB(id, fileURL, hash, signature);

        res.json({
            message: "File uploaded securely",
            student_id: id,
            document_id: fileURL,
            fileURL,
            hash,
            signature
        });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
});

app.post('/verify', authMiddleware, upload.single('certificate'), async (req, res) => {
    try {
        const file = req.file;
        const studentId = req.body.student_id; // Client must pass the student ID
        const documentId = req.body.document_id; // Client must pass the S3 URL / doc ID

        if (!file || !studentId || !documentId) {
            return res.status(400).json({ message: "Please provide file, student_id, and document_id" });
        }

        // Fetch original signature and hash from DynamoDB
        const originalData = await getDocumentData(studentId, documentId);
        if (!originalData) {
            return res.status(404).json({ message: "No record found for this student_id and document_id" });
        }

        // 🔐 Step 1: Generate new hash from uploaded file
        const newHash = generateHash(file.buffer);

        // 🔍 Step 2: Compare hash against DB record
        const isHashValid = newHash === originalData.hash;

        // ✍️ Step 3: Verify signature using DB record
        const isSignatureValid = verifySignature(file.buffer, originalData.signature);

        // ✅ Final result
        const isValid = isHashValid && isSignatureValid;

        res.json({
            valid: isValid,
            hashMatch: isHashValid,
            signatureMatch: isSignatureValid
        });
    } catch (error) {
        console.error("Verification failed:", error);
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
});

// =======================
// 🟢 SERVER START
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
