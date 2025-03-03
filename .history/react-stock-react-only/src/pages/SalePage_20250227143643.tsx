import React from 'react'
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
import { pictures, units, productsData } from '../utils/productDetails'
const { VITE_APP_SETTINGS_API, VITE_APP_SALES_API, VITE_APP_RETURNS_API } = import.meta
  .env
import { size } from '../styles/devices'
import useTemporaryMessage from '../hooks/useTemporaryMessage'

const pageTitle = 'Sprzedaż'

interface SaleValue {
  id: number
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

// interface SalePageProps {
//   dataSale: SaleValue
//   url: string
// }

const SalePage = () => {
  const [shopsprices, setShopsprices] = useState<SettingsData | null>(null)
  const [updatedSale, setUpdatedSale] = useState<SaleValue[]>([])
  const [saleByProduct, setSaleByProduct] = useState<string>('Kartacze')
  const [updatedReturn, setUpdatedReturn] = useState<SaleValue[]>([])
  const [extraSaleValues, setExtraSaleValues] = useState<SaleValue[]>([])
  const [extraReturnValues, setExtraReturnValues] = useState<SaleValue[]>([])
  const [isSale, setIsSale] = useState(true)
  const [isReturnSaved, setIsReturnSaved] = useState(false)
  const [typeOfSale, setTypeOfSale] = useState('Sprzedaż')
  const [messageText, showMessage] = useTemporaryMessage()
  const [loading, setLoading] = useState(false)
  const [todaysDate, setTodaysDate] = useState(new Date().toISOString().split('T')[0])

  const filterByProduct = (productName: string): void => {
    setSaleByProduct(productName)
  }

  const fetchDataByAPI = async (
    url: string,
    setDatafromAPI:
      | React.Dispatch<React.SetStateAction<SettingsData | null>>
      | ((data: SaleValue[]) => void),
  ) => {
    try {
      const data = await fetchData(url)
      if (url === VITE_APP_SETTINGS_API) {
        setDatafromAPI(data as SettingsData)
      } else {
        ;(setDatafromAPI as (data: SaleValue[]) => void)(data as SaleValue[])
      }
      // setDatafromAPI(data)
      showMessage('')
      return data
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('Problem z pobraniem danych!', 6000)
      throw error
    }
  }

  const searchByDate = async () => {
    setLoading(true)

    const urlSales = `${VITE_APP_SALES_API}?start=${todaysDate}&end=${todaysDate}`
    const urlReturns = `${VITE_APP_RETURNS_API}?start=${todaysDate}&end=${todaysDate}`

    try {
      await fetchDataByAPI(VITE_APP_SETTINGS_API, setShopsprices)
      await fetchDataByAPI(urlSales, (dataSale: SaleValue[]) => {
        setUpdatedSale(dataSale)
      })
      await fetchDataByAPI(urlReturns, (dataReturn: SaleValue[]) => {
        setUpdatedReturn(dataReturn)
      })
      filterByProduct(saleByProduct)
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('Problem z pobraniem danych!', 6000)
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  useEffect(() => {
    searchByDate()
  }, [saleByProduct, todaysDate])

  useEffect(() => {
    setExtraSaleValues([])
    setExtraReturnValues([])
  }, [todaysDate])

  const valueCurrent = (shop: string): number => {
    const data = isSale ? updatedSale : updatedReturn
    const filteredData = data?.filter(
      (s) => s.shop === shop && s.product === saleByProduct,
    )
    return filteredData?.reduce((acc, curr) => acc + curr.quantity, 0) || 0
  }

  useEffect(
    (shop) => {
      valueCurrent(shop)
    },
    [updatedSale, updatedReturn, todaysDate],
  )

  const shopDisabled = (shop, sale, returns) => {
    const data = isSale ? sale : returns
    return data?.some((s) => s.shop === shop && s.product === saleByProduct) ?? false
  }

  const saveEntry = async (quantity, shopName, isExtra = false) => {
    const data = {
      id: null,
      product: saleByProduct,
      shop: shopName,
      quantity: quantity,
      date: todaysDate,
      ...(isSale && { is_discounted: 0 }),
    }

    const { ...newSaveItem } = data
    newSaveItem.checked = true

    try {
      const result = await updateDataOnApi(
        data,
        isSale ? VITE_APP_SALES_API : VITE_APP_RETURNS_API,
        'POST',
      )
      if (isExtra) {
        setExtraSaleValues(isSale ? [...extraSaleValues, data] : extraSaleValues)
        setExtraReturnValues(!isSale ? [...extraReturnValues, data] : extraReturnValues)
      } else {
        setUpdatedSale(isSale ? [...updatedSale, newSaveItem] : updatedSale)
        setUpdatedReturn(!isSale ? [...updatedReturn, newSaveItem] : updatedReturn)
      }
      if (!isSale) {
        setIsReturnSaved(true)
      }
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
        <DatePicker todaysDate={todaysDate} setTodaysDate={setTodaysDate} />
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
          {productsData.map((product) => (
            <button
              key={product.name}
              className={
                saleByProduct === product.name ? 'productButton active' : 'productButton'
              }
              onClick={() => filterByProduct(product.name)}
            >
              <img src={product.image} alt={`image of ${product.name}`} />
            </button>
          ))}
        </div>
        {messageText && <div className="error-notification">{messageText}</div>}
        {loading && <Spinner />}
        {shopsprices &&
          shopsprices.shops.map((shop, index) => (
            <ItemShopContainer
              key={`${shop}-${index}`}
              imageProduct={pictures[saleByProduct]}
              productName={saleByProduct}
              saleType={typeOfSale}
              unit={units[saleByProduct]}
              shopName={shop}
              value={valueCurrent(shop)}
              saveData={saveEntry}
              isSale={isSale}
              isReturnSaved={isReturnSaved}
              isShopDisabled={shopDisabled}
              saveExtraData={(quantity, shopName) => saveEntry(quantity, shopName, true)}
              extraSaleValues={extraSaleValues}
              extraReturnValues={extraReturnValues}
              todaysDate={todaysDate}
              updatedSale={updatedSale}
              updatedReturn={updatedReturn}
            />
          ))}
      </Container>
      <SummarySale
        sale={updatedSale}
        returns={updatedReturn}
        extraSales={extraSaleValues}
        extraReturns={extraReturnValues}
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
    font-weight: bold;
    font-size: 1.2rem;
    transition: 0.2s ease-in-out;
    box-shadow:
      inset 3px 3px 8px 0 rgba(0, 0, 0, 0.3),
      inset -6px -6px 10px 0 rgba(255, 255, 255, 0.5);
  }

  .error-notification {
    background-color: #f8d7da;
    width: 50%;
    padding: 0.3rem;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto 0.5rem auto;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
    box-shadow:
      0 3px 6px 0 rgba(0, 0, 0, 0.2),
      0 3px 10px 0 rgba(0, 0, 0, 0.19);
  }
`
export default SalePage
