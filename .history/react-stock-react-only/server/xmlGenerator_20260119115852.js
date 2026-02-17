import { create } from 'xmlbuilder2'

export function generateFA3Invoice(invoiceData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('Faktura', {
    xmlns: 'http://crd.gov.pl/wzor/2023/06/29/12648/',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  })

  const naglowek = root.ele('Naglowek')
  naglowek
    .ele('KodFormularza', {
      kodSystemowy: 'FA(3)',
      wersjaSchemy: '1-0E',
    })
    .txt('FA')
  naglowek.ele('WariantFormularza').txt('3')
  naglowek.ele('DataWytworzeniaFa').txt(new Date().toISOString())
  naglowek.ele('SystemInfo').txt('Stock Recon App v1.0')

  // ===== SELLER (Podmiot1) =====
  const podmiot1 = root.ele('Podmiot1')
  const daneSprzedawcy = podmiot1.ele('DaneIdentyfikacyjne')
  daneSprzedawcy.ele('NIP').txt('8442120248')
  daneSprzedawcy.ele('Nazwa').txt('SMACZNY KĄSEK -catering-Ewelina Radoń')

  const adresSprzedawcy = podmiot1.ele('Adres')
  adresSprzedawcy.ele('KodKraju').txt('PL')
  adresSprzedawcy.ele('AdresL1').txt('ul. Sejneńska 21/1')
  adresSprzedawcy.ele('AdresL2').txt('16-400 Suwałki')

  // ===== BUYER (Podmiot2) =====
  const podmiot2 = root.ele('Podmiot2')
  const daneNabywcy = podmiot2.ele('DaneIdentyfikacyjne')

  daneNabywcy.ele('NIP').txt(invoiceData.buyerNIP || '1234567890')
  daneNabywcy.ele('Nazwa').txt(invoiceData.shopName)

  const adresNabywcy = podmiot2.ele('Adres')
  adresNabywcy.ele('KodKraju').txt('PL')
  const addressLines = invoiceData.address.split('\n')
  adresNabywcy.ele('AdresL1').txt(addressLines[0] || '')
  adresNabywcy.ele('AdresL2').txt(addressLines[1] || '')
  adresNabywcy.ele('AdresL3').txt(addressLines[2] || '')

  // ===== INVOICE HEADER (Fa) =====
  const fa = root.ele('Fa')
  fa.ele('P_1').txt(invoiceData.invoiceDate) // Invoice date
  fa.ele('P_2').txt(invoiceData.invoiceNumber) // Invoice number
  fa.ele('P_6').txt(invoiceData.endSaleDate) // Sale date???

  const totals = calculateTotals(invoiceData.products)

  fa.ele('P_13_1').txt(totals.totalNet.toFixed(2))
  fa.ele('P_14_1').txt(totals.totalVat.toFixed(2))
  fa.ele('P_15').txt(totals.totalGross.toFixed(2))

  // ===== INVOICE LINES (FaWiersze) =====
  const faWiersze = root.ele('FaWiersze')
  invoiceData.products
    .filter((product) => product.checked)
    .forEach((product, index) => {
      const wiersz = faWiersze.ele('FaWiersz')

      wiersz.ele('NrWierszaFa').txt(index + 1)
      wiersz.ele('P_7').txt(product.productName)
      wiersz.ele('P_8A').txt(product.units)
      wiersz.ele('P_8B').txt(product.quantity)
      wiersz.ele('P_9A').txt(product.netPrice)
      wiersz.ele('P_11').txt(product.totalNet)
      wiersz.ele('P_12').txt(product.vat)
    })

  // Convert to XML string
  return root.end({ prettyPrint: true })
}

function calculateTotals(products) {
  let totalNet = 0
  let totalGross = 0

  products
    .filter((p) => p.checked)
    .forEach((product) => {
      totalNet += product.totalNet
      totalGross += product.totalGross
    })

  const totalVat = totalGross - totalNet

  return { totalNet, totalVat, totalGross }
}
