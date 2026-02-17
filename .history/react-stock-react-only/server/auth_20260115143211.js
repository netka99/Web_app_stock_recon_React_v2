import fs from 'fs'
import crypto from 'crypto'
import { Buffer } from 'node:buffer'

export const encryptedToken = (token, timestamp) => {
  const certPem = fs.readFileSync('publicKey.pem', 'utf-8')
  const dataToEncrypt = `${token}|${timestamp}`

  const encrypted = crypto.publicEncrypt(
    {
      key: certPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
      mgf1Hash: 'sha256', // Krytyczne dla Node.js
    },
    Buffer.from(dataToEncrypt),
  )

  return encrypted.toString('base64')
}
