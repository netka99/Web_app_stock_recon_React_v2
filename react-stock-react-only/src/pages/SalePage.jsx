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
  SummarySale,
} from '../components/index'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import { pictures, units } from '../utils/productDetails'
const {
  VITE_APP_SETTINGS_API,
  VITE_APP_SALES_API,
  VITE_APP_RETURNS_API,
} = import.meta.env
import { size } from '../styles/devices'

//http://localhost:8000/sales?start=2024-04-19&end=2024-04-19

const pageTitle = 'Sprzedaż'

const SalePage = () => {
  const [shopsprices, setShopsprices] = useState(null)
  const [sale, setSale] = useState(null)
  const [updatedSale, setUpdatedSale] = useState([])
  const [saleByProduct, setSaleByProduct] =
    useState('Kartacze')
  const [returns, setReturns] = useState(null)
  const [updatedReturn, setUpdatedReturn] = useState([])
  const [sentQuantities, setSentQuantities] = useState([])
  const [extraSaleValues, setExtraSaleValues] = useState([])
  const [extraReturnValues, setExtraReturnValues] =
    useState([])
  const [isSale, setIsSale] = useState(true)
  const [isReturnSaved, setIsReturnSaved] = useState(false)
  const [typeOfSale, setTypeOfSale] = useState('Sprzedaż')

  const today = new Date().toISOString().split('T')[0]
  const [todaysDate, setTodaysDate] = useState(today)
  const [disabledShops, setDisabledShops] = useState([])
  const [disabledExtraShops, setDisabledExtraShops] =
    useState([])

  const apiWithDate = `${VITE_APP_SALES_API}?start=${todaysDate}&end=${todaysDate}`
  const apiWithDateReturn = `${VITE_APP_RETURNS_API}?start=${todaysDate}&end=${todaysDate}`

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
        setUpdatedSale(dataSale)
        console.log('dataAllSale:', dataSale)
      })
      .catch((error) =>
        console.error(
          'Error fetching data from Sales:',
          error,
        ),
      )
    fetchData(apiWithDateReturn)
      .then((dataReturn) => {
        setReturns(dataReturn)
        setUpdatedReturn(dataReturn)
        console.log('dataAllReturn:', dataReturn)
      })
      .catch((error) =>
        console.error(
          'Error fetching data from Sales:',
          error,
        ),
      )
    filterByProduct(saleByProduct)
  }, [saleByProduct, todaysDate])
  console.log('Data Sale', sale)
  console.log('Data Return', returns)
  console.log('dataAllSaleUpdated:', updatedSale)
  console.log('dataAllReturnUpdated:', updatedReturn)
  console.log('data Extra Sale:', extraSaleValues)
  console.log('data Extra Return:', extraReturnValues)

  const filterByProduct = (productName) => {
    setSaleByProduct(productName)
  }

  useEffect(() => {
    setExtraSaleValues([])
    setExtraReturnValues([])
    console.log('Selected date changed:', todaysDate)
  }, [todaysDate])

  const valueCurrent = (shop) => {
    const data = isSale ? updatedSale : updatedReturn
    return (
      data
        ?.filter(
          (s) =>
            s.shop === shop && s.product === saleByProduct,
        )
        ?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0
    )
  }

  useEffect(
    (shop) => {
      valueCurrent(shop)
    },
    [updatedSale, updatedReturn, todaysDate],
  )

  const isShopDisabled = (shop) => {
    const data = isSale ? updatedSale : updatedReturn
    return (
      data?.some(
        (s) =>
          s.shop === shop && s.product === saleByProduct,
      ) ?? false
    )
  }

  const extraShopDisabled = (shop) => {
    const data = isSale
      ? extraSaleValues
      : extraReturnValues
    return (
      data?.some(
        (s) =>
          s.shop === shop && s.product === saleByProduct,
      ) ?? false
    )
  }

  useEffect(() => {
    const updateDisabledShops = () => {
      if (shopsprices) {
        const disabled = shopsprices.shops.map((shop) =>
          isShopDisabled(shop),
        )
        setDisabledShops(disabled)
      }
    }
    updateDisabledShops()
  }, [
    shopsprices,
    updatedSale,
    updatedReturn,
    isSale,
    saleByProduct,
  ])

  useEffect(() => {
    const updateDisabledExtraShops = () => {
      if (shopsprices) {
        const disabled = shopsprices.shops.map((shop) =>
          extraShopDisabled(shop),
        )
        setDisabledExtraShops(disabled)
      }
    }
    updateDisabledExtraShops()
  }, [
    shopsprices,
    extraSaleValues,
    extraReturnValues,
    isSale,
    saleByProduct,
    todaysDate,
  ])

  const saveData = async (quantity, shopName) => {
    console.log('Button clicked!:', quantity, shopName)
    const data = {
      id: null,
      product: saleByProduct,
      shop: shopName,
      quantity: quantity,
      date: todaysDate,
      is_discounted: 0,
    }
    const dataReturn = {
      id: null,
      product: saleByProduct,
      shop: shopName,
      quantity: quantity,
      date: todaysDate,
    }
    const newSaveItem = {
      product: saleByProduct,
      shop: shopName,
      quantity: quantity,
      date: todaysDate,
      checked: true,
    }

    try {
      let result
      if (isSale) {
        result = await updateDataOnApi(
          data,
          VITE_APP_SALES_API,
          'POST',
        )
        setUpdatedSale([...updatedSale, newSaveItem])
      } else {
        result = await updateDataOnApi(
          dataReturn,
          VITE_APP_RETURNS_API,
          'POST',
        )
        setUpdatedReturn([...updatedReturn, newSaveItem])
        setIsReturnSaved(true)
      }

      const newSentQuantity = {
        saleType: typeOfSale,
        product: saleByProduct,
        quantity: quantity,
      }

      setSentQuantities((prev) => {
        const updatedQuantities = [...prev, newSentQuantity]
        console.log('NewSentQuantities:', updatedQuantities) // Log after state update
        return updatedQuantities
      })

      return result
    } catch (error) {
      console.error('Error updating data', error)
      return {
        status: 500,
        data: { message: 'Failed to save data' },
      }
    }
  }

  const saveExtraData = async (quantity, shopName) => {
    console.log(
      'Button clicked Extra!:',
      quantity,
      shopName,
    )
    const data = {
      id: null,
      product: saleByProduct,
      shop: shopName,
      quantity: quantity,
      date: todaysDate,
      is_discounted: 0,
    }
    const dataReturn = {
      id: null,
      product: saleByProduct,
      shop: shopName,
      quantity: quantity,
      date: todaysDate,
    }

    try {
      let result
      if (isSale) {
        result = await updateDataOnApi(
          data,
          VITE_APP_SALES_API,
          'POST',
        )
        setExtraSaleValues([...extraSaleValues, data])
      } else {
        result = await updateDataOnApi(
          dataReturn,
          VITE_APP_RETURNS_API,
          'POST',
        )
        setExtraReturnValues([
          ...extraReturnValues,
          dataReturn,
        ])
      }

      const newSentQuantity = {
        saleType: typeOfSale,
        product: saleByProduct,
        quantity: quantity,
      }

      setSentQuantities((prev) => {
        const updatedQuantities = [...prev, newSentQuantity]
        console.log('NewSentQuantities:', updatedQuantities) // Log after state update
        return updatedQuantities
      })
      return result
    } catch (error) {
      console.error('Error updating data', error)
      return {
        status: 500,
        data: { message: 'Failed to save data' },
      }
    }
  }

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <DatePicker
          todaysDate={todaysDate}
          setTodaysDate={setTodaysDate}
          setSentQuantities={setSentQuantities}
        />
        <div className="saleReturn">
          <button
            onClick={() => {
              setTypeOfSale('Sprzedaż')
              setIsSale(true)
            }}
            className={`saleReturnButtons ${isSale ? 'checked' : ''}`}
          >
            Sprzedaż
          </button>
          <button
            onClick={() => {
              setTypeOfSale('Zwrot')
              setIsSale(false)
            }}
            className={`saleReturnButtons ${!isSale ? 'checked' : ''}`}
          >
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
          shopsprices.shops.map((shop, index) => (
            <ItemShopContainer
              key={`${shop}-${index}`}
              imageProduct={pictures[saleByProduct]}
              productName={saleByProduct}
              saleType={typeOfSale}
              unit={units[saleByProduct]}
              shopName={shop}
              value={valueCurrent(shop)}
              disabled={disabledShops[index]}
              saveData={saveData}
              isSale={isSale}
              isReturnSaved={isReturnSaved}
              isShopDisabled={isShopDisabled}
              extraShopDisabled={extraShopDisabled}
              saveExtraData={saveExtraData}
              disabledExtraShops={disabledExtraShops[index]}
              extraSaleValues={extraSaleValues}
              extraReturnValues={extraReturnValues}
              todaysDate={todaysDate}
            />
          ))
        ) : (
          <Spinner />
        )}
      </Container>
      <SummarySale
        sale={sale}
        returns={returns}
        sentQuantities={sentQuantities}
      />
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

  .saleReturn {
    display: flex;
    flex-direction: row;
    max-width: 100%;
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

    @media screen and (max-width: ${size.tabletS}) {
      padding: 10px 35px;
    }
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
