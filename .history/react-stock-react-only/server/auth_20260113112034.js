import fs from 'fs'
import crypto from 'crypto'

const publicKey = fs.readFileSync('./publicKey.pem', 'utf-8')
