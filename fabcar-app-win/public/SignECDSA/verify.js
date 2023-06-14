const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

export async function verifySignature(signature_org, result) {
  try {
    const keyPath = path.join(__dirname, './key-store/public_key.pem');

    // read the public key, message, and digital signature from files using the UTF-8 encoding
    const publicKey = fs.readFileSync(keyPath, 'utf-8');
    const message = result;

    //處理json字串中的空白字元
    var replacementSymbol = "+";
    var signature_fix = signature_org.replace(/\s/g, replacementSymbol);
    const signature = signature_fix;
    console.log("修正的簽章: " + signature);

    // algorithm: 'RSA-SHA256', 'SHA256', 'RSA-SHA1'
    // SHA-256: For RSA keys, the algorithm is RSASSA-PKCS1-v1_5. 
    // SHA-256: For EC keys, the algorithm is ECDSA.
    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);
    verifier.end();

    // encoding: 'latin1', 'hex' or 'base64'
    const buf = Buffer.from(signature, 'base64');
    const verified = verifier.verify(publicKey, buf);
    
    console.log(message); // Prints: message
    console.log(publicKey); // Prints: public key
    console.log("驗證的數位簽章:" + signature); // Prints: signature
    console.log("驗證結果：" + verified); // Prints: true or false

    return verified;
  } catch (error) {
    console.error('驗證失敗:', error);
    throw error;
  }
}
