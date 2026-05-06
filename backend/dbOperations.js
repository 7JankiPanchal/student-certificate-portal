import { PutItemCommand, GetItemCommand, ScanCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import client from "./dynamo.js";

export async function saveToDB(id, fileURL, hash, signature, uploadDate, requestedPoints, status = "PENDING", fileSize = 0) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Item: {
            student_id: { S: id },
            document_id: { S: fileURL },
            hash: { S: hash },
            signature: { S: signature },
            upload_date: { S: uploadDate },
            status: { S: status },
            requested_points: { N: requestedPoints ? requestedPoints.toString() : "0" },
            teacher_message: { S: "" },
            file_size: { N: fileSize ? fileSize.toString() : "0" },
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
        requestedPoints: result.Item.requested_points?.N ? parseInt(result.Item.requested_points.N, 10) : 0
    };
}

export async function createUser(studentId, name, email, hashedPassword, role = "STUDENT") {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Item: {
            student_id: { S: studentId },
            document_id: { S: "USER_PROFILE" }, // Required Sort Key by DynamoDB Schema
            type: { S: "USER" },
            role: { S: role },
            points: { N: "0" },
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

export async function getAllUserProfiles() {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        FilterExpression: "document_id = :profile",
        ExpressionAttributeValues: {
            ":profile": { S: "USER_PROFILE" }
        }
    };
    const result = await client.send(new ScanCommand(params));
    return result.Items || [];
}

export async function getPendingDocuments() {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        FilterExpression: "#stat = :pending AND document_id <> :profile",
        ExpressionAttributeNames: {
            "#stat": "status"
        },
        ExpressionAttributeValues: {
            ":pending": { S: "PENDING" },
            ":profile": { S: "USER_PROFILE" }
        }
    };
    const result = await client.send(new ScanCommand(params));
    return result.Items || [];
}

export async function getAllDocuments() {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        FilterExpression: "document_id <> :profile",
        ExpressionAttributeValues: {
            ":profile": { S: "USER_PROFILE" }
        }
    };
    const result = await client.send(new ScanCommand(params));
    return result.Items || [];
}

export async function updateDocumentStatus(studentId, documentId, status, message) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Key: {
            student_id: { S: studentId },
            document_id: { S: documentId },
        },
        UpdateExpression: "SET #status = :s, teacher_message = :m",
        ConditionExpression: "attribute_exists(student_id) AND attribute_exists(document_id)",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":s": { S: status },
            ":m": { S: message || "" }
        }
    };
    await client.send(new UpdateItemCommand(params));
}

export async function addPointsToStudent(studentId, pointsToAdd) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Key: {
            student_id: { S: studentId },
            document_id: { S: "USER_PROFILE" },
        },
        UpdateExpression: "SET points = if_not_exists(points, :start) + :inc",
        ExpressionAttributeValues: {
            ":inc": { N: pointsToAdd.toString() },
            ":start": { N: "0" }
        }
    };
    await client.send(new UpdateItemCommand(params));
}

export async function deleteDocumentFromDB(studentId, documentId) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME || process.env.DYNAMO_TABLE_NAME,
        Key: {
            student_id: { S: studentId },
            document_id: { S: documentId },
        },
    };
    await client.send(new DeleteItemCommand(params));
}