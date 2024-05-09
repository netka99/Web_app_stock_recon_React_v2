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
        <div>
          <button
            onClick={() => filterByProduct('Kartacze')}
          >
            Kartacze
          </button>
          <button onClick={() => filterByProduct('Babka')}>
            Babka
          </button>
          <button onClick={() => filterByProduct('Kiszka')}>
            Kiszka
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
`
export default SalePage
