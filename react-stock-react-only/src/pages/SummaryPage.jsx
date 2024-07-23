import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  DatePicker,
  Spinner,
  SummaryPerProduct,
} from '../components/index'
import { size } from '../styles/devices'
import {
  productsData,
  pictures,
} from '../utils/productDetails'
import { fetchData } from '../api/fetchAPI'

const {
  VITE_APP_SETTINGS_API,
  VITE_APP_SALES_API,
  VITE_APP_RETURNS_API,
} = import.meta.env

const pageTitle = 'Zestawienie'

const SummaryPage = () => {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [saleByProduct, setSaleByProduct] =
    useState('Kartacze')
  const [sentQuantities, setSentQuantities] = useState([])
  const [settings, setSettings] = useState(null)
  const [sale, setSale] = useState(null)
  const [returns, setReturns] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [showContainer, setShowContainer] = useState(false)
  const [loading, setLoading] = useState(false)

  //url addresses based on start and end date

  const filterByProduct = (productName) => {
    setSaleByProduct(productName)
  }

  const getMessagesText = (messageType) => {
    switch (messageType) {
      case 'errorFetching':
        return 'Problem z pobraniem danych!'
      case 'saleSaved':
        return 'Sprzedaż została zapisana!'
      case 'errorSave':
        return 'Problem z wysłaniem danych do bazy danych!'
      case 'returnSaved':
        return 'Zwrot został zapisany!'
      default:
        return ''
    }
  }

  const fetchDataByAPI = (url, setDatafromAPI) => {
    fetchData(url)
      .then((data) => {
        setDatafromAPI(data)
        setMessageText('')
      })
      .catch((error) => {
        console.error('Error fetching data:', error),
          setTimeout(() => {
            setMessageText(getMessagesText('errorFetching'))
          }, 4000)
      })
  }

  const sortData = (data) => {
    const sortedData = data.sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    )
    console.log('Sorted data:', sortedData)
    return sortedData
  }

  const searchByDate = async () => {
    setLoading(true)
    setShowContainer(false)

    const urlSales = `${VITE_APP_SALES_API}?start=${startDate}&end=${endDate}`
    const urlReturns = `${VITE_APP_RETURNS_API}?start=${startDate}&end=${endDate}`

    try {
      const settingsData = fetchDataByAPI(
        VITE_APP_SETTINGS_API,
        setSettings,
      )
      const saleData = fetchDataByAPI(urlSales, (data) => {
        const sortedSaleData = sortData(data)
        setSale(sortedSaleData)
        return sortedSaleData
      })
      const returnsData = fetchDataByAPI(
        urlReturns,
        (data) => {
          const sortedReturnsData = sortData(data)
          setReturns(sortedReturnsData)
          return sortedReturnsData
        },
      )

      setSettings(settingsData)

      if (saleData) setSale(saleData)
      if (returnsData) setReturns(returnsData)

      setShowContainer(true)
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessageText(getMessagesText('errorFetching'))
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  useEffect(() => {
    if (settings && sale && returns) {
      console.log('Data:', settings, sale, returns)
    }
  }, [settings, sale, returns, loading])

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <div className="dates">
          <DatePicker
            todaysDate={startDate}
            setTodaysDate={setStartDate}
            setSentQuantities={setSentQuantities}
          />
          <h2 className="date-separator">-</h2>
          <DatePicker
            todaysDate={endDate}
            setTodaysDate={setEndDate}
            setSentQuantities={setSentQuantities}
          />
        </div>
        <div className="search">
          <button
            className="searchButton"
            onClick={searchByDate}
          >
            Szukaj
          </button>
        </div>
        {messageText && (
          <div className="error-notification">
            {messageText}
          </div>
        )}
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
        {loading && <Spinner />}
        {showContainer && settings && (
          <SummaryPerProduct
            settingsData={settings}
            imageProduct={pictures[saleByProduct]}
            saleData={sale}
            returnsData={returns}
            productSelected={saleByProduct}
          />
        )}
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

  .searchButton {
    width: 15rem;
    border: none;
    padding: 1rem 2rem;
    /* margin: 0 1rem; */
    position: relative;
    line-height: 24px;
    overflow: hidden;
    text-align: center;
    z-index: 1;
    display: inline-block;
    border-radius: 15px;
    background-color: #fdfdfd;
    font-weight: bold;
    outline: none;
    height: 100%;
    color: #5c35b6;
    cursor: pointer;
    box-shadow:
      6px 6px 8px 0 rgba(0, 0, 0, 0.3),
      -12px -12px 24px 0 rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;

    @media screen and (max-width: ${size.tabletS}) {
      padding: 10px 35px;
    }
  }
  .searchButton:active {
    border-radius: 15px;
    box-shadow:
      2px 2px 4px 0 rgba(0, 0, 0, 0.3),
      -8px -8px 16px 0 rgba(255, 255, 255, 0.5);
  }

  .products {
    padding: 2rem 0rem 3rem 0rem;
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

  .error-notification {
    background-color: #f8d7da;
    width: 50%;
    padding: 0.3rem;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 0.5rem auto;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
    box-shadow:
      0 3px 6px 0 rgba(0, 0, 0, 0.2),
      0 3px 10px 0 rgba(0, 0, 0, 0.19);
  }
`
export default SummaryPage
