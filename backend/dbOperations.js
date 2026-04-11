import { PutItemCommand, GetItemCommand, ScanCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import client from "./dynamo.js";

export async function saveToDB(id, fileURL, hash, signature) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Item: {
            student_id: { S: id },
            document_id: { S: fileURL },
            hash: { S: hash },
            signature: { S: signature },
        },
    };

    await client.send(new PutItemCommand(params));
}

export async function getDocumentData(studentId, documentId) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Key: {
            student_id: { S: studentId },
            document_id: { S: documentId },
        },
    };

    const result = await client.send(new GetItemCommand(params));
    if (!result.Item) return null;

    return {
        hash: result.Item.hash?.S,
        signature: result.Item.signature?.S,
    };
}

export async function createUser(studentId, name, email, hashedPassword) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Item: {
            student_id: { S: studentId },
            document_id: { S: "USER_PROFILE" }, // Required Sort Key by DynamoDB Schema
            type: { S: "USER" },
            name: { S: name },
            email: { S: email },
            password: { S: hashedPassword },
        },
    };
    await client.send(new PutItemCommand(params));
}

export async function getUserByEmail(email) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        FilterExpression: "email = :email AND #type = :type",
        ExpressionAttributeNames: {
            "#type": "type" // Reserved keyword in DynamoDB
        },
        ExpressionAttributeValues: {
            ":email": { S: email },
            ":type": { S: "USER" }
        },
    };
    
    const result = await client.send(new ScanCommand(params));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

export async function getDocumentsForStudent(studentId) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: "student_id = :sid",
        ExpressionAttributeValues: {
            ":sid": { S: studentId }
        }
    };
    
    const result = await client.send(new QueryCommand(params));
    if (!result.Items) return [];
    
    // Return all items except the "USER_PROFILE" stub
    return result.Items.filter(item => item.document_id.S !== "USER_PROFILE");
}