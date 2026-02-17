import fs from 'fs'
import crypto from 'crypto'

export const encryptetToken = (token, timestamp) => {
  const publicKey = fs.readFileSync('./publicKey.pem', 'utf-8')
  const dataToEncrypt = `${token}|${timestamp}`
}
