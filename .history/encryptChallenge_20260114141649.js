import fs from 'fs';
import crypto from 'crypto';

// 1️⃣ Wczytaj certyfikat PEM KSeF
const certPem = fs.readFileSync('ksef_pub.pem', 'utf-8');
const x509 = new crypto.X509Certificate(certPem);
const publicKey = x509.publicKey;
// 2️⃣ Twój token testowy ze strony
// token: 20260112-EC-27815F5000-763E27A24A-D4|nip-8442120248|aeda9df3acee417d9d769477a54782e5c77802ee411640cdbde0ebd821ebad2d
const token = "be03042e3a8f4eb68b1cde75fc57c6530839c6ecd58f46c482e50d5cce6429cf"; 

// 3️⃣ Aktualny timestamp w milisekundach
const timestamp = 1768396493968;

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
