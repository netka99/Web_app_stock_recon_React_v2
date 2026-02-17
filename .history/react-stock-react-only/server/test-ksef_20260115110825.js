import axios from 'axios'

const BASE = 'http://localhost:5000'

const run = async () => {
  try {
    console.log('\n=== LOGIN ===')
    // 1️⃣ logowanie
    const login = await axios.post(`${BASE}/api/ksef/login`)
    console.log(login.data)

    const { referenceNumber, accessToken } = login.data

    console.log('\n=== STATUS ===')
    // 2️⃣ status sesji – POST, nie GET
    const status = await axios.post(
      `${BASE}/api/status`,
      { referenceNumber }, // w body
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // w header
        },
      },
    )

    console.log(JSON.stringify(status.data, null, 2))
  } catch (err) {
    console.error('ERROR:', JSON.stringify(err.response?.data || err.message, null, 2))
  }
}

run()
