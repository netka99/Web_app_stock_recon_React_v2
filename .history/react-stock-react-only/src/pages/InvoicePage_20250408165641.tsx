import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Navbar, Sidebar, Footer, InvoiceLayout } from '../components/index'
import { size } from '../styles/devices'
import { fetchData } from '../api/fetchAPI'
// import n2words from 'n2words'
import Big from 'big.js'
import useTemporaryMessage from '../hooks/useTemporaryMessage'
import { SaleValue, SettingsData } from '../types'

const { VITE_APP_SETTINGS_API, VITE_APP_SALES_API, VITE_APP_RETURNS_API } = import.meta
  .env

const pageTitle = 'Faktury'

interface Product {
  checked: boolean
  product: string
  productName: string
  code: string
  units: string
  quantity: number
  netPrice: number
  vat: number
  grossPrice: number
  totalNet: number
  totalGross: number
}

interface InvoiceData {
  shopName: string
  address: string
  startDate: string
  endDate: string
  city: string
  invoiceDate: string
  endSaleDate: string
  paymentDate: string
  paymentType: string
  seller: string
  invoiceNumber: string
  comment: string
}

const InvoicePage = () => {
  const today = new Date().toISOString().split('T')[0]

  const [messageText, showMessage] = useTemporaryMessage()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  // const [dates, setDates] = useState([])
  const [sale, setSale] = useState<SaleValue[] | null>(null)
  const [returns, setReturns] = useState<SaleValue[] | null>(null)
  const [summarySale, setSummarySale] = useState<Record<string, number>>({})
  const [summaryReturns, setSummaryReturns] = useState<Record<string, number>>({})
  const [isInvoiceVisible, setIsInvoiceVisible] = useState<boolean>(false)
  const [extraProduct, setExtraProduct] = useState([])
  // const [titlesVisibility, setTitlesVisibility] =
  useState(false)
  const initialInvoiceData<InvoiceData></InvoiceData> = {
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
    invoiceNumber: 'FV .../01/2025',
    comment: '',
  }

  const [invoiceData, setInvoiceData] = useState(initialInvoiceData)

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

  const updatePaymantDate = useCallback((date) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 7)
    setInvoiceData((prevState) => ({
      ...prevState,
      paymentDate: formatDate(newDate),
    }))
  }, [])

  const getDatesBetween = useCallback((startDate, endDate) => {
    const dates = []
    const currentDate = new Date(startDate)

    while (currentDate <= new Date(endDate)) {
      dates.push({
        name: formatDate(new Date(currentDate)),
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    // setDates(dates)
    return dates
  }, [])

  const handleError = useCallback(
    (error) => {
      console.error('Error fetching data:', error),
        showMessage('Problem z pobraniem danych!', 6000)
    },
    [showMessage],
  )

  const fetchDataByAPI = useCallback(
    async (url, setDatafromAPI) => {
      try {
        const data = await fetchData(url)
        setDatafromAPI(data)
        return data
      } catch (error) {
        handleError(error)
        throw error
      }
    },
    [handleError],
  )

  const loadSettings = useCallback(async () => {
    try {
      await fetchDataByAPI(VITE_APP_SETTINGS_API, (data) => {
        setSettings(data)
        const updatedProductData = productsData.map((product) => {
          const price = data.prices[product.product]
          return {
            ...product,
            grossPrice:
              price !== undefined ? Number((price / 100).toFixed(2)) : product.grossPrice,
          }
        })
        setProductsData(updatedProductData)
      })
    } catch (error) {
      handleError(error)
    }
  }, [fetchDataByAPI, handleError, productsData])

  const dataSearchedByDates = useCallback(async () => {
    getDatesBetween(invoiceData.startDate, invoiceData.endDate)

    const urlSales = `${VITE_APP_SALES_API}?start=${invoiceData.startDate}&end=${invoiceData.endDate}`
    const urlReturns = `${VITE_APP_RETURNS_API}?start=${invoiceData.startDate}&end=${invoiceData.endDate}`

    try {
      const salesData = await fetchDataByAPI(urlSales, setSale)
      const returnsData = await fetchDataByAPI(urlReturns, setReturns)
      if (salesData && returnsData) {
        showMessage('Dane zostały pobrane! Wybierz Sklep.', 6000)
      }
    } catch (error) {
      handleError(error)
    } finally {
      // setTitlesVisibility(true)
    }
  }, [
    fetchDataByAPI,
    getDatesBetween,
    handleError,
    invoiceData.startDate,
    invoiceData.endDate,
    showMessage,
  ])

  const summary = useCallback((data, shop, stateVar) => {
    const filteredByShop = data?.filter((d) => d.shop === shop)

    const productSum = filteredByShop?.reduce((acc, curr) => {
      const { product, quantity } = curr
      if (!acc[product]) {
        acc[product] = 0
      }
      acc[product] += quantity

      return acc
    }, {})
    return stateVar(productSum)
  }, [])

  const calculateNetPrice = (grossPrice, vat) => {
    const netPrice = Big(grossPrice).div(Big(1).plus(Big(vat).div(100)))
    return Number(netPrice.toFixed(2))
  }

  const calculateTotalNet = (vat, quantity, grossPrice) => {
    const grossDecimal = Big(quantity).times(grossPrice) // Convert gross to Big.js instance
    const vatMultiplier = Big(1).plus(Big(vat).div(100)) // Calculate VAT multiplier
    const net = grossDecimal.div(vatMultiplier) // Divide gross by VAT multiplier
    return Number(net.toFixed(2)) // Round to 2 decimal places
  }

  const calculateTotalGross = (quantity, grossPrice) => {
    const totalGross = Big(quantity).times(grossPrice)
    return Number(totalGross.toFixed(2))
  }

  const totalsPerProduct = useCallback(() => {
    const safeSummarySale = summarySale || {}
    const safeSummaryReturns = summaryReturns || {}

    // Combine keys from both objects
    const allKeys = new Set([
      ...Object.keys(safeSummarySale),
      ...Object.keys(safeSummaryReturns),
    ])

    // Calculate totals per product
    const totals = Object.fromEntries(
      [...allKeys].map((k) => [
        k,
        (safeSummarySale[k] || 0) - (safeSummaryReturns[k] || 0),
      ]),
    )

    // Update quantities first
    const updateProductQuantityTotals = productsData.map((product) => {
      const quantity = totals[product.product] || 0

      const netPrice = calculateNetPrice(product.grossPrice, product.vat)
      const totalNet = calculateTotalNet(product.vat, quantity, product.grossPrice)
      const totalGross = calculateTotalGross(quantity, product.grossPrice)
      return {
        ...product,
        quantity: quantity,
        netPrice: netPrice,
        totalNet: totalNet,
        totalGross: totalGross,
      }
    })

    setProductsData(updateProductQuantityTotals)
  }, [summarySale, summaryReturns])

  const updateProductTotals = useCallback((productName, title, value, setState) => {
    setState((prev) =>
      prev.map((p) => {
        if (p.product === productName.product) {
          const updatedProduct = { ...p, [title]: value }
          const netPrice = calculateNetPrice(
            updatedProduct.grossPrice,
            updatedProduct.vat,
          )
          const totalNet = calculateTotalNet(
            updatedProduct.vat,
            updatedProduct.quantity,
            updatedProduct.grossPrice,
          )
          const totalGross = calculateTotalGross(
            updatedProduct.quantity,
            updatedProduct.grossPrice,
          )
          return {
            ...updatedProduct,
            netPrice: netPrice,
            totalNet: totalNet,
            totalGross: totalGross,
          }
        }
        return p
      }),
    )
  })

  const addExtraProduct = useCallback(() => {
    setExtraProduct((prev) => [
      ...prev,
      {
        checked: false,
        productName: '',
        code: '',
        units: '',
        quantity: 0,
        netPrice: 0,
        vat: 0,
        grossPrice: 0,
        totalNet: 0,
        totalGross: 0,
      },
    ])
    // setTitlesVisibility(true)
  }, [])

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (settings || invoiceData.shopName || sale || returns) {
      summary(sale, invoiceData.shopName, setSummarySale)
      summary(returns, invoiceData.shopName, setSummaryReturns)
    }
  }, [invoiceData.shopName, sale, returns])

  useEffect(() => {
    if (
      (sale && Object.keys(summarySale).length > 0) ||
      (returns && Object.keys(summaryReturns).length > 0)
    ) {
      totalsPerProduct()
    }
  }, [summarySale, summaryReturns])

  useEffect(() => {
    updatePaymantDate(invoiceData.invoiceDate)
  }, [invoiceData.invoiceDate])

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <div className="details-container">
          <div className="invoices-details">
            <div className="title">Podaj dane do faktury</div>
            <div className="invoice-seller">
              <label htmlFor="seller">
                <div className="text">Sprzedawca:</div>
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
            <div className="invoice-details">
              <div className="invoiceNumber">
                <label>
                  <div className="text">Numer Faktury:</div>
                </label>
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
                  <div className="text">Miejsce wystawienia:</div>
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
                  <div className="text">Data wystawienia:</div>
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
                  <div className="text">Data zakończenia dostawy/usługi:</div>
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
                  <div className="text">Termin płatności:</div>
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
                  <div className="text">Forma płatności:</div>
                  <select
                    type="text"
                    className="payment-type-field"
                    value={invoiceData.paymentType}
                    onChange={(e) => {
                      setInvoiceData((prevState) => ({
                        ...prevState,
                        paymentType: e.target.value,
                      }))
                    }}
                  >
                    <option value="Przelew">Przelew</option>
                    <option value="Gotówka">Gotówka</option>
                  </select>
                </label>
              </div>

              <div className="comment">
                <div className="text">Dodatkowy komentarz:</div>
                <input
                  type="text"
                  value={invoiceData.comment}
                  onChange={(e) => {
                    setInvoiceData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }}
                />
              </div>
            </div>
            <div className="dateRange">
              <label>
                <div className="text">Okres sprzedaży</div>
                <div className="dates-of-sales">
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
                </div>
                <div className="search">
                  <button className="searchButton" onClick={dataSearchedByDates}>
                    Szukaj
                  </button>
                </div>
              </label>
            </div>
            {messageText && <div className="error-notification">{messageText}</div>}
            <div className="shopName">
              <label>
                {settings ? (
                  <select
                    value={invoiceData.shopName}
                    onChange={(e) => {
                      const selectedShop = e.target.value
                      setInvoiceData((prev) => ({
                        ...prev,
                        shopName: selectedShop,
                        address: settings.address[selectedShop],
                      }))
                    }}
                  >
                    <option value="">{'Wybierz sklep'}</option>
                    {settings.shops.map((shop, index) => (
                      <option key={`${shop}${index}`} value={shop}>
                        {shop}
                      </option>
                    ))}
                  </select>
                ) : null}
              </label>
            </div>
            <div className="shopAddress">
              <div className="text">Adres sklepu:</div>
              <div className="addressDetails">
                {invoiceData.address && (
                  <div className="address">
                    {invoiceData.address.split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {((summarySale && Object.keys(summarySale).length > 0) ||
          (summaryReturns && Object.keys(summaryReturns).length > 0)) && (
          <div className="values-container">
            <div className="selling-form">
              <div className="titles-data">
                <div className="values-titles number">Dodaj</div>
                <div className="values-titles product-name">Towar/Usługa</div>
                <div className="values-titles product-code">PKWIU</div>
                <div className="values-titles product-unit">J.m.</div>
                <div className="values-titles product-quantity">Ilość</div>
                <div className="values-titles net-price">Cena netto</div>
                <div className="values-titles vat">VAT</div>
                <div className="values-titles gross-price">Cena brutto</div>
                <div className="values-titles total-net">Wartość netto</div>
                <div className="values-titles total-gross">Wartość brutto</div>
              </div>
              {(summarySale || summaryReturns) &&
                productsData.map(
                  (product) =>
                    product.quantity !== 0 && (
                      <div className="product-details-data" key={product.product}>
                        <div className="values-product number" data-title="Dodaj">
                          <label htmlFor={product.product}>
                            <input
                              type="checkbox"
                              name={product.product}
                              checked={product.checked}
                              onChange={(e) =>
                                setProductsData((prod) =>
                                  prod.map((p) =>
                                    p.product === product.product
                                      ? {
                                          ...p,
                                          checked: e.target.checked,
                                        }
                                      : p,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>
                        <div
                          className="values-product product-name"
                          data-title="Towar/Usługa"
                        >
                          {product.product}
                        </div>
                        <div className="values-product product-code" data-title="PKWIU">
                          <label>
                            <input
                              type="text"
                              value={product.code}
                              onChange={(e) =>
                                setProductsData((prod) =>
                                  prod.map((p) =>
                                    p.product === product.product
                                      ? {
                                          ...p,
                                          code: e.target.value,
                                        }
                                      : p,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="values-product product-unit" data-title="J.m.">
                          {product.units}
                        </div>
                        <div
                          className="values-product product-quantity"
                          data-title="Ilość"
                        >
                          <label>
                            <input
                              value={product.quantity}
                              onChange={(e) =>
                                updateProductTotals(
                                  product,
                                  'quantity',
                                  Number(e.target.value),
                                  setProductsData,
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="values-product net-price" data-title="Cena netto">
                          {product.netPrice.toFixed(2)}
                        </div>
                        <div className="values-product vat" data-title="VAT">
                          <label>
                            <input
                              type="number"
                              value={product.vat}
                              onChange={(e) =>
                                updateProductTotals(
                                  product,
                                  'vat',
                                  parseFloat(e.target.value),
                                  setProductsData,
                                )
                              }
                            />
                            %
                          </label>
                        </div>
                        <div
                          className="values-product gross-price"
                          data-title="Cena brutto"
                        >
                          <input
                            type="number"
                            placeholder="0"
                            value={product.grossPrice}
                            onChange={(e) =>
                              updateProductTotals(
                                product,
                                'grossPrice',
                                parseFloat(e.target.value),
                                setProductsData,
                              )
                            }
                          />
                        </div>
                        <div
                          className="values-product total-net"
                          data-title="Wartość netto"
                        >
                          {Number(product.totalNet).toFixed(2)}
                        </div>
                        <div
                          className="values-product total-gross"
                          data-title="Wartość brutto"
                        >
                          {Number(product.totalGross).toFixed(2)}
                        </div>
                      </div>
                    ),
                )}
              {extraProduct.map((line, index) => (
                <div key={index} className="product-details-data">
                  <div className="values-product number" data-title="Dodaj">
                    <label>
                      <input
                        type="checkbox"
                        name={line.product}
                        checked={line.checked}
                        onChange={(e) => {
                          const updatedProducts = [...extraProduct]
                          updatedProducts[index].checked = e.target.checked
                          setExtraProduct(updatedProducts)
                        }}
                      />
                    </label>
                  </div>
                  <div className="values-product product-name" data-title="Towar/Usługa">
                    <label>
                      <input
                        type="text"
                        value={line.productName}
                        onChange={(e) => {
                          const updatedProducts = [...extraProduct]
                          updatedProducts[index].productName = e.target.value
                          setExtraProduct(updatedProducts)
                        }}
                      />
                    </label>
                  </div>
                  <div className="values-product product-code" data-title="PKWIU">
                    <label>
                      <input
                        type="text"
                        value={line.code}
                        onChange={(e) => {
                          const updatedProducts = [...extraProduct]
                          updatedProducts[index].code = e.target.value
                          setExtraProduct(updatedProducts)
                        }}
                      />
                    </label>
                  </div>
                  <div className="values-product product-unit" data-title="J.m.">
                    <label>
                      <input
                        type="text"
                        value={line.units}
                        onChange={(e) => {
                          const updatedProducts = [...extraProduct]
                          updatedProducts[index].units = e.target.value
                          setExtraProduct(updatedProducts)
                        }}
                      />
                    </label>
                  </div>
                  <div className="values-product product-quantity" data-title="Ilość">
                    <label>
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => {
                          const updatedProducts = [...extraProduct]
                          updatedProducts[index].quantity = Number(e.target.value)
                          setExtraProduct(updatedProducts)
                        }}
                      />
                    </label>
                  </div>
                  <div className="values-product net-price" data-title="Cena netto">
                    {line.netPrice.toFixed(2)}
                  </div>
                  <div className="values-product vat" data-title="VAT">
                    <label>
                      <input
                        type="number"
                        value={line.vat}
                        onChange={(e) =>
                          updateProductTotals(
                            line.productName,
                            'vat',
                            Number(e.target.value),
                            setExtraProduct,
                          )
                        }
                      />
                      %
                    </label>
                  </div>
                  <div className="values-product gross-price" data-title="Cena brutto">
                    <label>
                      <input
                        type="number"
                        step=".01"
                        value={line.grossPrice}
                        onChange={(e) =>
                          updateProductTotals(
                            line.productName,
                            'grossPrice',
                            Number(e.target.value),
                            setExtraProduct,
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="values-product total-net" data-title="Wartość netto">
                    {Number(line.totalNet).toFixed(2)}
                  </div>
                  <div className="values-product total-gross" data-title="Wartość brutto">
                    {Number(line.totalGross).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="add-extra-product">
                <button onClick={addExtraProduct}>Dodaj nowy produkt</button>
              </div>
            </div>
          </div>
        )}
        {((summarySale && Object.keys(summarySale).length > 0) ||
          (summaryReturns && Object.keys(summaryReturns).length > 0)) && (
          <div className="generateButton">
            <button
              className={isInvoiceVisible ? 'hide' : ''}
              onClick={() => !isInvoiceVisible && setIsInvoiceVisible(true)}
            >
              Wygeneruj fakturę
            </button>
          </div>
        )}
        {isInvoiceVisible && (
          <InvoiceLayout
            extraProduct={extraProduct}
            invoiceData={invoiceData}
            productsData={productsData}
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
  padding-bottom: 6rem;
  flex-grow: 1;
  color: #333232;

  @media screen and (max-width: ${size.tabletS}) {
    padding-top: 1rem;
  }

  .details-container {
    background-color: #f5f5f5;
    width: 40%;
    border-radius: 15px;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
    padding: 1rem 1rem;
    margin: auto;
  }

  .invoices-details {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
    flex-direction: column;
  }

  .title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333232;
    padding-left: 1rem;
    margin: 1rem;
  }

  .invoice-details {
    width: 100%;
  }

  .invoice-seller {
    width: 90%;
  }

  .invoice-seller,
  .invoiceNumber,
  .city,
  .invoice-date,
  .sale-end-date,
  .payment-date,
  .payment-type,
  .dateRange,
  .shopName,
  .shopAddress,
  .comment,
  .addressDetails {
    margin: 0.8rem auto 0.8rem auto;
    width: 100%;

    .text {
      margin-left: 5%;
    }

    textarea,
    input,
    select,
    .address {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
      width: 90%;
      border-radius: 10px;
      transition: border-color 0.3s ease;
      margin: 0.8rem auto 0.8rem auto;
      font-family: 'Lato', sans-serif;
      font-size: 0.9rem;
      border: 1px solid #a3a3a3;
    }
    textarea:focus,
    input:focus,
    select:focus {
      border-color: #653db5; /* Border color on focus */
      outline: none; /* Remove default outline */
      box-shadow: 0 0 5px rgba(127, 127, 127, 0.5); /* Add shadow for focus effect */
    }
  }

  .address {
    width: 87% !important;
  }

  .dates-of-sales {
    display: flex;
    flex-direction: row;
    width: 90%;
    margin: auto;

    input {
      width: 45%;
      margin: 0.3rem;
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
    width: 90%;
    border: none;
    padding: 0.5rem 1.5rem;
    position: relative;
    line-height: 24px;
    overflow: hidden;
    text-align: center;
    display: inline-block;
    border-radius: 10px;
    background-color: #8162c6;
    font-weight: bold;
    outline: none;
    height: 100%;
    margin: 1rem auto;
    color: #fdfdfd;
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
    width: 100%;
    margin: auto;
  }

  .titles-data,
  .product-details-data {
    display: grid;
    grid-template-columns: [first] 3rem [line2] 30% repeat(8, 1fr);

    input {
      width: 60%;
    }
  }

  .values-titles,
  .values-product {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid #818181;
  }

  .values-titles {
    padding: 0.5rem 0.1rem 0.5rem 0.1rem;
    background: #dbdbdb;
  }

  .values-product {
    padding: 0.3rem 0.1rem 0.3rem 0.1rem;
  }

  .values-product.product-name {
    justify-content: flex-start;
  }

  .values-product[data-title='Towar/Usługa'] input {
    width: 100%;
  }

  @media screen and (max-width: ${size.tablet}) {
    .details-container {
      width: 80%;
    }

    .titles-data {
      display: none;
    }
    .product-details-data {
      display: flex;
      flex-direction: column;
      border: 1px solid #ddd;
      margin-bottom: 10px;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 10px;
      box-shadow:
        0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }

    .values-product {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-right: 10px;
      border: none;
      border-bottom: 1px solid #d2d2d2;
    }

    .values-product::before {
      content: attr(data-title);
      display: inline-block;
      width: 120px;
      text-align: left;
      padding-left: 10px;
      color: #6a6a6a;
    }

    .values-product label {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
    }

    .values-product input {
      width: 5rem;
      font-weight: 500;
      margin-left: auto;
      text-align: right;
      border-radius: 5px;
      border: 1px solid #cdcdcd;
      font-size: 0.9rem;
      font-family: 'Lato', sans-serif;
    }

    .values-product.number[data-title='Dodaj']::before {
      content: attr(data-title);
      font-weight: bold;
      color: #8162c6;
      font-size: 1rem;
    }

    .values-product[data-title='Towar/Usługa'] input {
      width: 80%;
    }

    .values-product.product-name {
      justify-content: space-between;
    }
  }

  /* Chrome, Safari, Edge, and Opera */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }

  .values-container {
    background-color: #f5f5f5;
    width: 95%;
    border-radius: 15px;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
    padding: 1rem 1rem;
    margin: 2rem auto 1rem auto;
    font-size: 0.9rem;

    @media screen and (max-width: ${size.tablet}) {
      width: 80%;
    }
  }

  .add-extra-product {
    button {
      border-radius: 10px;
      background-color: #dbdbdb;
      font-weight: bold;
      outline: none;
      height: 100%;
      margin: 1rem auto;
      color: #383838;
      cursor: pointer;
      box-shadow:
        6px 6px 8px 0 rgba(0, 0, 0, 0.3),
        -12px -12px 24px 0 rgba(255, 255, 255, 0.5);
      align-items: center;
      justify-content: center;
      border: none;
      padding: 0.5rem 1.5rem;
    }
  }

  .generateButton {
    button {
      border-radius: 10px;
      background: linear-gradient(to bottom right, #c91a97, #c376a7);
      font-weight: bold;
      font-size: 1rem;
      outline: none;
      height: 100%;
      margin: 1rem auto;
      color: #f3f3f3;
      cursor: pointer;
      box-shadow:
        6px 6px 8px 0 rgba(0, 0, 0, 0.3),
        -12px -12px 24px 0 rgba(255, 255, 255, 0.5);
      align-items: center;
      justify-content: center;
      border: none;
      padding: 0.5rem 4rem;
    }
  }

  .hide {
    display: none;
  }

  .error-notification {
    background-color: #f8d7da;
    width: 80%;
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

    @media screen and (max-width: ${size.tablet}) {
      width: 80%;
    }
  }

  .payment-type-field {
    width: 93% !important;
  }
`
export default InvoicePage
