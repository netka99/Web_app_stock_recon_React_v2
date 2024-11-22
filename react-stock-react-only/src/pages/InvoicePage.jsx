import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  //   Spinner,
  //   InvoiceLayout,
} from '../components/index'
import { size } from '../styles/devices'
import { fetchData } from '../api/fetchAPI'
// import n2words from 'n2words'

const {
  VITE_APP_SETTINGS_API,
  VITE_APP_SALES_API,
  VITE_APP_RETURNS_API,
} = import.meta.env

const pageTitle = 'Faktury'

const InvoicePage = () => {
  const today = new Date().toISOString().split('T')[0]

  const [messageText, setMessageText] = useState('')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState([])
  const [sale, setSale] = useState(null)
  const [returns, setReturns] = useState(null)
  const [summarySale, setSummarySale] = useState({})
  const [summaryReturns, setSummaryReturns] = useState({})
  const [summariesUpdated, setSummariesUpdated] =
    useState(false)
  const [titlesVisibility, setTitlesVisibility] =
    useState(false)

  const [invoiceData, setInvoiceData] = useState({
    shopName: '',
    address: '',
    startDate: today,
    endDate: today,
    city: 'Suwałki',
    invoiceDate: today,
    endSaleDate: today,
    paymentDate: today,
    paymentType: 'Przelew',
    seller:
      'SMACZNY KĄSEK -catering-Ewelina Radoń\nul. Sejneńska 21/1\n16-400 Suwałki\nNIP 8442120248',
    invoiceNumber: 'FV .../01/2024',
    comment: '',
  })

  const [productsData, setProductsData] = useState([
    {
      checked: false,
      product: 'Kartacze',
      productName: 'Ciepłe gotowane kartacze',
      code: '10.85.Z',
      units: 'szt.',
      quantity: 0,
      netPrice: 0,
      vat: 8,
      grossPrice: 0,
      totalNet: 0,
      totalGross: 0,
    },
    {
      checked: false,
      product: 'Babka',
      productName: 'Ciepła babka ziemniaczana',
      code: '10.85.Z',
      units: 'kg',
      quantity: 0,
      netPrice: 0,
      vat: 8,
      grossPrice: 0,
      totalNet: 0,
      totalGross: 0,
    },
    {
      checked: false,
      product: 'Kiszka',
      productName: 'Ciepła kiszka',
      code: '10.85.Z',
      units: 'kg',
      quantity: 0,
      netPrice: 0,
      vat: 8,
      grossPrice: 0,
      totalNet: 0,
      totalGross: 0,
    },
  ])

  const formatDate = (date) => {
    return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }

  const updatePaymantDate = (date) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 7)
    setInvoiceData((prevState) => ({
      ...prevState,
      paymentDate: formatDate(newDate),
    }))
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
          const updatedProductData = productsData.map(
            (product) => {
              const price = data.prices[product.product]
              return {
                ...product,
                grossPrice:
                  price !== undefined
                    ? Number((price / 100).toFixed(2))
                    : product.grossPrice,
              }
            },
          )
          setProductsData(updatedProductData)
        },
      )
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  const dataSearchedByDates = async () => {
    setLoading(true)
    getDatesBetween(
      invoiceData.startDate,
      invoiceData.endDate,
    )

    const urlSales = `${VITE_APP_SALES_API}?start=${invoiceData.startDate}&end=${invoiceData.endDate}`
    const urlReturns = `${VITE_APP_RETURNS_API}?start=${invoiceData.startDate}&end=${invoiceData.endDate}`

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
      setLoading(false)
      setTitlesVisibility(true)
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

    const updateProductData = productsData.map(
      (product) => {
        const quantity = totals[product.product] || 0
        return {
          ...product,
          quantity: quantity,
        }
      },
    )

    setProductsData(updateProductData)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (
      settings ||
      invoiceData.shopName ||
      sale ||
      returns
    ) {
      summary(sale, invoiceData.shopName, setSummarySale)
      summary(
        returns,
        invoiceData.shopName,
        setSummaryReturns,
      )
      setSummariesUpdated(true)
      console.log('settings data:', settings)
      console.log('shop Name:', invoiceData.shopName)
      console.log('adress:', invoiceData.address)
      console.log('sum Sale:', summarySale)
      console.log('sum Returns:', summaryReturns)
    }
  }, [invoiceData.shopName, sale, returns])

  useEffect(() => {
    if (summarySale || summaryReturns) {
      totalsPerProduct()
    }
  }, [summarySale, summaryReturns])

  useEffect(() => {
    if (summariesUpdated) {
      setSummariesUpdated(false) // Reset the state
    }
  }, [summariesUpdated])

  useEffect(() => {
    updatePaymantDate(invoiceData.invoiceDate)
  }, [invoiceData.invoiceDate])

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <div className="invoices-details">
          <div className="title">Podaj dane do faktury</div>
          <div className="seller">
            <label htmlFor="seller">
              Sprzedawca:
              <textarea
                id="seller"
                type="text"
                rows={5}
                value={invoiceData.seller}
                onChange={(e) => {
                  setInvoiceData((prevState) => ({
                    ...prevState,
                    seller: e.target.value,
                  }))
                }}
              />
            </label>
          </div>
          <div className="details">
            <div className="invoiceNumber">
              <label>Numer Faktury: </label>
              <textarea
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                rows={1}
                onChange={(e) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    invoiceNumber: e.target.value,
                  }))
                }
              ></textarea>
            </div>

            <div className="city">
              <label htmlFor="city">
                Miejsce wystawienia:
                <input
                  type="text"
                  value={invoiceData.city}
                  onChange={(e) => {
                    setInvoiceData((prevState) => ({
                      ...prevState,
                      city: e.target.value,
                    }))
                  }}
                />
              </label>
            </div>
            <div className="invoice-date">
              <label>
                Data wystawienia:
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => {
                    setInvoiceData((prevState) => ({
                      ...prevState,
                      invoiceDate: e.target.value,
                    }))
                  }}
                />
              </label>
            </div>
            <div className="sale-end-date">
              <label>
                Data zakończenia dostawy/usługi:
                <input
                  type="date"
                  value={invoiceData.endSaleDate}
                  onChange={(e) => {
                    setInvoiceData((prev) => ({
                      ...prev,
                      endSaleDate: e.target.value,
                    }))
                  }}
                />
              </label>
            </div>
            <div className="payment-date">
              <label>
                Termin płatności:
                <input
                  type="date"
                  value={invoiceData.paymentDate}
                  onChange={(e) => {
                    setInvoiceData((prevState) => ({
                      ...prevState,
                      paymentDate: e.target.value,
                    }))
                  }}
                />
              </label>
            </div>
            <div className="payment-type">
              <label>
                <input
                  type="text"
                  value={invoiceData.paymentType}
                  onChange={(e) => {
                    setInvoiceData((prevState) => ({
                      ...prevState,
                      paymentType: e.target.value,
                    }))
                  }}
                />
              </label>
            </div>
            <div className="dateRange">
              <p>Okres sprzedaży</p>
              <input
                type="date"
                value={invoiceData.startDate}
                onChange={(e) => {
                  setInvoiceData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }}
                required
              ></input>
              <input
                type="date"
                value={invoiceData.endDate}
                onChange={(e) => {
                  setInvoiceData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
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
            <div className="shopName">
              <label>
                Nazwa sklepu :
                {settings ? (
                  <select
                    value={invoiceData.shopName}
                    onChange={(e) => {
                      const selectedShop = e.target.value
                      setInvoiceData((prev) => ({
                        ...prev,
                        shopName: selectedShop,
                        address:
                          settings.address[selectedShop],
                      }))
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
              <div>Adres sklepu:</div>
              <div className="addressDetails">
                {invoiceData.address && (
                  <div className="address">
                    {invoiceData.address
                      .split('\n')
                      .map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="selling-form">
          {((summarySale &&
            Object.keys(summarySale).length > 0) ||
            (summaryReturns &&
              Object.keys(summaryReturns).length > 0)) && (
            <div className="titles">
              <div className="number">Lp.</div>
              <div className="product-name">
                Towar/Usługa
              </div>
              <div className="product-code">PKWIU</div>
              <div className="product-unit">J.m.</div>
              <div className="product-quantity">Ilość</div>
              <div className="net-price">Cena netto</div>
              <div className="vat">VAT</div>
              <div className="gross-price">Cena brutto</div>
              <div className="total-net">Wartość netto</div>
              <div className="total-gross">
                Wartość brutto
              </div>
            </div>
          )}
          {(summarySale || summaryReturns) &&
            productsData.map(
              (product) =>
                product.quantity !== 0 && (
                  <div
                    className="product-details"
                    key={product.product}
                  >
                    <div className="number">
                      <label htmlFor={product.product}>
                        <input
                          type="checkbox"
                          name={product.product}
                          checked={product.checked}
                          onChange={(e) =>
                            setProductsData((prod) =>
                              prod.map((p) =>
                                p.product ===
                                product.product
                                  ? {
                                      ...p,
                                      checked:
                                        e.target.checked,
                                    }
                                  : p,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="product-name">
                      {product.product}
                    </div>
                    <div className="product-code">
                      <label>
                        <input
                          type="text"
                          value={product.code}
                          readOnly
                          //   onChange={(e) =>
                          //     updateProductData(
                          //       product,
                          //       'code',
                          //       e.target.value,
                          //     )
                          //   }
                        />
                      </label>
                    </div>
                    <div className="product-unit">
                      {product.units}
                    </div>
                    <div className="product-quantity">
                      <label>
                        <input
                          value={product.quantity}
                          readOnly
                          //   onChange={(e) =>
                          //     updateProductData(
                          //       product,
                          //       'quantity',
                          //       Number(e.target.value),
                          //     )
                          //   }
                        />
                      </label>
                    </div>
                    <div className="net-price">
                      {product.netPrice.toFixed(2)}
                    </div>
                    <div className="vat">
                      <label>
                        <input
                          type="number"
                          value={product.vat}
                          readOnly
                          //   onChange={(e) =>
                          //     updateProductData(
                          //       product,
                          //       'vat',
                          //       Number(e.target.value),
                          //     )
                          //   }
                        />
                        %
                      </label>
                    </div>
                    <div className="gross-price">
                      <input
                        type="number"
                        placeholder="0"
                        value={product.grossPrice}
                        readOnly
                        // onChange={(e) =>
                        //   updateProductData(
                        //     product,
                        //     'grossPrice',
                        //     Number(e.target.value),
                        //   )
                        // }
                      />
                    </div>
                    <div className="total-net">
                      {Number(product.totalNet).toFixed(2)}
                    </div>
                    <div className="total-gross">
                      {Number(product.totalGross).toFixed(
                        2,
                      )}
                    </div>
                  </div>
                ),
            )}
          {/* {extraProduct.map((line, index) => (
            <div key={index} className="product-details">
              <div className="number">
                <label>
                  <input
                    type="text"
                    defaultValue="1"
                    onChange={(e) => e.target.value}
                  />
                </label>
              </div>
              <div className="product-name">
                <label>
                  <input
                    type="text"
                    value={line.product}
                    onChange={(e) => {
                      const updatedProducts = [
                        ...extraProduct,
                      ]
                      updatedProducts[index].product =
                        e.target.value
                      setExtraProduct(updatedProducts)
                    }}
                  />
                </label>
              </div>
              <div className="product-code">
                <label>
                  <input
                    type="text"
                    value={line.code}
                    onChange={(e) => {
                      const updatedProducts = [
                        ...extraProduct,
                      ]
                      updatedProducts[index].code =
                        e.target.value
                      setExtraProduct(updatedProducts)
                    }}
                  />
                </label>
              </div>
              <div className="product-unit">
                <label>
                  <input
                    type="text"
                    value={line.units}
                    onChange={(e) => {
                      const updatedProducts = [
                        ...extraProduct,
                      ]
                      updatedProducts[index].units =
                        e.target.value
                      setExtraProduct(updatedProducts)
                    }}
                  />
                </label>
              </div>
              <div className="product-quantity">
                <label>
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => {
                      const updatedProducts = [
                        ...extraProduct,
                      ]
                      updatedProducts[index].quantity =
                        Number(e.target.value)
                      setExtraProduct(updatedProducts)
                    }}
                  />
                </label>
              </div>
              <div className="net-price">
                {calculateNet(line.price, line.vat)}
              </div>
              <div className="vat">
                <label>
                  <input
                    type="number"
                    value={line.vat}
                    onChange={(e) => {
                      const updatedProducts = [
                        ...extraProduct,
                      ]
                      updatedProducts[index].vat = Number(
                        e.target.value,
                      )
                      setExtraProduct(updatedProducts)
                    }}
                  />
                  %
                </label>
              </div>
              <div className="gross-price">
                <label>
                  <input
                    type="number"
                    step=".01"
                    value={line.price}
                    onChange={(e) => {
                      const updatedProducts = [
                        ...extraProduct,
                      ]
                      updatedProducts[index].price = Number(
                        e.target.value,
                      )
                      setExtraProduct(updatedProducts)
                    }}
                  />
                </label>
              </div>
              <div className="total-net">
                {Number(
                  calculateNet(line.price, line.vat) *
                    line.quantity,
                ).toFixed(2)}
              </div>
              <div className="total-gross">
                {Number(
                  (Math.round(line.price * 100) *
                    line.quantity) /
                    100,
                ).toFixed(2)}
              </div>
            </div>
          ))}

          <button onClick={addExtraProduct}>
            Dodaj nowy produkt
          </button> */}
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

  .seller {
    textarea {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
      width: 100%;
    }
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

  .selling-form {
    background-color: #fdfdfd;
    width: 95%;
  }

  .titles,
  .product-details {
    display: grid;
    grid-template-columns: [first] 3rem [line2] 30% repeat(
        8,
        1fr
      );

    input {
      width: 60%;
    }
  }
`
export default InvoicePage
