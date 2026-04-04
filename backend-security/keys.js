import crypto from 'crypto';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // strong security
});

export { publicKey, privateKey };

console.log(publicKey.export({ type: 'pkcs1', format: 'pem' }));
console.log(privateKey.export({ type: 'pkcs1', format: 'pem' }));