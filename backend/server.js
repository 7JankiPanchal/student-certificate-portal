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
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Custom operations from backend folders
import { saveToDB, getDocumentData, createUser, getUserByEmail, getDocumentsForStudent, getPendingDocuments, getAllDocuments, updateDocumentStatus, addPointsToStudent, deleteDocumentFromDB, getAllUserProfiles } from './dbOperations.js';
import generateHash from '../backend-security/hashing.js';
import signCertificate from '../backend-security/signature.js';
import verifySignature from '../backend-security/verifySignature.js';
import uploadFile from './uploadToS3.js';
import authMiddleware from './middleware/auth.js';

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

const s3Client = new S3Client({
    region: process.env.AWS_REGION || process.env.DYNAMO_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY
    }
});

const generatePresignedUrl = async (fileUrl) => {
    if (!fileUrl) return null;
    try {
        const key = decodeURIComponent(fileUrl.split('/').pop());
        const command = new GetObjectCommand({ 
            Bucket: process.env.AWS_BUCKET_NAME, 
            Key: key,
            ResponseContentDisposition: 'inline',
            ResponseContentType: key.endsWith('.pdf') ? 'application/pdf' : 
                                 key.match(/\.jpe?g$/i) ? 'image/jpeg' :
                                 key.endsWith('.png') ? 'image/png' : 'application/octet-stream'
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (e) {
        return fileUrl; // fallback to original if something fails
    }
};

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
        const { name, email, password, role } = req.body;
        
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
        const requestedRole = role === "TEACHER" ? "TEACHER" : "STUDENT";
        await createUser(studentId, name, email, hashedPassword, requestedRole);

        // Generate JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
        const token = jwt.sign({ student_id: studentId, email, role: requestedRole }, jwtSecret, { expiresIn: '2h' });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                student_id: studentId,
                name,
                email,
                role: requestedRole,
                points: 0
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
        const role = user.role?.S || "STUDENT";
        const token = jwt.sign({ student_id: user.student_id.S, email, role }, jwtSecret, { expiresIn: '2h' });

        res.json({
            message: "Login successful",
            token,
            user: {
                student_id: user.student_id.S,
                name: user.name.S,
                email: user.email.S,
                role,
                points: user.points?.N ? parseInt(user.points.N, 10) : 0
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
        
        const formattedDocs = await Promise.all(documents.map(async doc => {
            const isAccepted = doc.status?.S === "ACCEPTED";
            return {
                document_id: doc.document_id.S,
                status: doc.status?.S || "PENDING",
                requested_points: doc.requested_points?.N,
                teacher_message: doc.teacher_message?.S,
                hash: isAccepted ? doc.hash?.S : null,
                signature: isAccepted ? doc.signature?.S : null,
                uploadDate: doc.upload_date?.S || new Date().toISOString(),
                size: doc.file_size?.N || "0",
                presigned_url: await generatePresignedUrl(doc.document_id.S)
            };
        }));

        // Sort descending by uploadDate (newest first)
        formattedDocs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        res.json({ documents: formattedDocs });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Failed to fetch documents", error: error.message });
    }
});

app.delete('/documents', authMiddleware, async (req, res) => {
    try {
        const { document_id, student_id } = req.body;
        const isTeacher = req.user.role && req.user.role.toUpperCase() === 'TEACHER';
        const targetStudentId = isTeacher ? student_id : req.user.student_id;
        
        import('fs').then(fs => {
            fs.appendFileSync('delete_debug.log', `[${new Date().toISOString()}] req.body: ${JSON.stringify(req.body)}, target: ${targetStudentId}, user: ${JSON.stringify(req.user)}\n`);
        });

        if (!document_id || !targetStudentId) {
            return res.status(400).json({ message: "Missing document_id or student_id" });
        }
        
        await deleteDocumentFromDB(targetStudentId, document_id);
        res.json({ message: "Document deleted successfully", document_id });
    } catch (error) {
        import('fs').then(fs => fs.appendFileSync('delete_debug.log', `ERROR: ${error.message}\n`));
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Failed to delete document", error: error.message });
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
        const id = req.user?.student_id || req.body.student_id || Date.now().toString(); 
        const requestedPoints = req.body.requested_points || 0;
        const uploadDate = new Date().toISOString();
        
        const fileSize = file.size || 0;
        await saveToDB(id, fileURL, hash, signature, uploadDate, requestedPoints, "PENDING", fileSize);

        res.json({
            message: "File uploaded securely. Pending teacher review.",
            student_id: id,
            document_id: fileURL,
            fileURL,
            status: "PENDING",
            requested_points: requestedPoints,
            uploadDate,
            size: fileSize
        });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
});

app.post('/verify', authMiddleware, upload.single('certificate'), async (req, res) => {
    try {
        const file = req.file;
        const studentEmail = req.body.student_email; // Now expects student email

        if (!file || !studentEmail) {
            return res.status(400).json({ message: "Please provide certificate file and student_email" });
        }

        // 1. Get the user profile by email
        const userProfile = await getUserByEmail(studentEmail);
        if (!userProfile || !userProfile.student_id) {
            return res.status(404).json({ message: "No student found with this email" });
        }

        const studentId = userProfile.student_id.S;

        // 2. Fetch all documents for this student
        const documents = await getDocumentsForStudent(studentId);
        
        if (!documents || documents.length === 0) {
            return res.status(404).json({ message: "No documents found for this student" });
        }

        // 3. Generate hash from uploaded file
        const newHash = generateHash(file.buffer);

        // 4. Find the matching document by hash
        const matchingDoc = documents.find(doc => doc.hash?.S === newHash);

        if (!matchingDoc) {
            return res.status(404).json({ message: "Document has been modified or is not genuine (Cryptographic hash mismatch)" });
        }

        // 5. Check if it's accepted
        if (matchingDoc.status?.S !== "ACCEPTED") {
            return res.status(400).json({ message: `Document found but is currently ${matchingDoc.status?.S}` });
        }

        // 6. Verify signature
        const isSignatureValid = verifySignature(file.buffer, matchingDoc.signature.S);

        res.json({
            valid: isSignatureValid,
            hashMatch: true, // we found it by hash
            signatureMatch: isSignatureValid,
            documentInfo: {
                name: matchingDoc.document_id?.S?.split('/').pop(),
                uploadDate: matchingDoc.upload_date?.S
            }
        });
    } catch (error) {
        console.error("Verification failed:", error);
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
});

// =======================
// 👩‍🏫 TEACHER REVIEW API
// =======================

app.get('/documents/pending', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied. Teachers only." });
        }
        
        const docs = await getPendingDocuments();
        const profiles = await getAllUserProfiles();
        const profileMap = profiles.reduce((map, p) => {
            if (p.student_id?.S) map[p.student_id.S] = p.name?.S || "Unknown Student";
            return map;
        }, {});

        const formattedDocs = await Promise.all(docs.map(async doc => ({
            student_id: doc.student_id.S,
            student_name: profileMap[doc.student_id.S] || "Unknown Student",
            document_id: doc.document_id.S,
            uploadDate: doc.upload_date?.S,
            requested_points: doc.requested_points?.N,
            status: doc.status?.S || "PENDING",
            size: doc.file_size?.N || "0",
            presigned_url: await generatePresignedUrl(doc.document_id.S)
        })));
        
        res.json({ pending_documents: formattedDocs });
    } catch (error) {
        console.error("Error fetching pending docs:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/documents/all', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied. Teachers only." });
        }
        
        const docs = await getAllDocuments();
        const profiles = await getAllUserProfiles();
        const profileMap = profiles.reduce((map, p) => {
            if (p.student_id?.S) map[p.student_id.S] = p.name?.S || "Unknown Student";
            return map;
        }, {});

        const formattedDocs = await Promise.all(docs.map(async doc => ({
            student_id: doc.student_id?.S,
            student_name: profileMap[doc.student_id?.S] || "Unknown Student",
            document_id: doc.document_id?.S,
            uploadDate: doc.upload_date?.S || new Date().toISOString(),
            requested_points: doc.requested_points?.N,
            status: doc.status?.S || "PENDING",
            name: doc.document_id?.S?.split('/').pop() || "Unknown Document",
            size: doc.file_size?.N || "0",
            presigned_url: await generatePresignedUrl(doc.document_id?.S)
        })));
        
        // Sort descending by uploadDate
        formattedDocs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        res.json({ all_documents: formattedDocs });
    } catch (error) {
        console.error("Error fetching all docs:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/documents/review', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied. Teachers only." });
        }
        
        const { student_id, document_id, action, message } = req.body;
        if (!student_id || !document_id || !action) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (action === "REJECT") {
            await updateDocumentStatus(student_id, document_id, "REJECTED", message);
            return res.json({ message: "Document rejected", document_id });
        } else if (action === "ACCEPT") {
            await updateDocumentStatus(student_id, document_id, "ACCEPTED", "Approved");
            
            // Re-fetch document data to find requested points
            const docData = await getDocumentData(student_id, document_id);
            if (docData && docData.requestedPoints) {
                await addPointsToStudent(student_id, docData.requestedPoints);
            }
            
            return res.json({ message: "Document accepted and points awarded", document_id });
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }
    } catch (error) {
        if (error.name === "ConditionalCheckFailedException") {
            return res.status(404).json({ message: "Document not found. Ensure student_id and document_id match exactly." });
        }
        console.error("Error reviewing doc:", error);
        res.status(500).json({ message: "Review failed", error: error.message });
    }
});

// =======================
// 🟢 DEMO SEEDER ROUTE
// =======================

app.post('/seed-demo', async (req, res) => {
    try {
        const studentId = "DEMO_STU_001";
        const teacherId = "DEMO_TEA_001";
        const studentEmail = "demo@student.com";
        const teacherEmail = "demo@teacher.com";
        const password = await bcrypt.hash("password123", 10);

        // 1. Create Users
        await createUser(studentId, "Demo Student", studentEmail, password, "STUDENT");
        await createUser(teacherId, "Demo Faculty", teacherEmail, password, "TEACHER");

        // 2. Add Mock Documents for Student
        const now = new Date();
        const docs = [
            { 
                name: "Degree_Certificate.pdf", 
                pts: 50, 
                status: "ACCEPTED", 
                date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                size: 2450000 
            },
            { 
                name: "Fee_Receipt_Sem4.pdf", 
                pts: 10, 
                status: "ACCEPTED", 
                date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                size: 1200000 
            },
            { 
                name: "Hall_Ticket_Final_Exam.pdf", 
                pts: 5, 
                status: "PENDING", 
                date: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
                size: 850000 
            },
            { 
                name: "Internship_Report.pdf", 
                pts: 30, 
                status: "PENDING", 
                date: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
                size: 3500000 
            },
            { 
                name: "Previous_Result_Scan.png", 
                pts: 15, 
                status: "REJECTED", 
                date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
                size: 1800000 
            }
        ];

        for (const doc of docs) {
            const mockUrl = `https://demo-bucket.s3.amazonaws.com/${studentId}/${doc.name}`;
            const mockHash = generateHash(doc.name + doc.date);
            const mockSignature = doc.status === "ACCEPTED" ? signCertificate(mockHash) : "";
            
            await saveToDB(
                studentId, 
                mockUrl, 
                mockHash, 
                mockSignature, 
                doc.date, 
                doc.pts.toString(), 
                doc.status,
                doc.size
            );
        }

        // 3. Add points for the approved ones
        await addPointsToStudent(studentId, 60);

        res.json({ 
            message: "Demo data seeded successfully!", 
            student: { email: studentEmail, password: "password123" },
            teacher: { email: teacherEmail, password: "password123" }
        });
    } catch (error) {
        console.error("Seeding error:", error);
        res.status(500).json({ error: error.message });
    }
});

// =======================
// 🟢 SERVER START
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
