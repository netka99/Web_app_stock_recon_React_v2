export interface SaleValue {
  id: number | null
  product: string
  shop: string
  quantity: number
  date: string
  is_discounted?: number
}

export interface SettingsData {
  shops: string[]
  prices: {
    Kartacze: number
    Babka: number
    Kiszka: number
    [key: string]: number
  }
  address: {
    [key: string]: string
  }
}
