import { encryptedToken } from './auth.js'
import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import process from 'node:process'
import { generateFA3Invoice } from './xmlGenerator.js'

const app = express()
app.use(cors())
app.use(express.json())

const KSEF_URL = 'https://api-test.ksef.mf.gov.pl/v2'

// KROK 1 & 2: Challenge i Inicjalizacja
app.post('/api/ksef/login', async (req, res) => {
  try {
    const challengeRes = await axios.post(`${KSEF_URL}/auth/challenge`, {
      identifier: { type: 'nip', value: process.env.KSEF_NIP },
    })
    const { challenge, timestampMs } = challengeRes.data

    const encrypted = encryptedToken(process.env.KSEF_TOKEN, timestampMs)

    const authRes = await axios.post(`${KSEF_URL}/auth/ksef-token`, {
      challenge,
      contextIdentifier: { type: 'nip', value: process.env.KSEF_NIP },
      encryptedToken: encrypted,
    })

    res.json({
      success: true,
      sessionToken: authRes.data.authenticationToken.token,
      referenceNumber: authRes.data.referenceNumber,
    })
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message)
    res.status(500).json(error.response?.data)
  }
})

// KROK 3: Sprawdzenie statusu uwierzytelniania (Asynchroniczne)
app.get('/api/ksef/auth-status/:ref', async (req, res) => {
  const { ref } = req.params
  const token = req.headers['session-token']

  try {
    const response = await axios.get(`${KSEF_URL}/auth/${ref}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Tutaj musi być Bearer!
        Accept: 'application/json',
      },
    })
    res.json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data)
  }
})

// KROK 4: Status sesji Online (Gdy krok 3 zakończy się sukcesem)
app.get('/api/ksef/status/:ref', async (req, res) => {
  const { ref } = req.params
  const token = req.headers['session-token']

  try {
    const response = await axios.get(`${KSEF_URL}/online/Session/Status/${ref}`, {
      headers: {
        SessionToken: token, // Tutaj musi być SessionToken!
        Accept: 'application/json',
      },
    })
    res.json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data)
  }
})

app.listen(5000, () => console.log('🚀 Serwer KSeF na porcie 5000'))
