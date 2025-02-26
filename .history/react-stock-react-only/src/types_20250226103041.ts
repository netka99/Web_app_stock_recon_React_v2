interface Sale {
  product: string
  quantity: number
  shop: string
  date: string
  is_discounted: number
}

interface Returns {
  product: string
  quantity: number
  shop: string
  date: string
}

interface ExtraReturns {
  product: string
  quantity: number
  shop: string
  date: string
}

interface ExtraSales {
  product: string
  quantity: number
  shop: string
  date: string
  is_discounted: number
}

interface SummarySaleProps {
  sale: Sale[]
  returns: Returns[]
  extraReturns: ExtraReturns[]
  extraSales: ExtraSales[]
}

export interface DataProps {}
