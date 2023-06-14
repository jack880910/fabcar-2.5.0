// https://libraries.io/npm/ecdsa-secp256r1

const ECDSA = require('ecdsa-secp256r1'); // npm install --save ecdsa-secp256r1@1.3.3
const fs = require('fs');

var privateKey = ECDSA.generateKey();

var privateKeyPEM = privateKey.toPEM();
var publicKeyPEM = privateKey.asPublic().toPEM();

fs.writeFileSync('./key-store/private_key.pem', privateKeyPEM, 'utf-8');
fs.writeFileSync('./key-store/public_key.pem', publicKeyPEM, 'utf-8');

console.log(privateKeyPEM);
console.log(publicKeyPEM);