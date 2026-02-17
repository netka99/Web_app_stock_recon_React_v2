import crypto from 'crypto'
import fs from 'fs'

export const encryptedToken = (token, timestamp) => {
  // Upewnij się, że plik publicKey.pem jest w tym samym folderze
  const certPem = fs.readFileSync('publicKey.pem', 'utf-8')

  const dataToEncrypt = `${token}|${timestamp}`

  // Kluczowe: używamy nowocześniejszego podejścia do szyfrowania RSA
  const encrypted = crypto.publicEncrypt(
    {
      key: certPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
      // TO JEST CZĘSTO POMIJANY ELEMENT, KTÓRY POWODUJE BŁĘDY
      oaepMgf1Hash: 'sha256',
    },
    Buffer.from(dataToEncrypt),
  )

  return encrypted.toString('base64')
}
