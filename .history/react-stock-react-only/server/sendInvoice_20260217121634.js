import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Buffer } from 'buffer'
import process from 'process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const INVOICE_FILE = 'test-invoice.xml'
const NIP = '8442120248' // Your seller NIP
const PASSPHRASE = 'Jaksiemasz123!!'
const API_URL = 'http://localhost:8000/invoices'
const STATUS_URL = 'http://localhost:8000/api/online/Session/Status'
const POLL_INTERVAL = 3000 // 3 seconds
const MAX_ATTEMPTS = 10 // Maximum 10 attempts (30 seconds total)

// Helper function to wait
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Function to check invoice status
async function checkInvoiceStatus(referenceNumber, attempt = 1) {
  console.log(`\n🔍 Checking status (attempt ${attempt}/${MAX_ATTEMPTS})...`)

  try {
    const response = await fetch(`${STATUS_URL}/${referenceNumber}`)
    const data = await response.json()

    console.log(`📦 Status Response:`, JSON.stringify(data, null, 2))

    // Check if we have KSeF number
    if (data.ksefNumber || data.invoiceNumber || data.elementReferenceNumber) {
      console.log('\n🎉 Invoice processed successfully!')
      console.log(
        `📋 KSeF Number: ${data.ksefNumber || data.invoiceNumber || data.elementReferenceNumber}`,
      )
      return true
    }

    // Check if still processing
    if (data.processingStatus === 'Processing' || data.status === 'Processing') {
      console.log('⏳ Invoice is still being processed...')

      if (attempt < MAX_ATTEMPTS) {
        console.log(`⏱️  Waiting ${POLL_INTERVAL / 1000} seconds before next check...`)
        await sleep(POLL_INTERVAL)
        return checkInvoiceStatus(referenceNumber, attempt + 1)
      } else {
        console.log('\n⚠️  Maximum attempts reached. Check status manually.')
        console.log(`   Use: GET ${STATUS_URL}/${referenceNumber}`)
        return false
      }
    }

    // If we get here, status is unknown
    console.log('⚠️  Unknown status received')
    return false
  } catch (error) {
    console.error(`❌ Error checking status: ${error.message}`)
    return false
  }
}

console.log('📄 Reading invoice XML file...')
const invoicePath = path.join(__dirname, INVOICE_FILE)

// Check if file exists
if (!fs.existsSync(invoicePath)) {
  console.error(`❌ File not found: ${INVOICE_FILE}`)
  console.log('Please make sure test-invoice.xml exists in the server folder')
  process.exit(1)
}

const invoiceXML = fs.readFileSync(invoicePath, 'utf-8')

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

        // Check if we have referenceNumber
        const referenceNumber = data.outcome?.referenceNumber || data.referenceNumber

        if (referenceNumber) {
          console.log(`📋 Reference Number: ${referenceNumber}`)
          console.log('\n⏱️  Waiting 2 seconds before checking status...')
          await sleep(2000) // Wait 2 seconds before first check
          await checkInvoiceStatus(referenceNumber)
        } else {
          console.log('⚠️  No reference number received')
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
