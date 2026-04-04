import crypto from 'crypto';
import { privateKey } from './keys.js';

// 🔐 Sign certificate
function signCertificate(fileBuffer) {
    const signer = crypto.createSign('SHA256');

    // Directly use file buffer (no manual hash needed)
    signer.update(fileBuffer);
    signer.end();

    const signature = signer.sign(privateKey, 'hex');

    return signature;
}

export default signCertificate;