import * as React from 'react'
import styled from 'styled-components'
import { useEffect } from 'react'
//, useContext
// import ReactDOM from 'react-dom/client'
import {
  Navbar,
  Sidebar,
  Footer,
} from '../components/index'
import { usePrices } from '../context/price_context'

const SettingsPricesPage = () => {
  const { prices, changePrice } = usePrices()

  const handleInputChange = (productName, newValue) => {
    changePrice(productName, newValue)
  }

  const pageTitle = 'Ustawienia - Ceny'

  useEffect(() => {
    console.log('Prices from context:', prices)
  }, [prices, changePrice])
  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <PricesContainer>
        <div>
          <p>Kartacze</p>
          <div>
            <label htmlFor="Price_Kartacze">Cena</label>
            <input
              type="number"
              min="0"
              id="Price_Kartacze"
              defaultValue={prices.Kartacze}
              onChange={(e) =>
                handleInputChange(
                  'Kartacze',
                  e.target.value,
                )
              }
            />
          </div>
        </div>
        <div>
          <p>Babka</p>
          <div>
            <label htmlFor="Price_Babka">Cena</label>
            <input
              type="number"
              min="0"
              id="Price_Babka"
              defaultValue={prices.Babka}
              onChange={(e) =>
                handleInputChange('Babka', e.target.value)
              }
            />
          </div>
        </div>
        <div>
          <p>Kiszka</p>
          <div>
            <label htmlFor="Price_Kiszka">Cena</label>
            <input
              type="number"
              min="0"
              id="Price_Kiszka"
              defaultValue={prices.Kiszka}
              onChange={(e) =>
                handleInputChange('Kiszka', e.target.value)
              }
            />
          </div>
        </div>
        <button
          onClick={() => console.log('Save prices', prices)}
          id="savePrices"
        >
          Zapisz
        </button>
      </PricesContainer>
      <Sidebar />
      <Footer />
    </main>
  )
}

const PricesContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 30%;
`

export default SettingsPricesPage
