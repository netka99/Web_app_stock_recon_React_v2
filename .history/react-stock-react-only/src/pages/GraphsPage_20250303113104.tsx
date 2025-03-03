import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  DatePicker,
  Spinner,
  DropdownMenu,
} from '../components/index'
import { size } from '../styles/devices'
import { productsData } from '../utils/productDetails'
import { fetchData } from '../api/fetchAPI'
import useTemporaryMessage from '../hooks/useTemporaryMessage'
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts'

const { VITE_APP_SETTINGS_API, VITE_APP_SALES_API, VITE_APP_RETURNS_API } = import.meta
  .env

const pageTitle = 'Wykresy'

interface DateEntry {
  name: string
  sprzedaż: number
  zwroty: number
}

const GraphsPage = () => {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState<string>(today)
  const [endDate, setEndDate] = useState<string>(today)
  const [saleByProduct, setSaleByProduct] = useState('Kartacze')
  // const [sentQuantities, setSentQuantities] = useState([])
  const [settings, setSettings] = useState(null)
  const [sale, setSale] = useState(null)
  const [returns, setReturns] = useState(null)
  const [messageText, showMessage] = useTemporaryMessage()
  const [showContainer, setShowContainer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState<DateEntry[]>([])
  const [selectedShop, setSelectedShop] = useState('Wybierz sklep')

  const filterByProduct = (productName: string): void => {
    setSaleByProduct(productName)
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }

  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates: DateEntry[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= new Date(endDate)) {
      dates.push({
        name: formatDate(new Date(currentDate)),
        sprzedaż: 0,
        zwroty: 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    setDates(dates)
    return dates
  }

  // const fetchDataByAPI = async (url: string, setDatafromAPI) => {
  //   try {
  //     const data = await fetchData(url)
  //     setDatafromAPI(data)
  //     showMessage('', 0)
  //     return data
  //   } catch (error) {
  //     console.error('Error fetching data:', error)
  //     showMessage('Problem z pobraniem danych!', 6000)
  //   }
  // }

  async function fetchDataByAPI(
    url: string,
    setDatafromAPI: React.Dispatch<React.SetStateAction<SettingsData | null>>,
  ): Promise<SettingsData | null>

  async function fetchDataByAPI(
    url: string,
    setDatafromAPI: (data: SaleValue[]) => void,
  ): Promise<SaleValue[]>

  async function fetchDataByAPI(
    url: string,
    setDatafromAPI:
      | React.Dispatch<React.SetStateAction<SettingsData | null>>
      | ((data: SaleValue[]) => void),
  ): Promise<SettingsData | null | SaleValue[]> {
    try {
      const data = await fetchData(url)

      if (typeof setDatafromAPI === 'function') {
        ;(setDatafromAPI as (data: SaleValue[]) => void)(data as SaleValue[])
        return data as SaleValue[]
      } else {
        ;(setDatafromAPI as React.Dispatch<React.SetStateAction<SettingsData | null>>)(
          data as SettingsData | null,
        )
        return data as SettingsData | null
      }
      showMessage('', 0)
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('Problem z pobraniem danych!', 6000)
      throw error
    }
  }

  const summary = (date, data, shop) => {
    if (shop === 'Wybierz sklep') {
      return (
        data
          ?.filter((d) => d.date === date && d.product === saleByProduct)
          ?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0
      )
    }
    if (shop !== 'Wybierz sklep') {
      return (
        data
          ?.filter(
            (d) => d.date === date && d.product === saleByProduct && d.shop === shop,
          )
          ?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0
      )
    }
  }

  const sumPerDay = () => {
    const updatedDatesforSale = dates.map((d) => ({
      ...d,
      sprzedaż: summary(d.name, sale, selectedShop),
      zwroty: summary(d.name, returns, selectedShop),
    }))
    setDates(updatedDatesforSale)
  }

  const searchByDate = async () => {
    setLoading(true)
    setShowContainer(false)
    getDatesBetween(startDate, endDate)

    const urlSales = `${VITE_APP_SALES_API}?start=${startDate}&end=${endDate}`
    const urlReturns = `${VITE_APP_RETURNS_API}?start=${startDate}&end=${endDate}`

    try {
      await fetchDataByAPI(VITE_APP_SETTINGS_API, (data) => {
        setSettings(data)
      })
      await fetchDataByAPI(urlSales, (data) => {
        setSale(data)
      })
      await fetchDataByAPI(urlReturns, (data) => {
        setReturns(data)
      })

      setShowContainer(true)
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('Problem z pobraniem danych!', 4000)
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  useEffect(() => {
    if (settings && sale && returns) {
      sumPerDay()
    }
  }, [settings, sale, returns, saleByProduct, selectedShop])

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <div className="dates">
          <StyledDatePicker
            todaysDate={startDate}
            setTodaysDate={setStartDate}
            // setSentQuantities={setSentQuantities}
          />
          <h2 className="date-separator">-</h2>
          <StyledDatePicker
            todaysDate={endDate}
            setTodaysDate={setEndDate}
            // setSentQuantities={setSentQuantities}
          />
        </div>
        <div className="search">
          <button className="searchButton" onClick={searchByDate}>
            Szukaj
          </button>
        </div>
        {messageText && <div className="error-notification">{messageText}</div>}
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
        <DropdownMenu
          settings={settings}
          selectedShop={selectedShop}
          setSelectedShop={setSelectedShop}
        />
        {loading && <Spinner />}
        {showContainer && settings && (
          <div className="chart">
            <ResponsiveContainer width="98%" aspect={2}>
              <ComposedChart
                // width={800}
                // height={400}
                data={dates}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sprzedaż" barSize={20} fill="rgba(131, 99, 192, 0.5)" />
                <Line type="monotone" dataKey="zwroty" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Container>
      <Footer />
    </StyledMain>
  )
}

const StyledDatePicker = styled(DatePicker)`
  @media screen and (max-width: ${size.tabletS}) {
    padding: 0.5rem;
    input[type='date'] {
      font-size: 1rem;
      padding: 5px;
    }
  }
`

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
    justify-content: flex-start;
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
    padding: 2rem 0rem 1rem 0rem;
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
    margin: 1rem auto 0.5rem auto;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
    box-shadow:
      0 3px 6px 0 rgba(0, 0, 0, 0.2),
      0 3px 10px 0 rgba(0, 0, 0, 0.19);
  }
  .chart {
    /* margin: 3rem auto 4rem auto; */
    width: 98vw;
    height: 50vh;
    max-width: 800px;
    margin: 1rem auto 4rem auto;

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 0.8rem;
    }
  }
`
export default GraphsPage
