import crypto from 'crypto';
import { publicKey } from './keys.js';

// 🔍 Verify certificate signature
function verifySignature(fileBuffer, signature) {
    const verifier = crypto.createVerify('SHA256');

    // Directly use file buffer (same as signing)
    verifier.update(fileBuffer);
    verifier.end();

    return verifier.verify(publicKey, signature, 'hex');
}

export default verifySignature;