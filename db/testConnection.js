import client from "../config/dynamo.js";
import { ListTablesCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

async function testConnection() {
  try {
    // 🔹 1. Check connection (list tables)
    const data = await client.send(new ListTablesCommand({}));
    console.log("✅ Connected to DynamoDB!");
    console.log("📦 Tables:", data.TableNames);

    // 🔹 2. Insert into "users" table
    await client.send(new PutItemCommand({
      TableName: "users",   // 👈 your table name
      Item: {
  user_id: { S: "101" },   // ✅ match table key exactly
  name: { S: "Janki" },
  course: { S: "IT" }
}
    }));

    console.log("✅ Data inserted into users table!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testConnection();