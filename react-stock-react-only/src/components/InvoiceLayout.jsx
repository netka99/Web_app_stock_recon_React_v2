import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
// import { Spinner } from './index'
// import { size } from '../styles/devices'
import { units } from '../utils/productDetails'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
// import autoTable from 'jspdf-autotable'

const InvoiceLayout = ({
  seller,
  shopName,
  address,
  startDate,
  endDate,
  checkedItems,
  city,
  invoiceDate,
  endSaleDate,
  paymentDate,
  paymentType,
  prices,
  productCode,
  vat,
  netPrice,
  extraProduct,
  invoiceNumber,
  productDetails,
  totalsOfSale,
  calculateNet,
}) => {
  const [totals, setTotals] = useState([])
  const [vatTotals, setVatTotals] = useState({})
  const invoiceRef = useRef()

  const formatDate = (date) => {
    const reverseDate = date.split('-').reverse().join('-')
    return reverseDate
  }

  const gatherTotals = () => {
    let newTotals = []

    Object.keys(checkedItems).forEach((key) => {
      if (checkedItems[key]) {
        const details = productDetails[key]
        const netTotal = Number(
          netPrice[key] * totalsOfSale[key],
        ).toFixed(2)
        const grossTotal = Number(
          prices[key] * totalsOfSale[key],
        ).toFixed(2)

        newTotals.push({
          productName: details.name,
          code: productCode[key],
          unit: units[key],
          quantity: totalsOfSale[key],
          net: netPrice[key],
          vat: vat[key],
          gross: prices[key],
          totalNet: Number(netTotal),
          totalGross: Number(grossTotal),
        })
      }
    })

    extraProduct.forEach((line) => {
      const netPrice = calculateNet(line.price, line.vat)
      const netTotal = Number(
        netPrice * line.quantity,
      ).toFixed(2)
      const grossTotal = Number(
        line.price * line.quantity,
      ).toFixed(2)

      newTotals.push({
        productName: line.product,
        code: line.code,
        unit: line.units,
        quantity: line.quantity,
        net: Number(netPrice),
        vat: line.vat,
        gross: line.price,
        totalNet: Number(netTotal),
        totalGross: Number(grossTotal),
      })
    })

    setTotals(newTotals)
  }

  useEffect(() => {
    gatherTotals()
  }, [])

  const calculateVatTotals = () => {
    const vatGroups = {}

    totals.forEach((item) => {
      const vatRate = item.vat
      if (!vatGroups[vatRate]) {
        vatGroups[vatRate] = { totalNet: 0, totalGross: 0 }
      }
      vatGroups[vatRate].totalNet += item.totalNet
      vatGroups[vatRate].totalGross += item.totalGross
    })

    setVatTotals(vatGroups)
  }

  useEffect(() => {
    calculateVatTotals()
  }, [totals])

  const generatePdf = async () => {
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 4, // Increase the scale (default is 1)
      useCORS: true, // Allow external resources like fonts and images
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('portrait', 'pt', 'a4') // A4 size PDF

    const imgWidth = 595.28 // PDF width (A4)
    const imgHeight =
      (canvas.height * imgWidth) / canvas.width // Calculate height to keep aspect ratio
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(
      imgData,
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
    )
    heightLeft -= pdf.internal.pageSize.height

    // Add extra pages if content overflows
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(
        imgData,
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
      )
      heightLeft -= pdf.internal.pageSize.height
    }
    pdf.save('invoice.pdf')
  }

  return (
    <Container>
      <div ref={invoiceRef} className="invoice-preview">
        <div className="invoice-header">
          <div className="invoice-logo">Logo</div>
          <div className="invoice-info">
            <div className="info">
              <div>Miejsce wystawienia:</div>
              <div className="info-main">{city}</div>
            </div>
            <div className="info">
              <div>Data wystawienia:</div>
              <div className="info-main">
                {formatDate(invoiceDate)}
              </div>
            </div>
            <div className="info">
              <div>Data zakoczenia dostawy/usługi:</div>
              <div className="info-main">
                {formatDate(endSaleDate)}
              </div>
            </div>
            <div className="info">
              <div>Okres dostawy:</div>
              <div className="info-main">
                {formatDate(startDate)} -{' '}
                {formatDate(endDate)}
              </div>
            </div>
          </div>
        </div>
        <div className="invoice-number">
          Faktura nr: {invoiceNumber}
        </div>
        <div className="seller-buyer">
          <div className="seller">
            <div className="seller-title">Sprzedawca</div>
            <div className="seller-address">{seller}</div>
          </div>
          <div className="buyer">
            <div className="buyer-title">Nabywca</div>
            <div className="buyer-address">{address}</div>
          </div>
        </div>
        <div className="bank-account">
          <div className="account">
            <div>Nr konta: </div>
            <div className="account-number">
              37 1020 1332 0000 XXXX XXXX XXXX
            </div>
          </div>
          <div className="swift">
            <div>Nr SWIFT/BIC: </div>
            <div className="swift-number">BPKOPLPW</div>
          </div>
        </div>

        <div className="titles">
          <div className="title-table number">Lp.</div>
          <div className="title-table product-name">
            Towar/Usługa
          </div>
          <div className="title-table product-code">
            PKWIU
          </div>
          <div className="title-table product-unit">
            J.m.
          </div>
          <div className="title-table product-quantity">
            Ilość
          </div>
          <div className="title-table net-price">
            Cena netto
          </div>
          <div className="title-table vat">VAT</div>
          <div className="title-table gross-price">
            Cena brutto
          </div>
          <div className="title-table total-net">
            Wartość netto
          </div>
          <div className="title-table total-gross">
            Wartość brutto
          </div>
        </div>

        {totals.map((line, index) => (
          <div className="product-details" key={index}>
            <div className="details number-details">
              {index + 1}
            </div>
            <div className="details product-name-details">
              {line.productName}
            </div>
            <div className="details product-code-details">
              {line.code}
            </div>
            <div className="details product-unit-details">
              {line.unit}
            </div>
            <div className="details product-quantity-details">
              {line.quantity.toFixed(2)}
            </div>
            <div className="details net-price-details">
              {line.net.toFixed(2)}
            </div>
            <div className="details product-vat-details">
              {line.vat}%
            </div>
            <div className="details gross-price-details">
              {line.gross.toFixed(2)}
            </div>
            <div className="details total-net-details">
              {line.totalNet.toFixed(2)}
            </div>
            <div className="details total-gross-details">
              {line.totalGross.toFixed(2)}
            </div>
          </div>
        ))}
        <div className="summary">
          <div className="summary-text">Razem w PLN</div>
          <div className="summary-net">
            {totals.length > 0 &&
              totals
                .reduce((acc, cur) => acc + cur.totalNet, 0)
                .toFixed(2)}
          </div>
          <div className="summary-gross">
            {totals.length > 0 &&
              totals
                .reduce(
                  (acc, cur) => acc + cur.totalGross,
                  0,
                )
                .toFixed(2)}
          </div>
        </div>
      </div>
      <div className="totalsVat">
        <div className="totalsVat-title">
          SUMA WEDŁUG STAWEK VAT W PLN
        </div>
        <div className="totalsVat-header">
          <div>Netto</div>
          <div>VAT</div>
          <div>Kwota VAT</div>
          <div>Brutto</div>
        </div>
        {vatTotals &&
          Object.keys(vatTotals).length > 0 &&
          Object.keys(vatTotals).map((key) => (
            <div key={key} className="totalsVat-values">
              <div>
                {vatTotals[key].totalNet.toFixed(2)}
              </div>
              <div>{key}%</div>
              <div>
                {(
                  vatTotals[key].totalGross -
                  vatTotals[key].totalNet
                ).toFixed(2)}
              </div>
              <div>
                {vatTotals[key].totalGross.toFixed(2)}
              </div>
            </div>
          ))}
      </div>

      <button onClick={generatePdf}>Generate PDF</button>
    </Container>
  )
}

const Container = styled.div`
  .invoice-preview {
    width: 100%;
    padding: 35px;
    /* border: 1px solid #ddd; */
    margin-bottom: 20px;
    width: 800px;
    background-color: white;
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
    background-color: #bdd9e4;
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
    grid-template-columns: [first] 3rem [line2] 30% repeat(
        8,
        1fr
      );
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
    background-color: #bdd9e4;
    border: 1px solid #818181;
  }

  .product-details {
    text-align: left;
    justify-content: center;
    font-size: 0.8rem;
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
    grid-template-columns: [first] 3rem [line2] 30% repeat(
        8,
        1fr
      );
    font-size: 13.5px;
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

  .totalsVat {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
  }

  .totalsVat-title {
    grid-column-start: 1;
    grid-column-end: 5;
  }
`

// Styling for the table
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
`

export default InvoiceLayout
