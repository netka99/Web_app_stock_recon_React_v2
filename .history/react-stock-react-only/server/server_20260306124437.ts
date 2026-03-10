import express, { Request, Response } from 'express'
import cors from 'cors'
import { Buffer } from 'buffer'
import { generateFA3Invoice } from './xmlGenerator.js'
import { validateInvoiceData } from './invoiceValidator.js'
import type { InvoiceData, ValidationResult } from './types.js'

const app = express()
const PORT = 5000

// Configuration
const NIP = '8442120248'
const PASSPHRASE = 'Jaksiemasz123!!'
const KSEF_API_URL = 'http://localhost:8000/invoices'

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// ===== NOWY ENDPOINT: Walidacja faktury =====
app.post('/api/validate-invoice', (req: Request, res: Response) => {
  try {
    const invoiceData = req.body as InvoiceData
    const validation: ValidationResult = validateInvoiceData(invoiceData)

    res.json(validation)
  } catch (error) {
    console.error('Validation error:', error)
    res.status(500).json({
      isValid: false,
      errors: ['Błąd walidacji: ' + (error as Error).message],
      warnings: [],
    })
  }
})

// Endpoint to send invoice to KSeF
app.post('/api/send-ksef-invoice', async (req: Request, res: Response) => {
  try {
    console.log('📥 Received invoice data from React')
    const invoiceData = req.body

    // Validate required fields
    if (!invoiceData.invoiceNumber || !invoiceData.products) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: invoiceNumber or products',
      })
    }

    console.log('📄 Generating FA(3) XML...')
    const invoiceXML = generateFA3Invoice(invoiceData)

    // Save XML to file for debugging
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    // Create filename from invoice number (replace / with -)
    const safeFilename = invoiceData.invoiceNumber.replace(/\//g, '-')
    const xmlFilePath = path.join(__dirname, `${safeFilename}.xml`)
    fs.writeFileSync(xmlFilePath, invoiceXML, 'utf-8')
    console.log(`✅ XML saved to: ${xmlFilePath}`)

    // Also save as last-generated for easy access
    const lastFilePath = path.join(__dirname, 'last-generated-invoice.xml')
    fs.writeFileSync(lastFilePath, invoiceXML, 'utf-8')

    console.log('🔐 Encoding to base64...')
    const invoiceBase64 = Buffer.from(invoiceXML, 'utf-8').toString('base64')

    // Prepare payload for KSeF API
    const payload = {
      passphrase: PASSPHRASE,
      invoice: invoiceBase64,
      nip: NIP,
    }

    console.log('📤 Sending to KSeF API...')
    const ksefResponse = await fetch(KSEF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const contentType = ksefResponse.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      const ksefData = await ksefResponse.json()

      if (ksefResponse.ok) {
        console.log('✅ Invoice sent successfully to KSeF')
        const referenceNumber =
          ksefData.outcome?.referenceNumber || ksefData.referenceNumber

        res.json({
          success: true,
          referenceNumber: referenceNumber,
          message: 'Invoice sent to KSeF successfully',
          ksefResponse: ksefData,
        })
      } else {
        console.log('❌ KSeF API returned error')
        res.status(ksefResponse.status).json({
          success: false,
          error: 'KSeF API error',
          details: ksefData,
        })
      }
    } else {
      const errorText = await ksefResponse.text()
      console.log('❌ KSeF API returned non-JSON response')
      res.status(ksefResponse.status).json({
        success: false,
        error: 'KSeF API returned invalid response',
        details: errorText.substring(0, 500),
      })
    }
  } catch (error) {
    console.error('❌ Error processing invoice:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   KSeF endpoint: http://localhost:${PORT}/api/send-ksef-invoice`)
})
