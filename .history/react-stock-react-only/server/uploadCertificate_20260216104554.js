import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read certificate files
const certPath = path.join(__dirname, 'certificate', 'AnnTest.crt')
const keyPath = path.join(__dirname, 'certificate', 'AnnTest.key')

console.log('📄 Reading certificate files...')
const certContent = fs.readFileSync(certPath, 'utf-8')
const keyContent = fs.readFileSync(keyPath, 'utf-8')

// Encode to base64
console.log('🔐 Encoding to base64...')
const certBase64 = Buffer.from(certContent).toString('base64')
const keyBase64 = Buffer.from(keyContent).toString('base64')

console.log('\n✅ Certificate (base64):')
console.log(certBase64.substring(0, 50) + '...\n')

console.log('✅ Key (base64):')
console.log(keyBase64.substring(0, 50) + '...\n')

// Prepare payload
const payload = {
  certificate: certBase64,
  key: keyBase64,
}

console.log('📤 Sending to API...')

// Send to API
fetch('http://localhost:8000/user-certificate', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json', // Changed to JSON since we're sending JSON
  },
  body: JSON.stringify(payload),
})
  .then(async (response) => {
    console.log(`\n📡 Response Status: ${response.status}`)

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))
    } else {
      const text = await response.text()
      console.log('📦 Response Text:', text)
    }

    if (response.ok) {
      console.log('\n✅ Certificate uploaded successfully!')
    } else {
      console.log('\n❌ Upload failed!')
    }
  })
  .catch((error) => {
    console.error('\n❌ Error uploading certificate:', error.message)
  })
