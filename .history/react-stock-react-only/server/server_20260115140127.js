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

/**
 * LOGIN DO KSEF (TOKEN FLOW)
 */
app.post('/api/ksef/login', async (req, res) => {
  try {
    console.log('--- 1. CHALLENGE ---')
    const challengeRes = await axios.post(`${KSEF_URL}/auth/challenge`, {
      identifier: { type: 'nip', value: process.env.KSEF_NIP },
    })

    const { challenge, timestampMs } = challengeRes.data

    // Szyfrowanie (Twoja funkcja auth.js jest poprawna!)
    const encrypted = encryptedToken(process.env.KSEF_TOKEN, timestampMs)

    console.log('--- 2. INIT SESSION ---')
    const authRes = await axios.post(`${KSEF_URL}/auth/ksef-token`, {
      challenge,
      contextIdentifier: { type: 'nip', value: process.env.KSEF_NIP },
      encryptedToken: encrypted,
    })

    // TO JEST KLUCZ DO TWOJEJ SESJI
    const sessionToken = authRes.data.authenticationToken.token
    const referenceNumber = authRes.data.referenceNumber

    console.log('🚀 SESSION OPENED:', referenceNumber)

    res.json({
      success: true,
      sessionToken, // Używaj tego w Headers jako "SessionToken"
      referenceNumber, // Używaj tego w URL statusu
    })
  } catch (error) {
    console.error('LOGIN ERROR:', error.response?.data || error.message)
    res.status(500).json({ success: false, details: error.response?.data })
  }
})

/**
 * STATUS SESJI (Poprawny GET Flow)
 */
app.get('/api/ksef/status/:ref', async (req, res) => {
  const { ref } = req.params
  const sessionToken = req.headers['session-token'] // Odbieramy z frontendu

  try {
    const response = await axios.get(`${KSEF_URL}/online/Session/Status/${ref}`, {
      headers: {
        SessionToken: sessionToken, // Nagłówek bez "Bearer"!
        Accept: 'application/json',
      },
    })

    res.json({ success: true, status: response.data })
  } catch (error) {
    console.error('STATUS ERROR:', error.response?.data)
    res.status(401).json({ success: false, error: 'Session Invalid' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 KSeF Backend running on http://localhost:${PORT}`)
})
