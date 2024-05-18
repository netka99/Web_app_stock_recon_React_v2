import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  ItemShopContainer,
  DatePicker,
  Spinner,
} from '../components/index'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import { pictures, units } from '../utils/productDetails'
const { VITE_APP_SETTINGS_API, VITE_APP_SALES_API } =
  import.meta.env

//http://localhost:8000/sales?start=2024-04-19&end=2024-04-19

const pageTitle = 'Sprzedaż'

const SalePage = () => {
  const [shopsprices, setShopsprices] = useState(null)
  const [sale, setSale] = useState(null)
  const [saleByProduct, setSaleByProduct] =
    useState('Kartacze')
  // const [typeOfSale, setTypeOfSale] = useState('sale')

  // const [returns, setReturns] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const [todaysDate, setTodaysDate] = useState(today)

  const saleType = 'Sprzedaż'
  const id = 1
  const apiWithDate = `${VITE_APP_SALES_API}?start=${todaysDate}&end=${todaysDate}`

  useEffect(() => {
    fetchData(VITE_APP_SETTINGS_API)
      .then((data) => {
        setShopsprices(data)
        console.log('dataAllSettings:', data)
      })
      .catch((error) =>
        console.error(
          'Error fetching data from Settings:',
          error,
        ),
      )
    fetchData(apiWithDate)
      .then((dataSale) => {
        setSale(dataSale)
        console.log('dataAllSale:', dataSale)
      })
      .catch((error) =>
        console.error(
          'Error fetching data from Sales:',
          error,
        ),
      )
    filterByProduct(saleByProduct)
  }, [saleByProduct, todaysDate])
  console.log(shopsprices)
  console.log(sale)

  const filterByProduct = (productName) => {
    setSaleByProduct(productName)
  }

  useEffect(() => {
    console.log('Selected date changed:', todaysDate)
  }, [todaysDate])

  const saveData = (quantity, shopName) => {
    console.log('Button clicked!:', quantity, shopName)
    const data = {
      id: null,
      product: saleByProduct,
      shop: shopName,
      quantity: quantity,
      date: todaysDate,
      is_discounted: 0,
    }
    updateDataOnApi(data, VITE_APP_SALES_API, 'POST')
  }

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <DatePicker
          todaysDate={todaysDate}
          setTodaysDate={setTodaysDate}
        />
        <div className="saleReturn">
          <button className="saleReturnButtons checked">
            Sprzedaż
          </button>
          <button className="saleReturnButtons">
            Zwrot
          </button>
        </div>
        <div className="products">
          <button
            className={
              saleByProduct === 'Kartacze'
                ? 'productButton active'
                : 'productButton'
            }
            onClick={() => filterByProduct('Kartacze')}
          >
            <img
              src={pictures.Kartacze}
              alt="image of Kartacze"
            />
          </button>
          <button
            className={
              saleByProduct === 'Babka'
                ? 'productButton active'
                : 'productButton'
            }
            onClick={() => filterByProduct('Babka')}
          >
            <img
              src={pictures.Babka}
              alt="image of Babka"
            />
          </button>
          <button
            className={
              saleByProduct === 'Kiszka'
                ? 'productButton active'
                : 'productButton'
            }
            onClick={() => filterByProduct('Kiszka')}
          >
            <img
              src={pictures.Kiszka}
              alt="image of Kiszka"
            />
          </button>
        </div>
        {shopsprices ? (
          shopsprices.shops.map((shop) => (
            <ItemShopContainer
              key={shop}
              imageProduct={pictures[saleByProduct]}
              productName={saleByProduct}
              saleType={saleType}
              unit={units[saleByProduct]}
              id={id}
              shopName={shop}
              value={
                sale
                  ?.filter(
                    (s) =>
                      s.shop === shop &&
                      s.product === saleByProduct,
                  )
                  ?.reduce(
                    (acc, curr) => acc + curr.quantity,
                    0,
                  ) ?? 0
              }
              disabled={
                sale?.some(
                  (s) =>
                    s.shop === shop &&
                    s.product === saleByProduct,
                ) ?? false
              }
              saveData={saveData}
            />
          ))
        ) : (
          <Spinner />
        )}
      </Container>
      <Footer />
    </StyledMain>
  )
}
const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow-y: scroll;
  min-height: 70vh;
  padding-top: 3rem;
  padding-bottom: 7rem;
  flex-grow: 1;

  h1 {
    font-size: 60px;
  }

  .products {
    padding: 1.5rem 0rem 3rem 0rem;
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

    /* @media screen and (max-width: $mobileL) {
      margin: 0rem 1rem;
    } */
  }

  .saleReturn {
    display: flex;
    flex-direction: row;
  }

  .saleReturnButtons {
    width: 15rem;
    border: none;
    padding: 1rem 2rem;
    margin: 0 1rem;
    position: relative;
    line-height: 24px;
    overflow: hidden;
    text-align: center;
    z-index: 1;
    display: inline-block;
    border-radius: 15px;
    background-color: #fdfdfd;
    font-size: 1.1rem;
    font-weight: bold;
    outline: none;
    height: 100%;
    cursor: pointer;
    box-shadow:
      6px 6px 8px 0 rgba(0, 0, 0, 0.3),
      -12px -12px 24px 0 rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;

    /* @media screen and (max-width: $mobileL) {
      padding: 10px 35px;
    } */
  }

  .saleReturnButtons.checked {
    color: #5c35b6;
    background: linear-gradient(45deg, #e3e3e3, #ede8e8);
    font-weight: bold;
    font-size: 1.2rem;
    transition: 0.2s ease-in-out;
    box-shadow:
      inset 3px 3px 8px 0 rgba(0, 0, 0, 0.3),
      inset -6px -6px 10px 0 rgba(255, 255, 255, 0.5);
  }
`
export default SalePage
