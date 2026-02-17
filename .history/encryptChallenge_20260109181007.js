import fs from 'fs';
import crypto from 'crypto';

// 1️⃣ Wczytaj certyfikat PEM KSeF
const certPem = fs.readFileSync('ksef_pub.pem', 'utf-8');

// 2️⃣ Twój token testowy ze strony
const token = "TWÓJ_TEST_TOKEN"; 

// 3️⃣ Aktualny timestamp w milisekundach
const timestamp = Date.now();

// 4️⃣ Połącz token z timestampem
const plaintext = `${token}|${timestamp}`;

// 5️⃣ Utwórz obiekt public key
const publicKey = crypto.createPublicKey(certPem);

// 6️⃣ Szyfruj RSA-OAEP SHA-256
const encrypted = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  Buffer.from(plaintext)
);

// 7️⃣ Base64 wynik
const encryptedBase64 = encrypted.toString('base64');

console.log("Zaszyfrowany challenge (base64):");
console.log(encryptedBase64);
