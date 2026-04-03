import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import client from "./config/dynamo.js";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 🔹 Load env variables
dotenv.config();

// 🔹 S3 Config using ENV
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

// 🔹 GET users from DynamoDB
app.get("/users", async (req, res) => {
  try {
    const data = await client.send(new ScanCommand({
      TableName: "users"
    }));

    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Generate Pre-Signed URL
app.get("/get-upload-url", async (req, res) => {
  try {
    const fileName = `uploads/${Date.now()}.pdf`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      ContentType: "application/pdf",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.json({
      url,
      fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});