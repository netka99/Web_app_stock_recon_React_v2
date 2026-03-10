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

  // JST i GV - zawsze wymagane w FA(3)
  podmiot2.ele('JST').txt('2') // 1=dotyczy JST, 2=nie dotyczy
  podmiot2.ele('GV').txt('2') // 1=dotyczy GV, 2=nie dotyczy

  // ===== RECIPIENT (Podmiot3) - Optional =====
  if (invoiceData.buyer_data.hasPodmiot3 && invoiceData.buyer_data.podmiot3) {
    const podmiot3 = root.ele('Podmiot3')

    const daneOdbiorcy = podmiot3.ele('DaneIdentyfikacyjne')
    // IDWew - identyfikator wewnętrzny (WIELKIE LITERY!)
    daneOdbiorcy.ele('IDWew').txt(invoiceData.buyer_data.podmiot3.idWew)
    daneOdbiorcy.ele('Nazwa').txt(invoiceData.buyer_data.podmiot3.nazwa)

    const adresOdbiorcy = podmiot3.ele('Adres')
    adresOdbiorcy.ele('KodKraju').txt('PL')
    adresOdbiorcy.ele('AdresL1').txt(invoiceData.buyer_data.podmiot3.addressL1)
    adresOdbiorcy.ele('AdresL2').txt(invoiceData.buyer_data.podmiot3.addressL2)

    // Rola MUSI być po Adres według schematu KSeF
    podmiot3.ele('Rola').txt(invoiceData.buyer_data.podmiot3.rola)
  }
  // ===== INVOICE HEADER (Fa) =====
  const fa = root.ele('Fa')
  fa.ele('KodWaluty').txt('PLN')
  fa.ele('P_1').txt(invoiceData.invoiceDate) // Invoice date
  fa.ele('P_1M').txt('Warszawa') // City of issuance
  fa.ele('P_2').txt(invoiceData.invoiceNumber) // Invoice number
  fa.ele('P_6').txt(invoiceData.endSaleDate) // Data zakończenia dostawy/usługi
  const okresF = fa.ele('OkresFa')
  okresF.ele('P_6_Od').txt(invoiceData.startDate)
  okresF.ele('P_6_Do').txt(invoiceData.endDate)

  // ===== TOTALS =====
  const totals = calculateTotals(invoiceData.products)

  // Mapowanie stawek VAT na pola KSeF
  const vatFieldMap = {
    23: { net: 'P_13_1', vat: 'P_14_1' },
    22: { net: 'P_13_1', vat: 'P_14_1' }, // Stara stawka 23%
    8: { net: 'P_13_2', vat: 'P_14_2' },
    7: { net: 'P_13_3', vat: 'P_14_3' },
    5: { net: 'P_13_4', vat: 'P_14_4' },
    4: { net: 'P_13_4', vat: 'P_14_4' }, // Stara stawka 5%
    3: { net: 'P_13_4', vat: 'P_14_4' }, // Stara stawka 5%
    0: { net: 'P_13_5', vat: 'P_14_5' },
  }

  // Dynamiczne dodawanie sum dla każdej stawki VAT
  Object.keys(totals.vatGroups).forEach((vatRate) => {
    const group = totals.vatGroups[vatRate]
    const fields = vatFieldMap[vatRate]

    if (fields) {
      fa.ele(fields.net).txt(group.totalNet.toFixed(2))
      fa.ele(fields.vat).txt(group.totalVat.toFixed(2))
    }
  })

  // P_15 - suma brutto całej faktury
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
      // Tylko P_9B (brutto) i P_11A (brutto) - bez P_9A i P_11 dla faktur brutto
      wiersz.ele('P_9B').txt(product.grossPrice.toFixed(2)) // Cena jednostkowa BRUTTO
      wiersz.ele('P_11A').txt(Math.round(product.totalGross)) // Wartość BRUTTO (zaokrąglona do pełnych groszy)
      wiersz.ele('P_12').txt(product.vat.toString())
    })

  // Convert to XML string
  return root.end({ prettyPrint: true })
}

function calculateTotals(products) {
  const vatGroups = {}
  let totalGross = 0

  products
    .filter((p) => p.checked)
    .forEach((product) => {
      const vatRate = product.vat

      if (!vatGroups[vatRate]) {
        vatGroups[vatRate] = {
          totalNet: 0,
          totalVat: 0,
          totalGross: 0,
        }
      }

      vatGroups[vatRate].totalNet += product.totalNet
      vatGroups[vatRate].totalGross += product.totalGross
      vatGroups[vatRate].totalVat += product.totalGross - product.totalNet

      totalGross += product.totalGross
    })

  return { vatGroups, totalGross }
}
