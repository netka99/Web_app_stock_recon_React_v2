export interface SaleValue {
  id: number | null
  product: string
  shop: string
  quantity: number
  date: string
  is_discounted?: number
}

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

export interface SettingsData {
  shops: string[]
  prices: {
    Kartacze: number
    Babka: number
    Kiszka: number
    [key: string]: number
  }
  buyer_data: {
    [key: string]: BuyerData
  }
}
