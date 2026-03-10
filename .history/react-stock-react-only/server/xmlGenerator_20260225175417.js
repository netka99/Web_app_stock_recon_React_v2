import { create } from 'xmlbuilder2'

export function generateFA3Invoice(invoiceData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('Faktura', {
    xmlns: 'http://crd.gov.pl/wzor/2025/06/25/13775/',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
  })

  const naglowek = root.ele('Naglowek')
  naglowek
    .ele('KodFormularza', {
      kodSystemowy: 'FA (3)',
      wersjaSchemy: '1-0E',
    })
    .txt('FA')
  naglowek.ele('WariantFormularza').txt('3')
  naglowek.ele('DataWytworzeniaFa').txt(new Date().toISOString().split('.')[0] + 'Z')
  naglowek.ele('SystemInfo').txt('Stock Recon App v1.0')

  // ===== SELLER (Podmiot1) =====
  const podmiot1 = root.ele('Podmiot1')
  const daneSprzedawcy = podmiot1.ele('DaneIdentyfikacyjne')
  daneSprzedawcy.ele('NIP').txt('8442120248')
  daneSprzedawcy.ele('Nazwa').txt('Firma Testowa Sp. z o.o.')

  const adresSprzedawcy = podmiot1.ele('Adres')
  adresSprzedawcy.ele('KodKraju').txt('PL')
  adresSprzedawcy.ele('AdresL1').txt('ul. Testowa 1')
  adresSprzedawcy.ele('AdresL2').txt('00-001 Warszawa')

  // ===== BUYER (Podmiot2) =====
  const podmiot2 = root.ele('Podmiot2')
  const daneNabywcy = podmiot2.ele('DaneIdentyfikacyjne')

  daneNabywcy.ele('NIP').txt(invoiceData.buyer_data.nip || '')
  daneNabywcy.ele('Nazwa').txt(invoiceData.buyer_data.nazwa)

  const adresNabywcy = podmiot2.ele('Adres')
  adresNabywcy.ele('KodKraju').txt('PL')
  adresNabywcy.ele('AdresL1').txt(invoiceData.buyer_data.addressL1)
  adresNabywcy.ele('AdresL2').txt(invoiceData.buyer_data.addressL2)

  // podmiot2.ele('JST').txt('2')
  // podmiot2.ele('GV').txt('2')

  // ===== INVOICE HEADER (Fa) =====
  const fa = root.ele('Fa')
  fa.ele('KodWaluty').txt('PLN')
  fa.ele('P_1').txt(invoiceData.invoiceDate) // Invoice date
  fa.ele('P_1M').txt('Warszawa') // City of issuance
  fa.ele('P_2').txt(invoiceData.invoiceNumber) // Invoice number
  // P_6 (sale date) is NOT required for FA(3) - removed

  // ===== TOTALS =====
  const totals = calculateTotals(invoiceData.products)
  // Dynamiczne przypisanie do pól w zależności od stawki (uproszczone dla 8%)
  // Jeśli masz różne stawki, musisz tu dodać logikę rozdzielającą
  fa.ele('P_13_2').txt(totals.totalNet.toFixed(2)) // 8% Netto
  fa.ele('P_14_2').txt(totals.totalVat.toFixed(2)) // 8% VAT
  fa.ele('P_15').txt(totals.totalGross.toFixed(2))

  // ===== ADNOTACJE (Obowiązkowe w FA3) =====
  const adnotacje = fa.ele('Adnotacje')
  adnotacje.ele('P_16').txt('2') // Split payment
  adnotacje.ele('P_17').txt('2') // Self-billing
  adnotacje.ele('P_18').txt('2') // Reverse charge
  adnotacje.ele('P_18A').txt('2') // VAT margin
  adnotacje.ele('Zwolnienie').ele('P_19N').txt('1') // Exempt from VAT
  adnotacje.ele('NoweSrodkiTransportu').ele('P_22N').txt('1') // New means of transport
  adnotacje.ele('P_23').txt('2') // Simplification procedures
  adnotacje.ele('PMarzy').ele('P_PMarzyN').txt('1') // Margin procedures

  fa.ele('RodzajFaktury').txt('VAT')

  // ===== INVOICE LINES (FaWiersze) =====
  invoiceData.products
    .filter((product) => product.checked)
    .forEach((product, index) => {
      const wiersz = fa.ele('FaWiersz')

      wiersz.ele('NrWierszaFa').txt(index + 1)
      wiersz.ele('P_7').txt(product.productName)
      wiersz.ele('P_8A').txt(product.units)
      wiersz.ele('P_8B').txt(product.quantity.toFixed(2))
      wiersz.ele('P_9A').txt(product.netPrice.toFixed(2))
      wiersz.ele('P_11').txt(product.totalNet.toFixed(2))
      wiersz.ele('P_12').txt(product.vat.toString())
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
