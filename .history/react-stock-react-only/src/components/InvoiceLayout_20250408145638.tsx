import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
// import { size } from '../styles/devices'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import PropTypes from 'prop-types'
import n2words from 'n2words' //*
import signature from '../assets/signature.png'
import logoComp from '../assets/Logo.png'
const { VITE_APP_BANK_ACCOUNT } = import.meta.env

interface ProductData {
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

interface VatGroup {
  totalNet: number
  totalGross: number
}

interface InvoiceLayoutProps {
  invoiceData: InvoiceData
  productsData: ProductData[]
  extraProduct: ProductData[]
}

type VatTotals = {
  [key: string]: {
    totalNet: number
    totalGross: number
  }
}

const InvoiceLayout = ({
  invoiceData,
  productsData,
  extraProduct,
}: InvoiceLayoutProps) => {
  // const [totals, setTotals] = useState([]) //*
  const [vatTotals, setVatTotals] = useState<{ [key: number]: VatGroup }>({}) //*
  const [vatSum, setVatSum] = useState<{ totalNet: number; totalGross: number }>({
    totalNet: 0,
    totalGross: 0,
  }) //*
  const invoiceRef = useRef<HTMLDivElement | null>(null)

  const formatDate = (date: string | undefined) => {
    if (!date) {
      return ''
    }
    const reverseDate = date.split('-').reverse().join('-')
    return reverseDate
  }

  const allProducts = [...productsData, ...extraProduct]

  //productsData data filtered by checked
  const filteredProducts = allProducts.filter((product) => product.checked)

  console.log('Filtered all Products:', filteredProducts)

  const paymentSpelling = () => {
    const sum = n2words(Math.trunc(vatSum.totalGross), {
      lang: 'pl',
    })
    return sum
  }

  const calculateVatTotals = () => {
    const vatGroups: { [key: number]: VatGroup } = {}
    let overallNetTotals = 0
    let overallGrossTotals = 0

    filteredProducts.forEach((item) => {
      const vatRate = item.vat
      if (!vatGroups[vatRate]) {
        vatGroups[vatRate] = { totalNet: 0, totalGross: 0 }
      }
      vatGroups[vatRate].totalNet += item.totalNet
      vatGroups[vatRate].totalGross += item.totalGross

      overallNetTotals += item.totalNet
      overallGrossTotals += item.totalGross
    })

    setVatTotals(vatGroups)
    setVatSum({
      totalNet: Number(overallNetTotals) || 0,
      totalGross: Number(overallGrossTotals) || 0,
    })
  }

  useEffect(() => {
    calculateVatTotals()
  }, [productsData, extraProduct])

  const generatePdf = async () => {
    // Temporarily remove scaling styles for PDF generation
    const originalTransform = invoiceRef.current.style.transform
    invoiceRef.current.style.transform = 'none'

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 3, // Increase the scale (default is 1)
      useCORS: true, // Allow external resources like fonts and images
    })

    // Restore the original styles after capturing
    invoiceRef.current.style.transform = originalTransform

    const imgData = canvas.toDataURL('image/jpeg', 0.5)
    const pdf = new jsPDF('portrait', 'mm', 'a4') // A4 size PDF

    const imgWidth = 210 // PDF width (A4)
    const imgHeight = (canvas.height * imgWidth) / canvas.width // Calculate height to keep aspect ratio
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdf.internal.pageSize.height

    // Add extra pages if content overflows
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdf.internal.pageSize.height
    }
    pdf.save(`${invoiceData.invoiceNumber}_${invoiceData.shopName}.pdf`)
  }

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth
      // const viewportHeight = window.innerHeight

      // // Invoice original dimensions
      // const invoiceWidth = 880 // Original width of the invoice
      // const invoiceHeight = 297 * 3.77953 // Convert mm to px (1 mm = 3.77953 px)

      // Set scaling behavior based on viewport width
      let scaleFactor = 1

      if (viewportWidth < 500) {
        // Scale to 0.5 when the viewport is less than 500px
        scaleFactor = 0.4
      } else if (viewportWidth >= 600 && viewportWidth < 800) {
        // Scale to 0.8 when the viewport is between 500px and 800px
        scaleFactor = 0.7
      } else if (viewportWidth >= 800) {
        // No scaling for screens wider than 800px
        scaleFactor = 1
      } else if (viewportWidth >= 500 && viewportWidth < 600) {
        // Scale to 0.8 when the viewport is between 500px and 800px
        scaleFactor = 0.6
      }

      // Apply the scaling if the invoiceRef is available
      if (invoiceRef.current) {
        invoiceRef.current.style.transform = `scale(${scaleFactor})`
        invoiceRef.current.style.transformOrigin = 'top center' // Anchor scaling at top-center
      }
    }

    handleResize() // Initial scaling
    window.addEventListener('resize', handleResize) // Adjust on resize

    return () => {
      window.removeEventListener('resize', handleResize) // Cleanup
    }
  }, [])
  return (
    <Container>
      <div className="generate_pdf">
        <button onClick={generatePdf}>Zapisz PDF</button>
      </div>
      <div ref={invoiceRef} className="invoice-preview">
        <div className="invoice-header">
          <div className="invoice-logo">
            <img src={logoComp} className="logo" alt="logo Smaczny Kąsek" />
          </div>
          <div className="invoice-info">
            <div className="info">
              <div>Miejsce wystawienia:</div>
              <div className="info-main">{invoiceData.city}</div>
            </div>
            <div className="info">
              <div>Data wystawienia:</div>
              <div className="info-main">{formatDate(invoiceData.invoiceDate)}</div>
            </div>
            <div className="info">
              <div>Data zakoczenia dostawy/usługi:</div>
              <div className="info-main">{formatDate(invoiceData.endSaleDate)}</div>
            </div>
            <div className="info">
              <div>Okres dostawy:</div>
              <div className="info-main">
                {formatDate(invoiceData.startDate)} - {formatDate(invoiceData.endDate)}
              </div>
            </div>
          </div>
        </div>
        <div className="invoice-number">Faktura nr: {invoiceData.invoiceNumber}</div>
        <div className="seller-buyer">
          <div className="seller">
            <div className="seller-title">Sprzedawca</div>
            <div className="seller-address">{invoiceData.seller}</div>
          </div>
          <div className="buyer">
            <div className="buyer-title">Nabywca</div>
            <div className="buyer-address">{invoiceData.address}</div>
          </div>
        </div>
        <div className="bank-account">
          <div className="account">
            <div>Nr konta: </div>
            <div className="account-number">{VITE_APP_BANK_ACCOUNT}</div>
          </div>
          <div className="swift">
            <div>Nr SWIFT/BIC: </div>
            <div className="swift-number">BPKOPLPW</div>
          </div>
        </div>

        <div className="titles">
          <div className="title-table number">Lp.</div>
          <div className="title-table product-name">Towar/Usługa</div>
          <div className="title-table product-code">PKWIU</div>
          <div className="title-table product-unit">J.m.</div>
          <div className="title-table product-quantity">Ilość</div>
          <div className="title-table net-price">Cena netto</div>
          <div className="title-table vat">VAT</div>
          <div className="title-table gross-price">Cena brutto</div>
          <div className="title-table total-net">Wartość netto</div>
          <div className="title-table total-gross">Wartość brutto</div>
        </div>

        {filteredProducts.map((line, index) => (
          <div className="product-details" key={index}>
            <div className="details number-details">{index + 1}</div>
            <div className="details product-name-details">{line.productName}</div>
            <div className="details product-code-details">{line.code}</div>
            <div className="details product-unit-details">{line.units}</div>
            <div className="details product-quantity-details">
              {line.quantity.toFixed(2)}
            </div>
            <div className="details net-price-details">{line.netPrice.toFixed(2)}</div>
            <div className="details product-vat-details">{line.vat}%</div>
            <div className="details gross-price-details">
              {line.grossPrice.toFixed(2)}
            </div>
            <div className="details total-net-details">{line.totalNet.toFixed(2)}</div>
            <div className="details total-gross-details">
              {line.totalGross.toFixed(2)}
            </div>
          </div>
        ))}
        <div className="summary">
          <div className="summary-text">Razem w PLN</div>
          <div className="summary-net">
            {allProducts.length > 0 &&
              filteredProducts.reduce((acc, cur) => acc + cur.totalNet, 0).toFixed(2)}
          </div>
          <div className="summary-gross">
            {allProducts.length > 0 &&
              filteredProducts.reduce((acc, cur) => acc + cur.totalGross, 0).toFixed(2)}
          </div>
        </div>
        <div className="totals-vat">
          <div className="totalsVat">
            <div className="totalsVat-title">SUMA WEDŁUG STAWEK VAT W PLN</div>
            <div className="totalsVat-header">
              <div className="totalsVat-vat">VAT</div>
              <div className="totalsVat-net">Netto</div>
              <div className="totalsVat-totalVat">Kwota VAT</div>
              <div className="totalsVat-totalGross">Brutto</div>
            </div>
            {vatTotals &&
              Object.keys(vatTotals).length > 0 &&
              Object.keys(vatTotals).map((key) => (
                <div key={key} className="totalsVat-values">
                  <div className="valueTotals-vat">{key}%</div>
                  <div className="valueTotals-net">
                    {vatTotals[key].totalNet.toFixed(2)}
                  </div>
                  <div className="valueTotals-totalVat">
                    {(vatTotals[key].totalGross - vatTotals[key].totalNet).toFixed(2)}
                  </div>
                  <div className="valueTotals-totalGross">
                    {vatTotals[key].totalGross.toFixed(2)}
                  </div>
                </div>
              ))}
            {vatSum && (
              <div className="totals-sum">
                <div className="totals-sum-text">Razem</div>
                <div className="totals-sum-net">{vatSum.totalNet.toFixed(2)}</div>
                <div className="totals-sum-vat">
                  {isNaN(vatSum.totalGross - vatSum.totalNet)
                    ? '0.00'
                    : (vatSum.totalGross - vatSum.totalNet).toFixed(2)}
                </div>
                <div className="totals-sum-gross">{vatSum.totalGross.toFixed(2)}</div>
              </div>
            )}
          </div>
          <div className="payment-method">
            {`Forma płatności:  `}
            <span className="bold-text">{invoiceData.paymentType}</span>
          </div>
          <div className="payment-date">
            {`Termin płatności:  `}
            <span className="bold-text">{formatDate(invoiceData.paymentDate)}</span>
          </div>
          <div className="payment-total">
            {`Razem do zapłaty: ${vatSum.totalGross.toFixed(2)} PLN`}
          </div>
          <div className="payment-spelling">
            {`Razem słownie: ${paymentSpelling()} i ${vatSum.totalGross.toString().split('.')[1] || '0'}/100 PLN`}
          </div>
        </div>
        <div className="comment">{invoiceData.comment}</div>
        <div className="signature-container">
          <img src={signature} className="signature" alt="signature" />
        </div>
        <div className="signatures">
          <div className="signature-seller">Fakturę wystawił</div>
          <div className="signature-receiver">Fakturę odebrał</div>
        </div>
      </div>
    </Container>
  )
}

InvoiceLayout.propTypes = {
  seller: PropTypes.string,
  address: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  checkedItems: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.bool),
    PropTypes.array,
  ]),
  city: PropTypes.string,
  invoiceDate: PropTypes.string,
  endSaleDate: PropTypes.string,
  paymentDate: PropTypes.string,
  paymentType: PropTypes.string,
  prices: PropTypes.objectOf(PropTypes.number),
  productCode: PropTypes.objectOf(PropTypes.string),
  vat: PropTypes.objectOf(PropTypes.number),
  netPrice: PropTypes.objectOf(PropTypes.number),
  invoiceData: PropTypes.shape({
    shopName: PropTypes.string,
    address: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    city: PropTypes.string,
    invoiceDate: PropTypes.string,
    endSaleDate: PropTypes.string,
    paymentDate: PropTypes.string,
    paymentType: PropTypes.string,
    seller: PropTypes.string,
    invoiceNumber: PropTypes.string,
    comment: PropTypes.string,
  }),

  productsData: PropTypes.arrayOf(
    PropTypes.shape({
      checked: PropTypes.bool,
      product: PropTypes.string,
      productName: PropTypes.string,
      code: PropTypes.string,
      units: PropTypes.string,
      quantity: PropTypes.number,
      netPrice: PropTypes.number,
      vat: PropTypes.number,
      grossPrice: PropTypes.number,
      totalNet: PropTypes.number,
      totalGross: PropTypes.number,
    }),
  ),
  extraProduct: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.string,
      code: PropTypes.string,
      units: PropTypes.string,
      quantity: PropTypes.number,
      price: PropTypes.number,
      vat: PropTypes.number,
      totalNet: PropTypes.number,
      totalGross: PropTypes.number,
    }),
  ),
  invoiceNumber: PropTypes.string,
  productDetails: PropTypes.shape({
    Kartacze: PropTypes.shape({
      name: PropTypes.string,
    }),
    Babka: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
  totalsOfSale: PropTypes.objectOf(PropTypes.number),
  calculateNet: PropTypes.func,
  comment: PropTypes.string,
  setInvoiceVisibility: PropTypes.func,
  paymentSpelling: PropTypes.func,
}

const Container = styled.div`
  /* display: 'flex';
  justify-content: 'center';
  align-items: 'flex-start'; // Align invoice to the top
  width: '100vw';
  height: '100vh'; */
  flex-direction: column;
  /* overflow: 'hidden'; // Prevent unwanted scrolling */
  margin: 1rem;

  .logo {
    height: 5rem;
    padding-left: 1rem;
  }

  .invoice-preview {
    /* width: 100%; */
    padding: 35px;
    /* border: 1px solid #ddd; */
    /* margin-bottom: 20px; */
    width: 800px;
    height: 297mm;
    background-color: white;
    position: relative;
    overflow: auto;
    margin: 0 auto 20px auto;
    /* transform-origin: top center; */
    transition: transform 0.3s ease; /* Smooth scaling */
  }

  .invoice-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
  }

  .seller-info h2 {
    margin: 0;
    font-size: 10px;
  }

  .invoice-info {
    display: flex;
    flex-direction: column;
  }

  .info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .info-main {
      font-weight: bold;
      padding-left: 1rem;
    }
  }

  .invoice-number {
    border-bottom: 2px solid #818181;
    border-top: 2px solid #818181;
    background-color: #c6e0eb;
    padding: 10px;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .seller-buyer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .seller {
    width: 45%;
  }

  .buyer {
    width: 45%;
  }

  .seller-title,
  .buyer-title {
    font-size: 1.2rem;
    font-weight: bold;
    padding-top: 2rem;
    border-bottom: 3px solid #818181;
  }

  .seller-address,
  .buyer-address {
    display: flex;
    flex-direction: column;
    white-space: pre-line;
    font-weight: bold;
    padding-top: 10px;
  }

  .bank-account {
    display: flex;
    flex-direction: column;
  }

  .account,
  .swift {
    display: flex;
    flex-direction: row;
    padding: 5px 0;
  }

  .account-number,
  .swift-number {
    font-weight: bold;
  }

  .bank-account {
    padding: 2.5rem 0 1.2rem 0;
  }

  .invoice-body {
    padding-top: 20px;
  }

  .titles,
  .product-details {
    display: grid;
    grid-template-columns: [first] 3rem [line2] 30% repeat(8, 1fr);
    font-size: 0.9rem;

    .title-table {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      border: 1px solid #818181;
    }
  }
  .titles {
    background-color: #c6e0eb;
    border: 1px solid #818181;
  }

  .product-details {
    text-align: left;
    justify-content: center;
    font-size: 0.9rem;
  }

  .details {
    border-left: 1px solid #818181;
    border-bottom: 1px solid #818181;
    padding: 3px 3px;
  }

  .total-gross-details {
    border-right: 1px solid #818181;
  }

  .number-details,
  .product-unit-details {
    text-align: center;
  }

  .product-code-details,
  .product-quantity-details,
  .net-price-details,
  .product-vat-details,
  .gross-price-details,
  .total-net-details,
  .total-gross-details {
    text-align: right;
  }

  .summary {
    display: grid;
    grid-template-columns: [first] 3rem [line2] 30% repeat(8, 1fr);
    font-size: 0.9rem;
    font-weight: bold;
    text-align: right;
    align-items: center;
  }

  .summary-text {
    grid-column-start: 7;
    grid-column-end: 9;
    padding: 3px;
  }

  .summary-net {
    grid-column-start: 9;
    grid-column-end: 10;
    padding-right: 1px;
    border-bottom: 1px solid #818181;
    border-left: 1px solid #818181;
    padding: 3px;
  }

  .summary-gross {
    grid-column-start: 10;
    grid-column-end: 11;
    padding: 3px;
    border-bottom: 1px solid #818181;
    border-right: 1px solid #818181;
    border-left: 1px solid #818181;
  }

  button {
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #20a8de;
    color: white;
    border: none;
    cursor: pointer;
  }
  .totals-vat {
    width: 50%;
    display: flex;
    flex-direction: column;
    margin-left: auto;
    margin-top: 2rem;
    font-size: 0.9rem;
  }

  .totalsVat {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto auto auto auto; /* 4 rows, height adjusts automatically */
    align-items: center; /* Center items in each grid cell */
  }

  .totalsVat-header {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    background-color: #c6e0eb;
  }

  .totalsVat-title {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3px;
    border: 1px solid #818181;
  }

  .totalsVat-values {
    grid-column: 1 / -1; /* Span all columns */
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr; /* Match the main grid columns */
  }

  .totals-sum {
    grid-column: 1 / -1; /* Span all columns */
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr; /* Match the main grid columns */
    border: 1px solid #666666;
    background-color: #c6e0eb;
    font-weight: bold;
  }

  .totalsVat-net,
  .totalsVat-vat,
  .totalsVat-totalVat,
  .totalsVat-totalGross,
  .valueTotals-net,
  .valueTotals-vat,
  .valueTotals-totalVat,
  .valueTotals-totalGross,
  .totals-sum-text,
  .totals-sum-net,
  .totals-sum-vat,
  .totals-sum-gross {
    border-left: 1px solid #818181;
    border-bottom: 1px solid #818181;
    padding: 3px;
  }

  .totalsVat-totalGross,
  .valueTotals-totalGross,
  .totals-sum-gross {
    border-right: 1px solid #818181;
  }

  .bold-text {
    font-weight: bold;
  }

  .payment-method,
  .payment-date {
    margin-top: 0.5rem;
  }

  .payment-total {
    margin-top: 1.5rem;
    font-size: 1.2rem;
    font-weight: bold;
    text-decoration: underline;
    background-color: #c6e0eb;
    padding: 5px 0 5px 5px;
  }

  .payment-spelling {
    margin-top: 0.8rem;
  }

  .signature-seller,
  .signature-receiver {
    border-top: 1px dashed #333333;
    width: 35%;
    text-align: center;
    padding-top: 10px;
  }

  .signatures {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    margin-bottom: 2rem;
    margin-top: auto;
    position: absolute;
    bottom: 5rem;
    width: 90%;
  }

  .comment {
    padding-top: 1rem;
    font-size: 0.9rem;
  }

  .generate_pdf {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem;

    button {
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
      font-size: 1rem;
      box-shadow:
        6px 6px 8px 0 rgba(0, 0, 0, 0.3),
        -12px -12px 24px 0 rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .signature-container {
    display: flex;
    position: absolute;
    bottom: 9rem;
    padding-left: 4rem;
  }

  .signature {
    width: 15rem;
  }
`

export default InvoiceLayout
