import fs from 'fs'
import crypto from 'crypto'

export const encryptetToken = (token, timestamp) => {
  const publicKey = fs.readFileSync('./publicKey.pem', 'utf-8')
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
}
