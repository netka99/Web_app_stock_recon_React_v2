import React from 'react'
import { useState } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  DatePicker,
  // Spinner,
} from '../components/index'
import { size } from '../styles/devices'
import { productsData } from '../utils/productDetails'

const pageTitle = 'Zestawienie'

const SummaryPage = () => {
  const today = new Date().toISOString().split('T')[0]
  const [todaysDateStart, setTodaysDateStart] =
    useState(today)
  const [todaysDateEnd, setTodaysDateEnd] = useState(today)
  const [saleByProduct, setSaleByProduct] =
    useState('Kartacze')

  const filterByProduct = (productName) => {
    setSaleByProduct(productName)
  }

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <div className="dates">
          <DatePicker
            todaysDate={todaysDateStart}
            setTodaysDateStart={setTodaysDateStart}
            // setSentQuantities={setSentQuantities}
          />
          <h2 className="date-separator">-</h2>
          <DatePicker
            todaysDate={todaysDateEnd}
            setTodaysDateEnd={setTodaysDateEnd}
            // setSentQuantities={setSentQuantities}
          />
        </div>
        <div className="products">
          {productsData.map((product) => (
            <button
              key={product.name}
              className={
                saleByProduct === product.name
                  ? 'productButton active'
                  : 'productButton'
              }
              onClick={() => filterByProduct(product.name)}
            >
              <img
                src={product.image}
                alt={`image of ${product.name}`}
              />
            </button>
          ))}
        </div>
      </Container>
      <Footer />
    </StyledMain>
  )
}

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  max-width: 100%;
`

const Container = styled.div`
  overflow-x: hidden;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow-y: scroll;
  min-height: 70vh;
  padding-top: 3rem;
  padding-bottom: 2rem;
  flex-grow: 1;

  @media screen and (max-width: ${size.tabletS}) {
    padding-top: 1rem;
  }

  h1 {
    font-size: 60px;
  }

  .dates {
    display: flex;
    flex-direction: row;
  }

  .date-separator {
    padding: 2rem 0;
  }

  .products {
    padding: 1.5rem 0rem 3rem 0rem;
    max-width: 100%;
  }

  .productButton {
    background: #fff;
    box-shadow:
      4px 6px 6px 1px rgba(0, 0, 0, 0.3),
      -12px -12px 24px 0 rgba(255, 255, 255, 0.5);
    border: none;
    border-radius: 15px;
    cursor: pointer;
    padding: 4px 8px 3px;

    img {
      width: 55px;
      border-radius: 25px;
      padding: 5px 10px;
    }
  }

  .productButton.active {
    background-color: #f6f6f6;
    box-shadow:
      inset 3px 3px 8px 0 rgba(0, 0, 0, 0.3),
      inset -6px -6px 10px 0 rgba(255, 255, 255, 0.5);
  }

  .productButton:nth-of-type(2) {
    margin: 0rem 2rem;

    @media screen and (max-width: ${size.tabletS}) {
      margin: 0rem 0.5rem;
    }
  }
`
export default SummaryPage
