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
    // KROK 1: Challenge
    const challengeRes = await axios.post(`${KSEF_URL}/auth/challenge`, {
      identifier: { type: 'nip', value: process.env.KSEF_NIP },
    })
    const { challenge, timestampMs } = challengeRes.data

    // KROK 2: Szyfrowanie
    const encrypted = encryptedToken(process.env.KSEF_TOKEN, timestampMs)

    // KROK 3: Login (Init Session)
    const authRes = await axios.post(`${KSEF_URL}/auth/ksef-token`, {
      challenge,
      contextIdentifier: { type: 'nip', value: process.env.KSEF_NIP },
      encryptedToken: encrypted,
    })

    // KROK 4: Zwracamy dane sesji
    res.json({
      success: true,
      sessionToken: authRes.data.authenticationToken.token,
      referenceNumber: authRes.data.referenceNumber,
    })
  } catch (error) {
    console.error('BŁĄD KSEF:', error.response?.data || error.message)
    res.status(500).json({ success: false, error: error.response?.data })
  }
})

// Endpoint statusu sesji - METODA GET
app.get('/api/ksef/status/:ref', async (req, res) => {
  const { ref } = req.params
  const token = req.headers['session-token']

  try {
    const response = await axios.get(`${KSEF_URL}/online/Session/Status/${ref}`, {
      headers: { SessionToken: token },
    })
    res.json(response.data)
  } catch (error) {
    res.status(401).json(error.response?.data)
  }
})

app.listen(5000, () => console.log('🚀 Serwer gotowy na http://localhost:5000'))
