export interface Podmiot3Data {
  nazwa: string
  addressL1: string
  addressL2: string
  idWew: string
  rola: string
}

export interface BuyerData {
  nazwa: string
  addressL1: string
  addressL2: string
  nip: string
  hasPodmiot3: boolean
  podmiot3?: Podmiot3Data
}

export interface ProductData {
  checked: boolean
  product?: string
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

export interface InvoiceData {
  shopName: string
  buyer_data: BuyerData
  startDate: string
  endDate: string
  city: string
  invoiceDate: string
  endSaleDate: string
  paymentDate: string
  paymentType: 'Przelew' | 'Gotówka'
  seller: string
  invoiceNumber: string
  comment?: string
  products: ProductData[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}
