import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import client from "./dynamo.js";

export async function saveToDB(id, fileURL, hash, signature) {
    const params = {
        TableName: process.env.AWS_TABLE_NAME,
        Item: {
            student_id: { S: id },
            document_id: { S: fileURL },
            hash: { S: hash },
            signature: { S: signature },
        },
    };

    await client.send(new PutItemCommand(params));
}