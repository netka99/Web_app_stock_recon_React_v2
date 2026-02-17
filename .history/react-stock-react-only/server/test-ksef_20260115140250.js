import axios from 'axios'

const BASE = 'http://localhost:5000'

const run = async () => {
  try {
    console.log('\n=== 1. START LOGIN ===')
    const login = await axios.post(`${BASE}/api/ksef/login`)

    // Zmieniamy accessToken na sessionToken, zgodnie z tym co zwraca serwer
    const { referenceNumber, sessionToken } = login.data
    console.log('✅ Login Response:', login.data)

    if (!sessionToken) {
      throw new Error('Nie otrzymano sessionToken! Sprawdź konsolę serwera.')
    }

    console.log('\n=== 2. CHECK STATUS ===')
    // Zmiana na GET oraz przekazanie ref w URL
    // Zmieniamy endpoint na /api/ksef/status, aby był spójny
    const status = await axios.get(`${BASE}/api/ksef/status/${referenceNumber}`, {
      headers: {
        // Przesyłamy token w nagłówku oczekiwanym przez Twój serwer
        'session-token': sessionToken,
      },
    })

    console.log('✅ Status Response:')
    console.log(JSON.stringify(status.data, null, 2))
  } catch (err) {
    console.error('\n❌ TEST FAILED:')
    const errorMsg = err.response?.data || err.message
    console.error(JSON.stringify(errorMsg, null, 2))
  }
}

run()
