import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { saveToDB } from './dbOperations.js';
dotenv.config();

import express from 'express';
import multer from 'multer';

import generateHash from '../backend-security/hashing.js';
import signCertificate from '../backend-security/signature.js';
import verifySignature from '../backend-security/verifySignature.js';
import uploadFile from './uploadToS3.js';

const app = express();

// 📦 Multer setup (store file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🧠 Temporary storage (for demo)
let storedData = {};

// =======================
// 🚀 UPLOAD API
// =======================
app.post('/upload', upload.single('certificate'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 🔐 Step 1: Generate hash
        const hash = generateHash(file.buffer);

        // ✍️ Step 2: Generate signature
        const signature = signCertificate(file.buffer);

        // ☁️ Step 3: Upload to S3
        const fileURL = await uploadFile(file);
        const id = Date.now().toString(); // simple unique id
        await saveToDB(id, fileURL, hash, signature);  

        // 🧠 Store for verification (temporary)
        storedData = {
            hash,
            signature
        };

        res.json({
            message: "File uploaded securely",
            fileURL,
            hash,
            signature
        });

    } catch (error) {
        res.status(500).json({
            message: "Upload failed",
            error: error.message
        });
    }
});

// =======================
// 🔍 VERIFY API
// =======================
app.post('/verify', upload.single('certificate'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 🔐 Step 1: Generate new hash
        const newHash = generateHash(file.buffer);

        // 🔍 Step 2: Compare hash
        const isHashValid = newHash === storedData.hash;

        // ✍️ Step 3: Verify signature
        const isSignatureValid = verifySignature(file.buffer, storedData.signature);

        // ✅ Final result
        const isValid = isHashValid && isSignatureValid;

        res.json({
            valid: isValid,
            hashMatch: isHashValid,
            signatureMatch: isSignatureValid
        });

    } catch (error) {
        res.status(500).json({
            message: "Verification failed",
            error: error.message
        });
    }
});

// =======================
// 🟢 SERVER START
// =======================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
});
