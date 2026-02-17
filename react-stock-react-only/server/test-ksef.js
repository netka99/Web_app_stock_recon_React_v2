import axios from 'axios'

const BASE = 'http://localhost:5000'

const run = async () => {
  try {
    console.log('\n1️⃣ Logowanie...')
    const login = await axios.post(`${BASE}/api/ksef/login`)
    const { referenceNumber, sessionToken } = login.data
    console.log('✅ Otrzymano Ref:', referenceNumber)

    console.log('\n2️⃣ Oczekiwanie na weryfikację (Krok 3)...')
    let authenticated = false
    while (!authenticated) {
      const auth = await axios.get(`${BASE}/api/ksef/auth-status/${referenceNumber}`, {
        headers: { 'session-token': sessionToken },
      })

      const status = auth.data.completionStatus?.code
      console.log(
        `   Status: ${auth.data.completionStatus?.description || 'Przetwarzanie...'}`,
      )

      if (status === 200) {
        authenticated = true
        console.log('✅ Autoryzacja zakończona sukcesem!')
      } else if (status && status !== 200) {
        throw new Error(`Błąd autoryzacji: ${status}`)
      } else {
        await new Promise((r) => setTimeout(r, 2000)) // Czekaj 2s
      }
    }

    console.log('\n3️⃣ Sprawdzanie statusu sesji Online (Krok 4)...')
    const finalStatus = await axios.get(`${BASE}/api/ksef/status/${referenceNumber}`, {
      headers: { 'session-token': sessionToken },
    })

    console.log('✨ SESJA JEST AKTYWNA:')
    console.log(JSON.stringify(finalStatus.data, null, 2))
  } catch (err) {
    console.error('\n❌ BŁĄD:', err.response?.data || err.message)
  }
}

run()
