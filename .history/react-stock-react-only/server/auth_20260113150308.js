import fs from 'fs'
import crypto from 'crypto'
import { Buffer } from 'node:buffer'

export const encryptedToken = (token, timestamp) => {
  const certPem = fs.readFileSync('publicKey.pem', 'utf-8')
  const x509 = new crypto.X509Certificate(certPem)
  const publicKey = x509.publicKey
  const dataToEncrypt = `${token}|${timestamp}`

  const buffer = Buffer.from(dataToEncrypt)
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  )
  return encrypted.toString('base64')
}
