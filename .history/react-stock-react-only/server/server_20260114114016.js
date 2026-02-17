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
    console.log('--- 1. STARTING KSeF AUTHENTICATION ---')
    console.log('Target NIP:', process.env.KSEF_NIP)
    const challengeRes = await axios.post(`${KSEF_URL}/auth/challenge`, {
      identifier: { type: 'nip', value: process.env.KSEF_NIP },
    })

    const { challenge, timestampMs } = challengeRes.data
    console.log('--- 2. CHALLENGE RECEIVED ---')
    console.log('Challenge String:', challenge)
    console.log('ISO Timestamp from MF:', timestampMs)

    const encryptToken = encryptedToken(process.env.KSEF_TOKEN, timestampMs)
    console.log('--- 3. ENCRYPTION COMPLETE ---')
    console.log('Encrypted Token (Base64 Preview):', encryptedToken)

    console.log('--- 4. SENDING INIT SESSION REQUEST ---')
    const initRes = await axios.post(`${KSEF_URL}/auth/ksef-token`, {
      challenge: challenge,
      contextIdentifier: { type: 'nip', value: process.env.KSEF_NIP },
      encryptedToken: encryptToken,
    })
    console.log('--- 5. SUCCESS! ---')
    console.log('Session Token Received:', initRes.data.authenticationToken.token)
    console.log('Session Number:', initRes.data.referenceNumber)

    res.json({
      success: true,
      sessionToken: initRes.data.authenticationToken.token,
      sessionNumber: initRes.data.referenceNumber,
    })
  } catch (error) {
    console.log('--- !!! ERROR DETECTED !!! ---')
    console.error('KSef Error Details:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'KSeF Login Failed',
      details: error.response?.data,
    })
  }
})

app.get('/api/ksef/invoices', async (req, res) => {
  const sessionToken = req.headers['session-token']
  if (!sessionToken) {
    return res.status(401).json({ error: 'Missing Session Token in headers' })
  }
  try {
    const response = await axios.post(
      `${KSEF_URL}/online/Query/Invoice/Sync?PageSize=10&PageOffset=0`,
      {
        queryCriteria: {
          subjectType: 'subject1', // Mandatory: Represents the taxpayer
          type: 'incremental', // More stable than "all" in V2
          acquisitionTimestampThresholdFrom: '2024-01-01T00:00:00+00:00',
          acquisitionTimestampThresholdTo: '2026-01-14T23:59:59+00:00',
        },
      },
      {
        headers: { SessionToken: sessionToken },
      },
    )
    res.json(response.data)
  } catch (error) {
    console.error('Invoice Query Error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'KSeF Query Failed',
      details: error.response?.data,
    })
  }
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 KSeF Backend running on http://localhost:${PORT}`)
})
