// https://kjur.github.io/jsrsasign/
// jsrsasign: opensource free pure JavaScript cryptographic library supports RSA/RSAPSS/ECDSA/DSA signing/validation, 
// ASN.1, PKCS#1/5/8 private/public key, X.509 certificate, CRL, CMS SignedData, TimeStamp, CAdES and JSON 
// Web Signature(JWS)/Token(JWT)/Key(JWK)

const fs = require('fs');
const r = require('jsrsasign'); // npm install --save jsrsasign

var ec = new r.ECDSA({ 'curve': 'secp256r1' });
var keypair = ec.generateKeyPairHex();

var privateKeyHex = keypair.ecprvhex; // hexadecimal string of EC private key
var publicKeyHex = keypair.ecpubhex; // hexadecimal string of EC public key

var privateKeyBase64 = Buffer.from(privateKeyHex, 'hex').toString('base64');
var publicKeyBase64 = Buffer.from(publicKeyHex, 'hex').toString('base64');

var privateKeyBase64PEM = convertPrivateKeyToPEM(privateKeyBase64);
var publicKeyBase64PEM = convertPublicKeyToPEM(publicKeyBase64);

fs.writeFileSync('./private_key.pem', privateKeyBase64PEM, 'utf-8');
fs.writeFileSync('./public_key.pem', publicKeyBase64PEM, 'utf-8');

//console.log(pub_hex);
//console.log(prv_hex);
//console.log(pub_base64);
//console.log(prv_base64);
console.log(privateKeyBase64PEM);
console.log(publicKeyBase64PEM);

msg1 = 123;

var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
sig.init({ d: privateKeyHex, curve: 'secp256r1' });
sig.updateString(msg1);
var sigValueHex = sig.sign();

var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
sig.init({ xy: publicKeyHex, curve: 'secp256r1' });
sig.updateString(msg1);
var result = sig.verify(sigValueHex);
if (result) {
    console.log("valid ECDSA signature");
} else {
    console.log("invalid ECDSA signature");
}


function convertPrivateKeyToPEM(key) {
    var n = key.length;
    var num_lines = Math.ceil(n / 64.0);
    var pem = new String();
    pem = pem.concat('-----BEGIN PRIVATE KEY-----\n');
    for (i = 0; i < num_lines; i++) {
        var start = i * 64;
        var end = (i + 1) * 64;
        if (end > n) {
            end = n;
        }
        pem = pem.concat(key.substring(start, end) + '\n');
    }
    pem = pem.concat('-----END PRIVATE KEY-----');
    return pem;
}

function convertPublicKeyToPEM(key) {
    var n = key.length;
    var num_lines = Math.ceil(n / 64.0);
    var pem = new String();
    pem = pem.concat('-----BEGIN PUBLIC KEY-----\n');
    for (var i = 0; i < num_lines; i++) {
        var start = i * 64;
        var end = (i + 1) * 64;
        if (end > n) {
            end = n;
        }
        pem = pem.concat(key.substring(start, end) + '\n');
    }
    pem = pem.concat('-----END PUBLIC KEY-----');
    return pem;
}