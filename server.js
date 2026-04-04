import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Load env variables
dotenv.config();

// --------------------
// DynamoDB Config
// --------------------
const ddbClient = new DynamoDBClient({
  region: process.env.DYNAMO_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.DYNAMO_TABLE_NAME;

// --------------------
// S3 Config
// --------------------
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// --------------------
// Express App
// --------------------
const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

// Get users from DynamoDB
app.get("/users", async (req, res) => {
  try {
    const data = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Pre-Signed URL for S3
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

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});