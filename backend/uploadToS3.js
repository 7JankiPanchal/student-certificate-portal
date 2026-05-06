import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config();

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: process.env.AWS_REGION || process.env.DYNAMO_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY
    }
});

async function uploadFile(file) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream'
    };

    const command = new PutObjectCommand(params);
    await client.send(command);

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.originalname}`;
}

export default uploadFile;
