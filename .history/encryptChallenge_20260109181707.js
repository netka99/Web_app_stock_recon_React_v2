import fs from 'fs';
import crypto from 'crypto';

// 1️⃣ Wczytaj certyfikat PEM KSeF
const certPem = fs.readFileSync('ksef_pub.pem', 'utf-8');
const x509 = new crypto.X509Certificate(certPem);
const publicKey = x509.publicKey;
// 2️⃣ Twój token testowy ze strony
const token = "20260109-EC-2DB8864000-5F61576CD0-98|nip-8442120248|9ac419949b82451bb26fe97da7227033c52d6f245f1a4f4a984c6048ed119b1f"; 

// 3️⃣ Aktualny timestamp w milisekundach
const timestamp = 1767965895051;

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
