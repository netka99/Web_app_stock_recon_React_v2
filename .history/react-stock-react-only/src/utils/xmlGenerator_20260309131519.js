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

  // Pobierz zaznaczone produkty
  const checkedProducts = invoiceData.products.filter((p) => p.checked)

  // Grupuj produkty według stawki VAT i sortuj rosnąco
  const productsByVat = {}
  checkedProducts.forEach((product) => {
    const vatRate = product.vat
    if (!productsByVat[vatRate]) {
      productsByVat[vatRate] = []
    }
    productsByVat[vatRate].push(product)
  })

  const sortedVatRates = Object.keys(productsByVat)
    .map(Number)
    .sort((a, b) => a - b)

  // Buduj sekcję produktów
  let productsXml = ''
  let lp = 1

  sortedVatRates.forEach((vatRate) => {
    const products = productsByVat[vatRate]

    products.forEach((product) => {
      const totalNet = product.totalNet
      const totalGross = product.totalGross
      const vatAmount = totalGross - totalNet

      productsXml += `
    <Fa>
      <FaWiersz>
        <NrWierszaFa>${lp}</NrWierszaFa>
        <P_7>${escapeXml(product.productName)}</P_7>
        <P_8A>${escapeXml(product.units)}</P_8A>
        <P_8B>${formatAmount(product.quantity)}</P_8B>
        <P_9A>${formatAmount(product.grossPrice)}</P_9A>
        <P_11>${formatAmount(totalGross)}</P_11>
        <P_11Vat>${formatAmount(vatAmount)}</P_11Vat>
        <P_12>${vatRate}</P_12>
      </FaWiersz>
    </Fa>`

      lp++
    })
  })

  // Oblicz sumy dla każdej stawki VAT
  let vatSummaryXml = ''

  sortedVatRates.forEach((vatRate) => {
    const products = productsByVat[vatRate]

    let totalNetForVat = 0
    let totalVatForVat = 0

    products.forEach((product) => {
      const totalNet = product.totalNet
      const totalGross = product.totalGross
      totalNetForVat += totalNet
      totalVatForVat += totalGross - totalNet
    })

    vatSummaryXml += `
    <PodatekVAT>
      <P_12>${vatRate}</P_12>
      <P_13_1>${formatAmount(totalNetForVat)}</P_13_1>
      <P_14_1>${formatAmount(totalVatForVat)}</P_14_1>
    </PodatekVAT>`
  })

  // Oblicz sumy całkowite
  let totalNetAll = 0
  let totalVatAll = 0
  let totalGrossAll = 0

  checkedProducts.forEach((product) => {
    totalNetAll += product.totalNet
    totalGrossAll += product.totalGross
  })
  totalVatAll = totalGrossAll - totalNetAll

  // Warunkowo dodaj sekcję Podmiot3
  let podmiot3Xml = ''
  if (invoiceData.buyer_data?.hasPodmiot3 && invoiceData.buyer_data?.podmiot3) {
    const p3 = invoiceData.buyer_data.podmiot3
    podmiot3Xml = `
    <Podmiot3>
      <DaneIdentyfikacyjne>
        <Nazwa>${escapeXml(p3.nazwa)}</Nazwa>
        <Adres>
          <AdresL1>${escapeXml(p3.addressL1)}</AdresL1>
          <AdresL2>${escapeXml(p3.addressL2)}</AdresL2>
        </Adres>
      </DaneIdentyfikacyjne>
      <Rola>${escapeXml(p3.rola)}</Rola>
      <IDWew>${escapeXml(p3.idWew)}</IDWew>
    </Podmiot3>`
  }

  // Warunkowo dodaj P_6 lub OkresFa
  let dateRangeXml = ''
  if (invoiceData.startDate && invoiceData.endDate) {
    dateRangeXml = `
    <OkresFa>
      <P_6_Od>${formatDate(invoiceData.startDate)}</P_6_Od>
      <P_6_Do>${formatDate(invoiceData.endDate)}</P_6_Do>
    </OkresFa>`
  } else {
    dateRangeXml = `
    <P_6>${formatDate(invoiceData.endSaleDate)}</P_6>`
  }

  // Sekcja płatności
  const paymentTypeCode = invoiceData.paymentType === 'Gotówka' ? '1' : '6'
  const paymentXml = `
    <Platnosc>
      <DataPlatnosc>${formatDate(invoiceData.paymentDate)}</DataPlatnosc>
      <FormaPlatnosci>${paymentTypeCode}</FormaPlatnosci>
    </Platnosc>`

  // Główny XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2023/06/29/12648/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://crd.gov.pl/wzor/2023/06/29/12648/ schemat.xsd">
  <Naglowek>
    <KodFormularza kodSystemowy="FA(3)" wersjaSchemy="1-0E">FA</KodFormularza>
    <WariantFormularza>3</WariantFormularza>
    <DataWytworzeniaFa>${new Date().toISOString()}</DataWytworzeniaFa>
    <SystemInfo>System fakturowania v1.0</SystemInfo>
  </Naglowek>
  <Podmiot1>
    <DaneIdentyfikacyjne>
      <NIP>8442120248</NIP>
      <Nazwa>SMACZNY KĄSEK -catering- Ewelina Radoń</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>ul. Sejneńska 21/1</AdresL1>
      <AdresL2>16-400 Suwałki</AdresL2>
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
  </Podmiot2>${podmiot3Xml}
  <FaWiersze>
    <P_1>${formatDate(invoiceData.invoiceDate)}</P_1>
    <P_1M>${escapeXml(invoiceData.city)}</P_1M>
    <P_2A>${escapeXml(invoiceData.invoiceNumber)}</P_2A>${dateRangeXml}${productsXml}
  </FaWiersze>${paymentXml}
  <FaPodsumowanie>${vatSummaryXml}
    <P_15>${formatAmount(totalGrossAll)}</P_15>
  </FaPodsumowanie>
</Faktura>`

  return xml
}
