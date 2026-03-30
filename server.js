import express from "express";
import cors from "cors";

import client from "./config/dynamo.js";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

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

// 🔹 Start server
app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});