import Big from 'big.js'

interface ParsedProduct {
  checked: boolean
  product: string
  productName: string
  code: string
  units: string
  quantity: number
  netPrice: number
  vat: number
  grossPrice: number
  totalNet: number
  totalGross: number
}

interface ParsedBuyerData {
  nazwa: string
  addressL1: string
  addressL2: string
  nip: string
  hasPodmiot3: boolean
  podmiot3?: {
    nazwa: string
    addressL1: string
    addressL2: string
    idWew: string
    rola: string
  }
}

interface ParsedInvoiceData {
  shopName: string
  buyer_data: ParsedBuyerData
  startDate: string
  endDate: string
  city: string
  invoiceDate: string
  endSaleDate: string
  paymentDate: string
  paymentType: string
  seller: string
  invoiceNumber: string
  comment: string
}

export interface ParsedInvoice {
  invoiceData: ParsedInvoiceData
  productsData: ParsedProduct[]
}

const getText = (parent: Element, tagName: string): string => {
  const el = parent.getElementsByTagName(tagName)[0]
  return el?.textContent?.trim() || ''
}

export function parseFA3Invoice(xmlString: string, shop?: string): ParsedInvoice {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  // Podmiot1 - Seller
  const podmiot1 = doc.getElementsByTagName('Podmiot1')[0]
  const sellerNip = podmiot1 ? getText(podmiot1, 'NIP') : ''
  const sellerName = podmiot1 ? getText(podmiot1, 'Nazwa') : ''
  const sellerAddr1 = podmiot1 ? getText(podmiot1, 'AdresL1') : ''
  const sellerAddr2 = podmiot1 ? getText(podmiot1, 'AdresL2') : ''
  const seller = `${sellerName}\n${sellerAddr1}\n${sellerAddr2}\nNIP: ${sellerNip}`

  // Podmiot2 - Buyer
  const podmiot2 = doc.getElementsByTagName('Podmiot2')[0]
  const buyerData: ParsedBuyerData = {
    nazwa: podmiot2 ? getText(podmiot2, 'Nazwa') : '',
    addressL1: podmiot2 ? getText(podmiot2, 'AdresL1') : '',
    addressL2: podmiot2 ? getText(podmiot2, 'AdresL2') : '',
    nip: podmiot2 ? getText(podmiot2, 'NIP') : '',
    hasPodmiot3: false,
  }

  // Podmiot3 - Optional recipient
  const podmiot3 = doc.getElementsByTagName('Podmiot3')[0]
  if (podmiot3) {
    buyerData.hasPodmiot3 = true
    buyerData.podmiot3 = {
      nazwa: getText(podmiot3, 'Nazwa'),
      addressL1: getText(podmiot3, 'AdresL1'),
      addressL2: getText(podmiot3, 'AdresL2'),
      idWew: getText(podmiot3, 'IDWew'),
      rola: getText(podmiot3, 'Rola') || '2',
    }
  }

  // Fa - Invoice details
  const fa = doc.getElementsByTagName('Fa')[0]
  const invoiceDate = fa ? getText(fa, 'P_1') : ''
  const city = fa ? getText(fa, 'P_1M') : ''
  const invoiceNumber = fa ? getText(fa, 'P_2') : ''
  const endSaleDate = fa ? getText(fa, 'P_6') : ''

  // Payment
  const paymentDate = fa ? getText(fa, 'Termin') : ''
  const formaPlatnosci = fa ? getText(fa, 'FormaPlatnosci') : ''
  const paymentType = formaPlatnosci === '1' ? 'Gotówka' : 'Przelew'

  // Delivery period from DodatkowyOpis
  let startDate = ''
  let endDate = ''
  const opisElements = doc.getElementsByTagName('DodatkowyOpis')
  for (let i = 0; i < opisElements.length; i++) {
    const klucz = getText(opisElements[i], 'Klucz')
    if (klucz === 'Okres dostawy') {
      const wartosc = getText(opisElements[i], 'Wartosc')
      const parts = wartosc.split(' - ')
      if (parts.length === 2) {
        startDate = parts[0].trim()
        endDate = parts[1].trim()
      }
    }
  }

  // Products from FaWiersz
  const wiersze = doc.getElementsByTagName('FaWiersz')
  const productsData: ParsedProduct[] = []

  for (let i = 0; i < wiersze.length; i++) {
    const w = wiersze[i]
    const productName = getText(w, 'P_7')
    const units = getText(w, 'P_8A')
    const quantity = parseFloat(getText(w, 'P_8B')) || 0
    const grossPrice = parseFloat(getText(w, 'P_9B')) || 0
    const totalGross = parseFloat(getText(w, 'P_11A')) || 0
    const vat = parseFloat(getText(w, 'P_12')) || 0
    const code = getText(w, 'PKWiU')

    // Calculate net from gross and VAT
    const netPrice = Big(grossPrice)
      .div(Big(1).plus(Big(vat).div(100)))
      .round(2)
      .toNumber()
    const totalNet = Big(totalGross)
      .div(Big(1).plus(Big(vat).div(100)))
      .round(2)
      .toNumber()

    productsData.push({
      checked: true,
      product: productName,
      productName,
      code,
      units,
      quantity,
      netPrice,
      vat,
      grossPrice,
      totalNet,
      totalGross,
    })
  }

  return {
    invoiceData: {
      shopName: shop || '',
      buyer_data: buyerData,
      startDate,
      endDate,
      city,
      invoiceDate,
      endSaleDate,
      paymentDate,
      paymentType,
      seller,
      invoiceNumber,
      comment: '',
    },
    productsData,
  }
}
