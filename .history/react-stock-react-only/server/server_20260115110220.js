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
    console.log('--- 1. STARTING KSeF AUTHENTICATION ---')
    console.log('Target NIP:', process.env.KSEF_NIP)
    const challengeRes = await axios.post(`${KSEF_URL}/auth/challenge`, {
      identifier: { type: 'nip', value: process.env.KSEF_NIP },
    })

    const { challenge, timestampMs } = challengeRes.data
    console.log('--- 2. CHALLENGE RECEIVED ---')
    console.log('Challenge String:', challenge)
    console.log('ISO Timestamp from MF:', timestampMs)

    const encrypted = encryptedToken(process.env.KSEF_TOKEN, timestampMs)
    console.log('--- 3. ENCRYPTION COMPLETE ---')
    console.log('Encrypted Token (Base64 Preview):', encrypted)

    console.log('--- 4. AUTH KSEF TOKEN ---')
    const authRes = await axios.post(`${KSEF_URL}/auth/ksef-token`, {
      challenge,
      contextIdentifier: { type: 'nip', value: process.env.KSEF_NIP },
      encryptedToken: encrypted,
    })

    const authToken = authRes.data.authenticationToken.token
    const referenceNumber = authRes.data.referenceNumber
    console.log('authenticationToken OK')

    console.log('Session Token Received:', authRes.data.authenticationToken.token)
    console.log('Session Number:', authRes.data.referenceNumber)

    // 🔥 WYMIANA NA ACCESS TOKEN (KLUCZOWE)
    const accessRes = await axios.post(
      `${KSEF_URL}/auth/access-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    )
    const accessToken = accessRes.data.accessToken
    console.log('accessToken OK')
    res.json({
      success: true,
      referenceNumber,
      accessToken,
    })
  } catch (error) {
    console.log('--- !!! ERROR DETECTED !!! ---')
    console.error('LOGIN ERROR:', JSON.stringify(error.response?.data, null, 2))
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    })
  }
})

/**
 * STATUS SESJI – KSEF 2.0
 */
app.get('/api/ksef/status', async (req, res) => {
  const { ref } = req.query
  const accessToken = req.headers.authorization?.replace('Bearer ', '')

  if (!ref || !accessToken) {
    return res.status(400).json({
      error: 'Missing referenceNumber or accessToken',
    })
  }

  try {
    const statusRes = await axios.get(`${KSEF_URL}/online/Session/Status`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    res.json({
      success: true,
      status: statusRes.data,
    })
  } catch (error) {
    console.error('STATUS ERROR:', JSON.stringify(error.response?.data, null, 2))
    res.status(error.response?.status || 500).json({
      success: false,
      error:
        error.response?.data?.exception?.exceptionDetailList?.[0]?.description ||
        'Session invalid',
    })
  }
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 KSeF Backend running on http://localhost:${PORT}`)
})
