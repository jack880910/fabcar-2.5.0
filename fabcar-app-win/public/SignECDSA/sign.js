
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const keyPath = path.join(__dirname, './key-store/private_key.pem');

export async function signWithECDSA(queryresult) {
    try {
        const privateKey = fs.readFileSync(keyPath, 'utf-8');
        const message = queryresult;
        // const message = fs.readFileSync('./message.txt', 'utf-8');

        console.log(privateKey); // Prints: private key
        console.log(message); // Prints: message

        const signer = crypto.createSign('SHA256');
        signer.update(message);
        signer.end();

        const signature = signer.sign(privateKey, 'base64');
        fs.writeFileSync('./signature.txt', signature);

        console.log(privateKey); // Prints: private key
        console.log(message); // Prints: message
        console.log("生成的數位簽章:" + signature); // Prints: signature

        return signature;
    } catch (error) {
        console.error('簽名失敗:', error);
        throw error;
    }
}