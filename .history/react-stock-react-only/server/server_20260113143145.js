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
      challenge: challenge,
      contextIdentifier: { type: 'nip', value: process.env.KSEF_NIP },
      encryptedToken: encryptToken,
    })

    res.json({
      success: true,
      sessionTokenJWT: initRes.data.authenticationToken.token,
      sessionNumber: initRes.data.referenceNumber,
    })
  } catch (error) {
    console.error('KSef Error Details:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'KSeF Login Failed',
      details: error.response?.data,
    })
  }
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 KSeF Backend running on http://localhost:${PORT}`)
})
