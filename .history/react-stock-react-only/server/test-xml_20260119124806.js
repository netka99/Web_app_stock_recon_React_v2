import { generateFA3Invoice } from './xmlGenerator.js'
import fs from 'fs'

// Sample invoice data (matching your React structure)
const sampleInvoice = {
  invoiceNumber: 'FV 001/01/2026',
  invoiceDate: '2026-01-19',
  endSaleDate: '2026-01-19',
  shopName: 'Test Sklep Spożywczy',
  address: 'ul. Testowa 123\n00-001 Warszawa\nPolska',
  buyerNIP: '1234567890', // TODO: Add this field to React!

  products: [
    {
      checked: true,
      productName: 'Ciepłe gotowane kartacze',
      units: 'szt.',
      quantity: 10,
      netPrice: 9.26, // 10.00 / 1.08
      vat: 8,
      totalNet: 92.6,
      totalGross: 100.0,
    },
    {
      checked: true,
      productName: 'Ciepła babka ziemniaczana',
      units: 'kg',
      quantity: 2.5,
      netPrice: 18.52,
      vat: 8,
      totalNet: 46.3,
      totalGross: 50.0,
    },
    {
      checked: false, // This one should NOT appear in XML
      productName: 'Ciepła kiszka',
      units: 'kg',
      quantity: 1,
      netPrice: 20.0,
      vat: 8,
      totalNet: 20.0,
      totalGross: 21.6,
    },
  ],
}

// Generate XML
console.log('🧪 Testing XML Generator...\n')
const xml = generateFA3Invoice(sampleInvoice)

// Save to file
const filename = 'test-invoice.xml'
fs.writeFileSync(filename, xml, 'utf-8')

console.log('✅ XML Generated successfully!')
console.log(`📄 Saved to: ${filename}`)
console.log('\n--- XML Content ---')
console.log(xml)
console.log('-------------------')
