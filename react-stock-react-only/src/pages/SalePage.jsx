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
import { fetchData } from '../api/fetchAPI'
// import { pictures } from '../utils/productPictures'
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

  const imageProduct = 'path_to_image'
  const productName = 'Kartacze'
  const saleType = 'Sale Type'
  const unit = 'Unit'
  const id = 1
  const quantity = 1
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
  }, [saleByProduct])
  console.log(shopsprices)
  console.log(sale)

  const filterByProduct = (productName) => {
    setSaleByProduct(productName)
  }

  useEffect(() => {
    console.log('Selected date changed:', todaysDate)
  }, [todaysDate])

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
              imageProduct={imageProduct}
              productName={shop}
              saleType={saleType}
              unit={unit}
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
                  ) ?? ''
              }
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
