import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  ItemShopContainer,
  DatePicker,
} from '../components/index'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import { pictures } from '../utils/productPictures'
const { VITE_APP_SETTINGS_API, VITE_APP_SALES_API } =
  import.meta.env

//http://localhost:8000/sales?start=2024-04-19&end=2024-04-19

const pageTitle = 'Sprzedaż'

const SalePage = () => {
  const [shopsprices, setShopsprices] = useState(null)
  const [sale, setSale] = useState(null)
  // const [returns, setReturns] = useState(null)

  const imageProduct = 'path_to_image'
  const productName = 'Product Name'
  const saleType = 'Sale Type'
  const unit = 'Unit'
  const id = 1

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
    fetchData(VITE_APP_SALES_API)
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
  }, [])
  console.log(shopsprices)
  console.log(sale)

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <DatePicker />
        <ItemShopContainer
          imageProduct={imageProduct}
          productName={productName}
          saleType={saleType}
          unit={unit}
          id={id}
        />
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
  /* height: calc(100vh - (10rem)); */
  height: 70vh;
  flex-grow: 1;

  h1 {
    font-size: 60px;
  }
`
export default SalePage
