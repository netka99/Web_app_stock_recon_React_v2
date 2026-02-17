import fs from 'fs';
import crypto from 'crypto';

// 1️⃣ Wczytaj certyfikat PEM KSeF
const certPem = fs.readFileSync('ksef_pub.pem', 'utf-8');
const x509 = new crypto.X509Certificate(certPem);
const publicKey = x509.publicKey;
// 2️⃣ Twój token testowy ze strony
const token = "ebfb04a180eb462591f59c232525aa90710f93c805c9414d9524478240a9384a"; 

// 3️⃣ Aktualny timestamp w milisekundach
const timestamp = 1768209002120;

// 4️⃣ Połącz token z timestampem
const plaintext = `${token}|${timestamp}`;


// 6️⃣ Szyfruj RSA-OAEP SHA-256
const encrypted = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  Buffer.from(plaintext, "utf8")
);

// 7️⃣ Base64 wynik
console.log("encryptedChallenge:");
console.log(encrypted.toString("base64"));
