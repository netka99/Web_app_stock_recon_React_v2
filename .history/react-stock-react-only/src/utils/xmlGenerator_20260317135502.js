import Big from 'big.js'

export function generateFA3Invoice(invoiceData) {
  const escapeXml = (str) => {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  const formatAmount = (amount) => {
    return amount.toFixed(2)
  }

  const checkedProducts = invoiceData.products.filter((p) => p.checked)

  // 1. Calculate Totals for P_13/P_14 mapping
  let totalGrossAll = Big(0)
  const vatSummary = {
    8: { net: Big(0), vat: Big(0) },
    23: { net: Big(0), vat: Big(0) },
  }

  checkedProducts.forEach((product) => {
    totalGrossAll = totalGrossAll.plus(product.totalGross)
    const rate = product.vat.toString()
    if (vatSummary[rate]) {
      vatSummary[rate].net = vatSummary[rate].net.plus(product.totalNet)
      vatSummary[rate].vat = vatSummary[rate].vat.plus(
        Big(product.totalGross).minus(product.totalNet),
      )
    }
  })

  // 2. Generate VAT Summary Tags (Aligned with P_13_x schema)
  let vatFieldsXml = ''
  if (vatSummary['8'].net.gt(0)) {
    vatFieldsXml += `\n    <P_13_2>${formatAmount(vatSummary['8'].net.toNumber())}</P_13_2>\n    <P_14_2>${formatAmount(vatSummary['8'].vat.toNumber())}</P_14_2>`
  }
  if (vatSummary['23'].net.gt(0)) {
    vatFieldsXml += `\n    <P_13_1>${formatAmount(vatSummary['23'].net.toNumber())}</P_13_1>\n    <P_14_1>${formatAmount(vatSummary['23'].vat.toNumber())}</P_14_1>`
  }

  // 3. Generate Line Items (FaWiersz)
  let productsXml = ''
  checkedProducts.forEach((product, index) => {
    productsXml += `
    <FaWiersz>
      <NrWierszaFa>${index + 1}</NrWierszaFa>
      <P_7>${escapeXml(product.productName)}</P_7>
      <P_8A>${escapeXml(product.units)}</P_8A>
      <P_8B>${formatAmount(product.quantity)}</P_8B>
      <P_9B>${formatAmount(product.grossPrice)}</P_9B>
      <P_11A>${formatAmount(product.totalGross)}</P_11A>
      <P_12>${product.vat}</P_12>
    </FaWiersz>`
  })

  // 4. Podmiot3 Alignment (Sequence: DaneIdentyfikacyjne -> Adres -> Rola)
  let podmiot3Xml = ''
  if (invoiceData.buyer_data?.hasPodmiot3 && invoiceData.buyer_data?.podmiot3) {
    const p3 = invoiceData.buyer_data.podmiot3
    podmiot3Xml = `
  <Podmiot3>
    <DaneIdentyfikacyjne>
      <IDWew>${escapeXml(p3.idWew)}</IDWew>
      <Nazwa>${escapeXml(p3.nazwa)}</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>${escapeXml(p3.addressL1)}</AdresL1>
      <AdresL2>${escapeXml(p3.addressL2)}</AdresL2>
    </Adres>
    <Rola>${escapeXml(p3.rola || '2')}</Rola>
  </Podmiot3>`
  }

  // 5. Build Final XML
  return `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <Naglowek>
    <KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza>
    <WariantFormularza>3</WariantFormularza>
    <DataWytworzeniaFa>${new Date().toISOString().split('.')[0] + 'Z'}</DataWytworzeniaFa>
    <SystemInfo>Stock Recon App v1.0</SystemInfo>
  </Naglowek>
  <Podmiot1>
    <DaneIdentyfikacyjne>
      <NIP>8442120248</NIP>
      <Nazwa>SK</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>ul. ulica 24/1</AdresL1>
      <AdresL2>11-500 Gdzieś</AdresL2>
    </Adres>
  </Podmiot1>
  <Podmiot2>
    <DaneIdentyfikacyjne>
      <NIP>${escapeXml(invoiceData.buyer_data?.nip)}</NIP>
      <Nazwa>${escapeXml(invoiceData.buyer_data?.nazwa)}</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>${escapeXml(invoiceData.buyer_data?.addressL1)}</AdresL1>
      <AdresL2>${escapeXml(invoiceData.buyer_data?.addressL2)}</AdresL2>
    </Adres>
    <JST>2</JST>
    <GV>2</GV>
  </Podmiot2>${podmiot3Xml}
  <Fa>
    <KodWaluty>PLN</KodWaluty>
    <P_1>${formatDate(invoiceData.invoiceDate)}</P_1>
    <P_1M>${escapeXml(invoiceData.city || 'Warszawa')}</P_1M>
    <P_2>${escapeXml(invoiceData.invoiceNumber)}</P_2>
    <P_6>${formatDate(invoiceData.endSaleDate)}</P_6>${vatFieldsXml}
    <P_15>${formatAmount(totalGrossAll.toNumber())}</P_15>
    <Adnotacje>
      <P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A>
      <Zwolnienie><P_19N>1</P_19N></Zwolnienie>
      <NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu>
      <P_23>2</P_23>
      <PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy>
    </Adnotacje>
    <RodzajFaktury>VAT</RodzajFaktury>${productsXml}
    <Platnosc>
      <TerminPlatnosci>
        <Termin>${formatDate(invoiceData.paymentDate)}</Termin>
      </TerminPlatnosci>
      <FormaPlatnosci>${invoiceData.paymentType === 'Gotówka' ? '1' : '6'}</FormaPlatnosci>
    </Platnosc>
  </Fa>
</Faktura>`
}
