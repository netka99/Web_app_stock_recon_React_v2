import fs from 'fs';
import crypto from 'crypto';

// 1️⃣ Wczytaj certyfikat PEM KSeF
const certPem = fs.readFileSync('ksef_pub.pem', 'utf-8');
const x509 = new crypto.X509Certificate(certPem);
const publicKey = x509.publicKey;
// 2️⃣ Twój token testowy ze strony
const token = "20260109-EC-3C6A596000-D95C4497E1-90|nip-8442120248|a18536447bb349739a60e8cfaf9daa9bc9a2f465c25e47d9802599636197d9d0"; 

// 3️⃣ Aktualny timestamp w milisekundach
const timestamp = 1767980645586;

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
