const fs = require('fs');
const crypto = require('crypto');

const ecdh = crypto.createECDH('secp521r1');
ecdh.generateKeys('base64');
const privateKey = ecdh.getPrivateKey('base64');
const publicKey = ecdh.getPublicKey('base64');
var privateKeyPEM = convertPrivateKeyToPEM(privateKey);
var publicKeyPEM = convertPublicKeyToPEM(publicKey);

fs.writeFileSync('./private_key.pem', privateKeyPEM, 'utf-8');
fs.writeFileSync('./public_key.pem', publicKeyPEM, 'utf-8');

console.log(privateKeyPEM);
console.log(publicKeyPEM);

//const privateKeyPEM2 = fs.readFileSync('private_key.pem', 'utf-8');
//const publicKeyPEM2 = fs.readFileSync('public_key.pem', 'utf-8');
//console.log(privateKeyPEM2);
//console.log(publicKeyPEM2);

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