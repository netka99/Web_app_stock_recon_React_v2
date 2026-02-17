import axios from 'axios'

const BASE = 'http://localhost:5000'

const run = async () => {
  try {
    console.log('\n--- 🚀 KROK 1: LOGOWANIE DO KSeF ---')
    // Wywołujemy Twój serwer Node.js
    const login = await axios.post(`${BASE}/api/ksef/login`)

    // Odbieramy dane sesji
    const { referenceNumber, sessionToken } = login.data

    if (!sessionToken || !referenceNumber) {
      console.error('❌ Błąd: Serwer nie zwrócił danych sesji.')
      console.log('Odpowiedź serwera:', login.data)
      return
    }

    console.log('✅ Zalogowano!')
    console.log(`🔹 Numer sesji (Ref): ${referenceNumber}`)
    console.log(`🔹 Token (skrót): ${sessionToken.substring(0, 20)}...`)

    // Mała pauza (1 sekunda), aby dać bramce KSeF czas na aktywację sesji
    console.log('\n--- ⏳ Czekam sekundę na aktywację sesji... ---')
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('\n--- 🔍 KROK 2: SPRAWDZANIE STATUSU SESJI ---')
    // Wysyłamy GET do Twojego serwera, przekazując Ref w adresie i Token w nagłówku
    const status = await axios.get(`${BASE}/api/ksef/status/${referenceNumber}`, {
      headers: {
        'session-token': sessionToken,
      },
    })

    console.log('✅ Odpowiedź z KSeF:')
    console.log(JSON.stringify(status.data, null, 2))

    if (status.data.processCode === 200) {
      console.log('\n✨ SUKCES! Sesja jest aktywna i gotowa do pracy.')
    }
  } catch (err) {
    console.error('\n❌ TEST PRZERWANY BŁĘDEM:')
    // Wyciągamy szczegółowy komunikat błędu
    const errorDetail = err.response?.data || err.message
    console.error(JSON.stringify(errorDetail, null, 2))
  }
}

run()
