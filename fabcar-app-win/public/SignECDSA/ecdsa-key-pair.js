// https://libraries.io/npm/ecdsa-secp256r1
const ECDSA = require('ecdsa-secp256r1'); // npm install --save ecdsa-secp256r1@latest
const fs = require('fs');
const path = require('path');
const publickeyPath = path.join(__dirname, './key-store/public_key.pem');
const privatekeyPath = path.join(__dirname, './key-store/private_key.pem');

export async function genKeypair(key) {
    try {
        var privateKey = ECDSA.generateKey();

        var privateKeyPEM = privateKey.toPEM();
        var publicKeyPEM = privateKey.asPublic().toPEM();

        fs.writeFileSync(privatekeyPath, privateKeyPEM, 'utf-8');
        fs.writeFileSync(publickeyPath, publicKeyPEM, 'utf-8');

        //取出公鑰並去頭尾
        const publicKey = fs.readFileSync(publickeyPath, 'utf-8');
        const publicKeyString = publicKey.toString();
        const publicKeyCore = publicKeyPEM.replace(/-----BEGIN PUBLIC KEY-----/, '')
                                 .replace(/-----END PUBLIC KEY-----/, '')
                                 .trim();

        console.log("生成的公私鑰：");
        console.log(privateKeyPEM);
        console.log(publicKeyPEM);
        console.log(publicKeyString);
        console.log(publicKeyCore);


        return publicKeyCore;
    } catch (error) {
        console.error('生成公私鑰失敗:', error);
        throw error;
    }
}