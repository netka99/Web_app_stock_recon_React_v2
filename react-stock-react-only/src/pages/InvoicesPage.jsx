import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
} from '../components/index'
import { size } from '../styles/devices'
import { fetchData } from '../api/fetchAPI'
import { units } from '../utils/productDetails'

const {
  VITE_APP_SETTINGS_API,
  VITE_APP_SALES_API,
  VITE_APP_RETURNS_API,
} = import.meta.env

const pageTitle = 'Faktury'

const InvoicePage = () => {
  const today = new Date().toISOString().split('T')[0]

  const [invoiceNumber, setInvoiceNumber] = useState(
    'FV .../01/2024',
  )
  const [shopName, setShopName] = useState('')
  const [messageText, setMessageText] = useState('')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [dates, setDates] = useState([])
  const [sale, setSale] = useState(null)
  const [returns, setReturns] = useState(null)
  const [summarySale, setSummarySale] = useState({})
  const [summaryReturns, setSummaryReturns] = useState({})
  const [totalsOfSale, setTotalsOfSale] = useState({})
  const [checkedItems, setCheckedItems] = useState([])
  const [city, setCity] = useState('Suwałki')
  const [invoiceDate, setInvoiceDate] = useState(today)
  const [endSaleDate, setEndSaleDate] = useState(today)
  const [paymentDate, setPaymentDate] = useState(today)
  const [paymentType, setPaymentType] = useState('Przelew')

  const formatDate = (date) => {
    return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }

  const updatePaymantDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    setPaymentDate(formatDate(date))
  }

  const getDatesBetween = (startDate, endDate) => {
    let dates = []
    let currentDate = new Date(startDate)

    while (currentDate <= new Date(endDate)) {
      dates.push({
        name: formatDate(new Date(currentDate)),
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    setDates(dates)
    return dates
  }

  const getMessagesText = (messageType) => {
    switch (messageType) {
      case 'errorFetching':
        return 'Problem z pobraniem danych!'
      default:
        return ''
    }
  }

  const handleError = (error) => {
    console.error('Error fetching data:', error),
      setTimeout(() => {
        setMessageText(getMessagesText('errorFetching'))
      }, 4000)
  }

  const fetchDataByAPI = (url, setDatafromAPI) => {
    fetchData(url)
      .then((data) => {
        setDatafromAPI(data)
        setMessageText('')
      })
      .catch(handleError)
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      await fetchDataByAPI(
        VITE_APP_SETTINGS_API,
        (data) => {
          setSettings(data)
        },
      )
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  const summary = (data, shop, stateVar) => {
    const filteredByShop = data?.filter(
      (d) => d.shop === shop,
    )

    const productSum = filteredByShop?.reduce(
      (acc, curr) => {
        const { product, quantity } = curr
        if (!acc[product]) {
          acc[product] = 0
        }
        acc[product] += quantity

        return acc
      },
      {},
    )
    return stateVar(productSum)
  }

  const totalsPerProduct = () => {
    const safeSummarySale = summarySale || {}
    const safeSummaryReturns = summaryReturns || {}

    const allKeys = new Set([
      ...Object.keys(safeSummarySale),
      ...Object.keys(safeSummaryReturns),
    ])

    const totals = Object.fromEntries(
      [...allKeys].map((k) => [
        k,
        (safeSummarySale[k] || 0) -
          (safeSummaryReturns[k] || 0),
      ]),
    )

    console.log(totals)
    setTotalsOfSale(totals)
  }

  const dataSearchedByDates = async () => {
    setLoading(true)
    getDatesBetween(startDate, endDate)

    const urlSales = `${VITE_APP_SALES_API}?start=${startDate}&end=${endDate}`
    const urlReturns = `${VITE_APP_RETURNS_API}?start=${startDate}&end=${endDate}`

    try {
      await fetchDataByAPI(urlSales, (dataSale) => {
        setSale(dataSale)
        console.log('Fetched Sales Data:', dataSale)
      })
      await fetchDataByAPI(urlReturns, (dataReturns) => {
        setReturns(dataReturns)
        console.log('Fetched Returns Data:', dataReturns)
      })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  const productDetails = {
    Kartacze: {
      name: 'Ciepłe gotowane kartacze',
    },
    Babka: {
      name: 'Ciepła babka ziemniaczana',
    },
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (settings || shopName || sale || returns) {
      summary(sale, shopName, setSummarySale)
      summary(returns, shopName, setSummaryReturns)

      console.log('settings data:', settings)
      console.log('shop Name:', shopName)
      console.log('adress:', address)
      console.log('sum Sale:', summarySale)
      console.log('sum Returns:', summaryReturns)
    }
  }, [settings, shopName, sale, returns])

  useEffect(() => {
    if (summarySale || summaryReturns) {
      totalsPerProduct()
    }
  }, [summarySale, summaryReturns])

  useEffect(() => {
    updatePaymantDate()
  }, [invoiceDate])

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <div className="title">Podaj dane do faktury</div>
        <div className="details">
          <div className="invoiceNumber">
            <label>Numer Faktury: </label>
            <textarea
              name="inoiceNumber"
              value={invoiceNumber}
              rows={1}
              onChange={(e) =>
                setInvoiceNumber(e.target.value)
              }
            ></textarea>
          </div>
          <div className={shopName}>
            <label>
              Nazwa sklepu :
              {settings ? (
                <select
                  value={shopName}
                  onChange={(e) => {
                    const selectedShop = e.target.value
                    setShopName(selectedShop)
                    setAddress(
                      settings.address[selectedShop],
                    )
                  }}
                >
                  <option value="">
                    {'Wybierz sklep'}
                  </option>
                  {settings.shops.map((shop, index) => (
                    <option
                      key={`${shop}${index}`}
                      value={shop}
                    >
                      {shop}
                    </option>
                  ))}
                </select>
              ) : (
                getMessagesText('errorFetching')
              )}
            </label>
          </div>
          <div className="shopAddress">
            <p>Adres sklepu:</p>
            <div className="addressDetails">
              {address && (
                <div className="address">
                  {Object.keys(address).map((key) => (
                    <p key={key}>{address[key]}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="city">
            <label htmlFor="city">
              Miejsce wystawienia:
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
          </div>
          <div className="invoice-date">
            <label>
              Data wystawienia:
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => {
                  setInvoiceDate(e.target.value)
                }}
              />
            </label>
          </div>
          <div className="sale-end-date">
            <label>
              Data zakończenia dostawy/usługi:
              <input
                type="date"
                value={endSaleDate}
                onChange={(e) => {
                  setEndSaleDate(e.target.value)
                }}
              />
            </label>
          </div>
          <div className="payment-date">
            <label>
              Termin płatności:
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => {
                  setPaymentDate(e.target.value)
                }}
              />
            </label>
          </div>
          <div className="payment-type">
            <label>
              <input
                type="text"
                value={paymentType}
                onChange={(e) => {
                  setPaymentType(e.target.value)
                }}
              />
            </label>
          </div>
          <div className="dateRange">
            <p>Okres sprzedaży</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
              }}
              required
            ></input>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
              }}
              required
            ></input>
            <div className="search">
              <button
                className="searchButton"
                onClick={dataSearchedByDates}
              >
                Szukaj
              </button>
            </div>
          </div>
          <div className="summary-details">
            <p>Sprzedaż</p>
            {summarySale &&
            Object.keys(summarySale).length > 0 ? (
              Object.keys(summarySale).map((key) => (
                <p key={key}>
                  {key}: {summarySale[key]}
                </p>
              ))
            ) : (
              <p>0</p>
            )}

            <p>Zwrot</p>
            {summaryReturns &&
            Object.keys(summaryReturns).length ? (
              Object.keys(summaryReturns).map((key) => (
                <p key={key}>
                  {key}: {summaryReturns[key]}
                </p>
              ))
            ) : (
              <p>0</p>
            )}
          </div>
          <div className="total-sale">
            Łączna sprzedaż za okres:
            {totalsOfSale &&
            Object.keys(totalsOfSale).length > 0 ? (
              Object.keys(totalsOfSale).map((key) => (
                <div key={key}>
                  <label htmlFor={key}>
                    {` ${key}: ${totalsOfSale[key]} ${units[key]}`}
                  </label>
                  <input
                    id={key}
                    type="checkbox"
                    checked={checkedItems[key] || false}
                    onChange={(e) =>
                      setCheckedItems({
                        ...checkedItems,
                        [key]: e.target.checked,
                      })
                    }
                  />
                </div>
              ))
            ) : (
              <p>0</p>
            )}
          </div>
        </div>
        <div className="selling-form">
          {Object.keys(checkedItems).length > 0 && (
            <>
              <div className="titles">
                <div className="number">Lp.</div>
                <div className="product-name">
                  Towar/Usługa
                </div>
                <div className="product-code">PKWIU</div>
                <div className="product-unit">J.m.</div>
                <div className="product-quantity">
                  Ilość
                </div>
                <div className="net-price">Cena netto</div>
                <div className="vat">VAT</div>
                <div className="gross-price">
                  Cena brutto
                </div>
                <div className="total-net">
                  Wartość netto
                </div>
                <div className="total-gross">
                  Wartość brutto
                </div>
              </div>

              {Object.keys(checkedItems).map((key) => {
                if (checkedItems[key]) {
                  const details = productDetails[key]
                  return (
                    <div
                      className="product-details"
                      key={key}
                    >
                      <div className="number">1</div>
                      <div className="product-name">
                        {details.name}
                      </div>
                      <div className="product-code">
                        123
                      </div>
                      <div className="product-unit">
                        {units[key]}
                      </div>
                      <div className="product-quantity">
                        <label>
                          <input
                            value={totalsOfSale[key]}
                            onChange={(e) =>
                              setTotalsOfSale({
                                ...totalsOfSale,
                                [key]: Number(
                                  e.target.value,
                                ),
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="net-price">11</div>
                      <div className="vat">8%</div>
                      <div className="gross-price">15</div>
                      <div className="total-net">2</div>
                      <div className="total-gross">1</div>
                    </div>
                  )
                }
                return null // This is added in case the condition is false
              })}
            </>
          )}
        </div>
        {loading && <Spinner />}
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
  padding-bottom: 6rem;
  flex-grow: 1;

  @media screen and (max-width: ${size.tabletS}) {
    padding-top: 1rem;
  }

  h1 {
    font-size: 60px;
  }

  .title {
    font-size: 1.3rem;
  }

  .dates {
    display: flex;
    flex-direction: row;
  }

  .date-separator {
    padding: 2rem 0;
  }

  .searchButton {
    width: 10rem;
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
`
export default InvoicePage
