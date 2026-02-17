import { encryptedToken } from './auth.js'
import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import process from 'node:process'

const app = express()
app.use(cors())
app.use(express.json())

const KSEF_URL = 'https://api-test.ksef.mf.gov.pl/v2'

app.post('/api/ksef/login', async (req, res) => {
  try {
    const challengeRes = await axios.post(`${KSEF_URL}/auth/challenge`, {
      identifier: { type: 'nip', value: process.env.KSEF_NIP },
    })

    const { challenge, timestampMs } = challengeRes.data

    const encryptToken = encryptedToken(process.env.KSEF_TOKEN, timestampMs)

    const initRes = await axios.post(`${KSEF_URL}/auth/ksef-token`, {
      challenge: 'WYZWANIE_Z_KROKU_2',
      contextIdentifier: { type: 'nip', value: '8442120248' },
      encryptedToken: 'TWOJE_BASE64_Z_KROKU_3',
    })
  } catch (error) {
    console.log(error)
  }
})
