interface SaleValue {
  id: number | null
  product: string
  shop: string
  quantity: number
  date: string
  is_discounted?: number
}

interface SettingsData {
  shops: string[]
  prices: {
    Kartacze: number
    Babka: number
    Kiszka: number
  }
  address: {
    string: string
  }
}
