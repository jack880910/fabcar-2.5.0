import * as fabric_client from "../../fabric-client";

// https://libraries.io/npm/ecdsa-secp256r1
const ECDSA = require('ecdsa-secp256r1'); // npm install --save ecdsa-secp256r1@latest
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

export async function verifySignature(keyowner, signature_org, result) {
  try {
    var replacementSymbol = "+";
    const verifyData_origin = result.replace(/#/g, "&");
    const verifyData = verifyData_origin.replace(/!/g, "+");

    const keyobj = await fabric_client.queryPubkey("publickey_" + keyowner);
    var obj = JSON.parse(keyobj);  // JSON格式轉換成JavaScript物件obj
    const publicKey_unfix = obj.publickey;
    const publicKey = publicKey_unfix.replace(/ /g, replacementSymbol);
    console.log("publicKey: " + publicKey);
    console.log("publicKey_fixed: " + publicKey);

    // Convert public key string to Buffer
    const publicKeyBuffer = Buffer.from(publicKey, 'base64');
    // Create PEM-formatted string
    const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBuffer.toString('base64')}\n-----END PUBLIC KEY-----`;
    // Save PEM public key to file
    const filePath = path.join(__dirname, './key-store-test/public_key.pem');

    fs.writeFileSync(filePath, pemPublicKey, 'utf-8');
    console.log(`Public key saved as PEM format at ${filePath}`);

    // const keyPath = path.join(__dirname, './key-store/public_key.pem');
    // const publicKey2 = fs.readFileSync(keyPath, 'utf-8');
    // console.log("publickey2" + publicKey2);

    //處理json字串中的空白字元
    var signature_fix = signature_org.replace(/\s/g, replacementSymbol);
    const signature = signature_fix;
    console.log("原始的簽章: " + signature_org);
    console.log("修正的簽章: " + signature);

    // algorithm: 'RSA-SHA256', 'SHA256', 'RSA-SHA1'
    // SHA-256: For RSA keys, the algorithm is RSASSA-PKCS1-v1_5. 
    // SHA-256: For EC keys, the algorithm is ECDSA.
    const verifier = crypto.createVerify('SHA256');
    verifier.update(verifyData);
    verifier.end();

    // encoding: 'latin1', 'hex' or 'base64'
    const buf = Buffer.from(signature, 'base64');
    const verified = verifier.verify(pemPublicKey, buf);

    console.log("放入驗證的資料:" + verifyData); // Prints: message
    console.log("公鑰:" + publicKey); // Prints: public key
    console.log("驗證用的數位簽章:" + signature); // Prints: signature
    console.log("驗證結果：" + verified); // Prints: true or false

    return verified;
  } catch (error) {
    console.error('驗證失敗:', error);
    throw error;
  }
}
