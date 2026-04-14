import * as React from 'react'
import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { Navbar, Sidebar, Footer, InvoiceLayout } from '../components/index'
import { size } from '../styles/devices'
import { fetchData } from '../api/fetchAPI.ts'
// import n2words from 'n2words'
import Big from 'big.js'
import useTemporaryMessage from '../hooks/useTemporaryMessage'
import { SaleValue, SettingsData, BuyerData } from '../types'
import { validateInvoiceData } from '../utils/invoiceValidator'
import { saveInvoice, updateInvoiceStatus, updateInvoice } from '../utils/invoiceStorage'

const { VITE_APP_SETTINGS_API, VITE_APP_SALES_API, VITE_APP_RETURNS_API } = import.meta
  .env

const pageTitle = 'Faktury'

interface DateObject {
  name: string
}

interface Product {
  checked: boolean
  product?: string // Optional because it might not exist in extraProduct
  productName: string
  code: string
  units: string
  quantity: number
  netPrice: number
  vat: number
  grossPrice: number
  totalNet: number
  totalGross: number
  id?: string // Optional unique ID
}

interface InvoiceData {
  shopName: string
  buyer_data?: BuyerData
  startDate: string
  endDate: string
  city: string
  invoiceDate: string
  endSaleDate: string
  paymentDate: string
  paymentType: 'Przelew' | 'Gotówka'
  seller: string
  invoiceNumber: string
  comment: string
}

interface SummaryData {
  [productName: string]: number
}

const InvoicePage = () => {
  const today = new Date().toISOString().split('T')[0]

  const [messageText, showMessage] = useTemporaryMessage()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  // const [dates, setDates] = useState<DateObject[]>([])
  const [sale, setSale] = useState<SaleValue[] | null>(null)
  const [returns, setReturns] = useState<SaleValue[] | null>(null)
  const [summarySale, setSummarySale] = useState<SummaryData>({})
  const [summaryReturns, setSummaryReturns] = useState<SummaryData>({})
  const [isInvoiceVisible, setIsInvoiceVisible] = useState<boolean>(false)
  const [extraProduct, setExtraProduct] = useState<Product[]>([])
  // const [titlesVisibility, setTitlesVisibility] =
  // useState(false)
  const initialInvoiceData: InvoiceData = {
    shopName: '',
    buyer_data: undefined,
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

  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData)

  const [productsData, setProductsData] = useState<Product[]>([
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

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }

  const updatePaymantDate = useCallback((date: string) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 7)
    setInvoiceData((prevState) => ({
      ...prevState,
      paymentDate: formatDate(newDate),
    }))
  }, [])

  const getDatesBetween = useCallback(
    (startDate: string, endDate: string): DateObject[] => {
      const dates: DateObject[] = []
      const currentDate = new Date(startDate)

      while (currentDate <= new Date(endDate)) {
        dates.push({
          name: formatDate(new Date(currentDate)),
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
      // setDates(dates)
      return dates
    },
    [],
  )

  const handleError = useCallback(
    (error: unknown) => {
      console.error('Error fetching data:', error)
      showMessage('❌ Problem z pobraniem danych!', 6000)
    },
    [showMessage],
  )

  // Overload for fetching SettingsData
  function fetchDataByAPI(
    url: typeof VITE_APP_SETTINGS_API,
    setDatafromAPI: (data: SettingsData) => void,
  ): Promise<SettingsData>

  // Overload for fetching SaleValue[] (assuming your sales/returns endpoints return arrays)
  function fetchDataByAPI(
    url: string,
    setDatafromAPI: (data: SaleValue[]) => void,
  ): Promise<SaleValue[]>

  // const fetchDataByAPI = useCallback(
  //   async (url: string, setDatafromAPI: (data: SaleValue | SettingsData) => void) => {
  //     try {
  //       const data = await fetchData(url)
  //       setDatafromAPI(data)
  //       return data
  //     } catch (error) {
  //       handleError(error)
  //       throw error
  //     }
  //   },
  //   [handleError],
  // )

  // Generic implementation
  function fetchDataByAPI<T extends SaleValue | SettingsData>(
    url: string,
    setDatafromAPI: (data: T) => void,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      fetchData(url)
        .then((data) => {
          const typedData = data as T
          setDatafromAPI(typedData)
          resolve(typedData)
        })
        .catch((error) => {
          handleError(error)
          reject(error)
        })
    })
  }

  const loadSettings = useCallback(async () => {
    try {
      await fetchDataByAPI(VITE_APP_SETTINGS_API, (data) => {
        setSettings(data)
        // const updatedProductData = productsData.map((product) => {
        //   const price = data.prices[product.product]
        const updatedProductData = productsData
          .filter((product) => product.product !== undefined)
          .map((product) => {
            const price = data.prices[product.product as string]
            return {
              ...product,
              grossPrice:
                price !== undefined
                  ? Number((price / 100).toFixed(2))
                  : product.grossPrice,
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
        showMessage('✅ Dane zostały pobrane! Wybierz Sklep.', 6000)
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

  const summary = useCallback(
    (
      data: SaleValue[] | null,
      shop: string,
      stateVar: React.Dispatch<React.SetStateAction<SummaryData>>,
    ) => {
      const filteredByShop = data?.filter((d) => d.shop === shop)

      const productSum =
        filteredByShop?.reduce((acc: SummaryData, curr) => {
          const { product, quantity } = curr
          if (!acc[product]) {
            acc[product] = 0
          }
          acc[product] += quantity

          return acc
        }, {}) || {}
      return stateVar(productSum)
    },
    [],
  )

  const calculateNetPrice = (grossPrice: number, vat: number): number => {
    const netPrice = Big(grossPrice).div(Big(1).plus(Big(vat).div(100)))
    return Number(netPrice.toFixed(2))
  }

  const calculateTotalNet = (
    vat: number,
    quantity: number,
    grossPrice: number,
  ): number => {
    const grossDecimal = Big(quantity).times(grossPrice) // Convert gross to Big.js instance
    const vatMultiplier = Big(1).plus(Big(vat).div(100)) // Calculate VAT multiplier
    const net = grossDecimal.div(vatMultiplier) // Divide gross by VAT multiplier
    return Number(net.toFixed(2)) // Round to 2 decimal places
  }

  const calculateTotalGross = (quantity: number, grossPrice: number): number => {
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
    const updateProductQuantityTotals = productsData
      .filter((product) => product.product !== undefined)
      .map((product) => {
        const quantity = totals[product.product as string] || 0 // Type assertion is safe after filtering
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

  // const updateProductTotals = useCallback((productName, title, value, setState) => {
  //   setState((prev) =>
  //     prev.map((p) => {
  //       if (p.product === productName.product) {
  //         const updatedProduct = { ...p, [title]: value }
  //         const netPrice = calculateNetPrice(
  //           updatedProduct.grossPrice,
  //           updatedProduct.vat,
  //         )
  //         const totalNet = calculateTotalNet(
  //           updatedProduct.vat,
  //           updatedProduct.quantity,
  //           updatedProduct.grossPrice,
  //         )
  //         const totalGross = calculateTotalGross(
  //           updatedProduct.quantity,
  //           updatedProduct.grossPrice,
  //         )
  //         return {
  //           ...updatedProduct,
  //           netPrice: netPrice,
  //           totalNet: totalNet,
  //           totalGross: totalGross,
  //         }
  //       }
  //       return p
  //     }),
  //   )
  // })

  const updateProductTotals = useCallback(
    (
      productToUpdate: Product, // Explicitly type productName as Product
      title: keyof Omit<
        Product,
        | 'checked'
        | 'productName'
        | 'code'
        | 'units'
        | 'netPrice'
        | 'totalNet'
        | 'totalGross'
        | 'product'
      >,
      value: number,
      setState: Dispatch<SetStateAction<Product[]>>,
    ) => {
      setState(
        (
          prev: Product[], // Explicitly type 'prev' as Product[]
        ) =>
          prev.map((p: Product) => {
            // Explicitly type 'p' as Product
            if (
              p.product === productToUpdate.product ||
              p.productName === productToUpdate.productName
            ) {
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
    },
    [calculateNetPrice, calculateTotalNet, calculateTotalGross], // Add the dependency array
  )

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

  const generateKSeFInvoice = useCallback(async () => {
    let savedInvoiceId: string | null = null

    try {
      const invoicePayload = {
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        endSaleDate: invoiceData.endSaleDate,
        city: invoiceData.city,
        startDate: invoiceData.startDate,
        endDate: invoiceData.endDate,
        paymentDate: invoiceData.paymentDate,
        paymentType: invoiceData.paymentType,
        shopName: invoiceData.shopName,
        seller: invoiceData.seller,
        comment: invoiceData.comment,
        buyer_data: invoiceData.buyer_data,
        products: [...productsData, ...extraProduct],
      }

      // Calculate totals
      const checkedProducts = [...productsData, ...extraProduct].filter((p) => p.checked)
      const totalGross = checkedProducts.reduce(
        (sum, p) => Big(sum).plus(p.totalGross).toNumber(),
        0,
      )
      const totalNet = checkedProducts.reduce(
        (sum, p) => Big(sum).plus(p.totalNet).toNumber(),
        0,
      )

      // STEP 1: Validate (client-side)
      showMessage('🔍 Sprawdzanie poprawności faktury...', 2000)
      const validation = validateInvoiceData(invoicePayload)

      if (validation.warnings && validation.warnings.length > 0) {
        const warningsText = validation.warnings.join('\n• ')
        console.warn('⚠️ Ostrzeżenia:', validation.warnings)
        showMessage(`⚠️ Ostrzeżenia:\n• ${warningsText}`, 8000)
      }

      if (!validation.isValid) {
        const errorsText = validation.errors.join('\n• ')
        showMessage(
          `❌ Błędy walidacji faktury:\n\n• ${errorsText}\n\nPopraw dane i spróbuj ponownie.`,
          15000,
        )
        return
      }

      // STEP 2: Generate XML (client-side)
      showMessage('📄 Generowanie XML faktury...', 2000)

      const { generateFA3Invoice } = await import('../utils/xmlGenerator.js')
      const invoiceXML = generateFA3Invoice(invoicePayload)

      // Save XML locally with temp filename
      const safeInvoiceNumber = invoiceData.invoiceNumber.replace(/\//g, '-')
      const tempXmlFileName = `${safeInvoiceNumber}_draft.xml`

      const blob = new Blob([invoiceXML], { type: 'text/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = tempXmlFileName
      a.click()
      URL.revokeObjectURL(url)
      console.log('✅ XML saved to Downloads folder')

      // STEP 2.5: Save invoice to localStorage with draft status
      const savedInvoice = saveInvoice({
        invoiceNumber: invoiceData.invoiceNumber,
        shopName: invoiceData.shopName,
        buyerNip: invoiceData.buyer_data?.nip || '',
        invoiceDate: invoiceData.invoiceDate,
        totalGross,
        totalNet,
        ksefStatus: 'draft',
        xmlFileName: tempXmlFileName,
      })
      savedInvoiceId = savedInvoice.id
      console.log('✅ Invoice saved to localStorage:', savedInvoice)

      // STEP 3: Encode to base64
      const invoiceBase64 = btoa(unescape(encodeURIComponent(invoiceXML)))

      // Get passphrase from env
      const passphrase = import.meta.env.VITE_KSEF_PASSPHRASE
      const ksefApiUrl =
        import.meta.env.VITE_KSEF_API_URL || 'http://localhost:8000/invoices'

      if (!passphrase) {
        updateInvoiceStatus(savedInvoiceId, 'error', {
          ksefErrorMessage: 'Brak hasła KSeF w konfiguracji',
        })
        showMessage(
          '❌ Brak hasła KSeF. Skonfiguruj VITE_KSEF_PASSPHRASE w .env.local',
          10000,
        )
        return
      }

      // STEP 4: Send directly to ssapi
      showMessage('✅ Walidacja OK. Wysyłanie faktury do KSeF...', 3000)

      // Update status to sending
      updateInvoiceStatus(savedInvoiceId, 'sending')

      const sellerNip = '8442120248' // Your company NIP

      const response = await fetch(ksefApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passphrase: passphrase,
          invoice: invoiceBase64,
          nip: sellerNip,
        }),
      })

      const data = await response.json()

      const referenceNumber = data.referenceNumber || data.outcome?.referenceNumber

      if (response.ok && referenceNumber) {
        console.log('✅ KSeF Response:', data)

        // Update invoice with KSeF reference and status
        updateInvoiceStatus(savedInvoiceId, 'sent', {
          ksefReferenceNumber: referenceNumber,
        })

        // STEP 5: Get invoice details from KSeF
        showMessage('✅ Faktura wysłana! Pobieranie szczegółów...', 3000)

        try {
          const detailsResponse = await fetch(`${ksefApiUrl}/${referenceNumber}`, {
            method: 'GET',
          })

          const detailsData = await detailsResponse.json()

          if (detailsResponse.ok && detailsData.ksefNumber) {
            console.log('✅ Invoice details:', detailsData)

            // Extract KSeF invoice number
            const ksefInvoiceNumber = detailsData.ksefNumber

            // Download XML with KSeF invoice number in filename
            const finalXmlFileName = `FV_${safeInvoiceNumber}_KSeF_${ksefInvoiceNumber}.xml`
            const blob2 = new Blob([invoiceXML], { type: 'text/xml' })
            const url2 = URL.createObjectURL(blob2)
            const a2 = document.createElement('a')
            a2.href = url2
            a2.download = finalXmlFileName
            a2.click()
            URL.revokeObjectURL(url2)

            // Download UPO if available
            let upoFileName: string | undefined
            if (detailsData.upo?.xml) {
              upoFileName = `UPO_${ksefInvoiceNumber}.xml`
              const upoBlob = new Blob([detailsData.upo.xml], { type: 'text/xml' })
              const upoUrl = URL.createObjectURL(upoBlob)
              const upoA = document.createElement('a')
              upoA.href = upoUrl
              upoA.download = upoFileName
              upoA.click()
              URL.revokeObjectURL(upoUrl)
              console.log('✅ UPO downloaded:', upoFileName)
            }

            // Determine final status based on KSeF status code
            const statusCode = detailsData.status?.code
            const statusDescription = detailsData.status?.description || 'Brak opisu'
            let finalStatus: 'accepted' | 'rejected' | 'sent' = 'accepted'

            if (statusCode === 200) {
              finalStatus = 'accepted'
            } else if (statusCode >= 400) {
              finalStatus = 'rejected'
            } else {
              finalStatus = 'sent' // Still processing (100, 150, etc.)
            }

            // Update invoice with final details
            updateInvoiceStatus(savedInvoiceId, finalStatus, {
              ksefReferenceNumber: referenceNumber,
            })
            updateInvoice(savedInvoiceId, {
              xmlFileName: finalXmlFileName,
              upoFileName: upoFileName,
              ksefNumber: ksefInvoiceNumber, // Save KSeF invoice number
            })

            // Build success message with status description from API
            let successMessage = `✅ Faktura wysłana do KSeF!\n\nNumer faktury KSeF:\n${ksefInvoiceNumber}\n\nStatus (${statusCode}): ${statusDescription}`
            if (validation.warnings && validation.warnings.length > 0) {
              const warningsText = validation.warnings.join('\n• ')
              successMessage += `\n\n⚠️ Ostrzeżenia:\n• ${warningsText}`
            }

            // Keep error messages on screen until manually closed
            const isError = finalStatus === 'rejected'
            showMessage(successMessage, isError ? null : 15000)
          } else {
            // GET request succeeded but no KSeF number yet
            const statusCode = detailsData?.status?.code || 'N/A'
            const statusDescription =
              detailsData?.status?.description || 'Szczegóły niedostępne'

            showMessage(
              `⚠️ Faktura wysłana, ale szczegóły nie są dostępne\n\nStatus (${statusCode}): ${statusDescription}\n\n(nr ref: ${referenceNumber})`,
              null, // Stay until closed
            )
            console.warn('⚠️ No ksefNumber in response:', detailsData)
          }
        } catch (detailsError) {
          console.error('❌ Error fetching invoice details:', detailsError)
          showMessage(
            `✅ Faktura wysłana!\n\n⚠️ Nie udało się pobrać szczegółów z KSeF\n\n(nr ref: ${referenceNumber})`,
            null, // Stay until closed
          )
        }
      } else {
        // Update status to error
        updateInvoiceStatus(savedInvoiceId, 'error', {
          ksefErrorMessage: data.error || 'Nieznany błąd KSeF',
        })
        showMessage(`❌ Błąd: ${data.error || 'Nieznany błąd'}`, null) // Stay until closed
        console.error('❌ KSeF Error:', data)
      }
    } catch (error) {
      if (savedInvoiceId) {
        updateInvoiceStatus(savedInvoiceId, 'error', {
          ksefErrorMessage: (error as Error).message,
        })
      }
      showMessage('❌ Błąd połączenia z serwerem', 6000)
      console.error('Error:', error)
    }
  }, [invoiceData, productsData, extraProduct, showMessage])

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
      <PopupNotification
        $visible={!!messageText}
        className={
          messageText.includes('✅')
            ? 'success'
            : messageText.includes('⚠️')
              ? 'warning'
              : 'error'
        }
      >
        <button className="close-btn" onClick={() => showMessage('', 0)}>
          ×
        </button>
        <pre>{messageText}</pre>
      </PopupNotification>
      <Container>
        <div className="details-container">
          <div className="invoices-details">
            <div className="title">Podaj dane do faktury</div>
            <div className="invoice-seller">
              <label htmlFor="seller">
                <div className="text">Sprzedawca:</div>
                <textarea
                  id="seller"
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
                    className="payment-type-field"
                    value={invoiceData.paymentType}
                    onChange={(e) => {
                      setInvoiceData((prevState) => ({
                        ...prevState,
                        paymentType: e.target.value as 'Przelew' | 'Gotówka',
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
                        buyer_data: settings.buyer_data[selectedShop],
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
                {invoiceData.buyer_data && (
                  <div className="address">
                    <div>
                      <strong>{invoiceData.buyer_data.nazwa}</strong>
                    </div>
                    <div>{invoiceData.buyer_data.addressL1}</div>
                    <div>{invoiceData.buyer_data.addressL2}</div>
                    <div>NIP: {invoiceData.buyer_data.nip}</div>
                    {invoiceData.buyer_data.hasPodmiot3 &&
                      invoiceData.buyer_data.podmiot3 && (
                        <>
                          <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                            Odbiorca:
                          </div>
                          <div>{invoiceData.buyer_data.podmiot3.nazwa}</div>
                          <div>{invoiceData.buyer_data.podmiot3.addressL1}</div>
                          <div>{invoiceData.buyer_data.podmiot3.addressL2}</div>
                          <div>ID: {invoiceData.buyer_data.podmiot3.idWew}</div>
                        </>
                      )}
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
                            line,
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
                            line,
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
            onGenerateXML={generateKSeFInvoice}
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

  .payment-type-field {
    width: 93% !important;
  }
`

const PopupNotification = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  min-width: 400px;
  max-width: 600px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  opacity: ${(props) => (props.$visible ? '1' : '0')};
  visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
  transition: all 0.3s ease-in-out;
  border-left: 5px solid #dc3545;

  &.success {
    border-left-color: #28a745;
    background-color: #d4edda;
  }

  &.warning {
    border-left-color: #ffc107;
    background-color: #fff3cd;
  }

  &.error {
    border-left-color: #dc3545;
    background-color: #f8d7da;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #333;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #333;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }

  @media screen and (max-width: ${size.tabletS}) {
    min-width: 300px;
    max-width: calc(100vw - 40px);
    left: 50%;
    transform: translateX(-50%);
  }
`
export default InvoicePage
