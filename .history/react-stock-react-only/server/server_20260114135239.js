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

    const encryptedTokenResult = encryptedToken(process.env.KSEF_TOKEN, timestampMs)
    console.log('--- 3. ENCRYPTION COMPLETE ---')
    console.log(
      'Encrypted Token (Base64 Preview):',
      encryptedTokenResult.substring(0, 20) + '...',
    )

    console.log('--- 4. SENDING INIT SESSION REQUEST ---')
    const initRes = await axios.post(`${KSEF_URL}/auth/ksef-token`, {
      challenge: challenge,
      contextIdentifier: { type: 'nip', value: process.env.KSEF_NIP },
      encryptedToken: encryptedTokenResult, // Tu musi być string!
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

app.get('/api/ksef/download/:ksefNumber', async (req, res) => {
  const { ksefNumber } = req.params
  const sessionToken = req.headers['session-token']

  if (!sessionToken) return res.status(401).json({ error: 'Missing Token' })

  try {
    console.log(`--- DOWNLOADING INVOICE: ${ksefNumber} ---`)

    const response = await axios.get(
      `${KSEF_URL}/online/Query/Invoice/Get/${ksefNumber}`,
      {
        headers: { SessionToken: sessionToken },
        // Important: We want the raw XML data
        responseType: 'text',
      },
    )

    // This will send the XML content back to your browser/PowerShell
    res.header('Content-Type', 'application/xml')
    res.send(response.data)
  } catch (error) {
    console.error('Download Error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'Download Failed',
      details: error.response?.data,
    })
  }
})

app.get('/api/status', async (req, res) => {
  const sessionToken = req.headers['session-token']
  const sessionRef = req.query.ref // We'll pass it as ?ref=...

  try {
    const response = await axios.get(
      `https://api-test.ksef.mf.gov.pl/v2/online/Session/Status/${sessionRef}`,
      { headers: { SessionToken: sessionToken } },
    )
    res.json({ alive: true, data: response.data })
  } catch (error) {
    res.status(401).json({ alive: false, error: 'Session expired or invalid' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 KSeF Backend running on http://localhost:${PORT}`)
})
