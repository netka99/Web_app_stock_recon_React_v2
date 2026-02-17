import fs from 'fs'
import crypto from 'crypto'

const certificat = fs.readFileSync('publicKey.pem', 'utf-8')
