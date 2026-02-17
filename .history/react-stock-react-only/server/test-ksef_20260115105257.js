import axios from 'axios'

const BASE = 'http://localhost:5000'

const run = async () => {
  try {
    console.log('\n=== LOGIN ===')
    const login = await axios.post(`${BASE}/api/ksef/login`)
    console.log(login.data)

    const { referenceNumber, accessToken } = login.data

    console.log('\n=== STATUS ===')
    const status = await axios.get(`${BASE}/api/ksef/status?ref=${referenceNumber}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    console.log(JSON.stringify(status.data, null, 2))
  } catch (err) {
    console.error('ERROR:', JSON.stringify(err.response?.data || err.message, null, 2))
  }
}

run()
