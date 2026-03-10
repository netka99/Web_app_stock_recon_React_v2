import { Buffer } from 'buffer'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const NIP = '8442120248' // Your seller NIP
const PASSPHRASE = 'Jaksiemasz123!!'
const API_URL = 'http://localhost:8000/invoices'

console.log('📄 Reading last generated invoice XML...')
const invoiceXML = readFileSync(join(__dirname, 'last-generated-invoice.xml'), 'utf-8')

console.log('🔐 Encoding invoice to base64...')
const invoiceBase64 = Buffer.from(invoiceXML, 'utf-8').toString('base64')

console.log('✅ Invoice encoded:')
console.log(`   Length: ${invoiceBase64.length} characters`)
console.log(`   Preview: ${invoiceBase64.substring(0, 50)}...\n`)

// Prepare payload
const payload = {
  passphrase: PASSPHRASE,
  invoice: invoiceBase64,
  nip: NIP,
}

console.log('📤 Sending invoice to KSeF API...')
console.log(`   NIP: ${NIP}`)
console.log(`   Passphrase: ${PASSPHRASE}`)
console.log(`   API: ${API_URL}\n`)

// Send to API
fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then(async (response) => {
    console.log(`📡 Response Status: ${response.status}`)

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))

      if (response.ok) {
        console.log('\n✅ Invoice sent successfully!')
        if (data.referenceNumber) {
          console.log(`📋 Reference Number: ${data.referenceNumber}`)
        }
      } else {
        console.log('\n❌ Invoice submission failed!')
      }
    } else {
      const text = await response.text()
      console.log('📦 Response Text:', text)

      if (response.ok) {
        console.log('\n✅ Invoice sent successfully!')
      } else {
        console.log('\n❌ Invoice submission failed!')
      }
    }
  })
  .catch((error) => {
    console.error('\n❌ Error sending invoice:', error.message)
    console.log('\nMake sure:')
    console.log('1. The KSeF API is running on http://localhost:8000')
    console.log('2. You have uploaded the certificate first (run uploadCertificate.js)')
    console.log('3. The passphrase is correct')
  })
