import crypto from 'crypto';

// 🔐 Generate SHA-256 hash
function generateHash(fileBuffer) {
    return crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');
}

// 🔍 Verify hash (for later use)
export function verifyHash(fileBuffer, storedHash) {
    const newHash = generateHash(fileBuffer);
    return newHash === storedHash;
}

export default generateHash;