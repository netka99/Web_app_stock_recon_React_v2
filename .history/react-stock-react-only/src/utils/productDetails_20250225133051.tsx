import Kartacze from '../assets/Kartacze-Small.jpg'
import Babka from '../assets/Babka-Small.jpg'
import Kiszka from '../assets/Kiszka-Small.jpg'

export type ProductName = 'Kartacze' | 'Babka' | 'Kiszka'

export const pictures: Record<ProductName, string> = {
  Kartacze: Kartacze,
  Babka: Babka,
  Kiszka: Kiszka,
}

export const units: Record<ProductName, string> = {
  Kartacze: 'szt.',
  Babka: 'kg',
  Kiszka: 'kg',
}

export const productsData = [
  { name: 'Kartacze', image: Kartacze, units: 'szt.' },
  { name: 'Babka', image: Babka, units: 'kg' },
  { name: 'Kiszka', image: Kiszka, units: 'kg' },
]
