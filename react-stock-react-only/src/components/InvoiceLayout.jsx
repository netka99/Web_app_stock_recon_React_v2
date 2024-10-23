import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Spinner } from './index'
import { size } from '../styles/devices'
import { units } from '../utils/productDetails'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import autoTable from 'jspdf-autotable'

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
}) => {
  const invoiceRef = useRef()
  const items = [
    { name: 'Product A', quantity: 2, price: 50.0 },
    { name: 'Product B', quantity: 1, price: 100.0 },
    { name: 'Service C', quantity: 3, price: 75.0 },
    { name: 'Subscription D', quantity: 2, price: 150.0 },
    { name: 'Consultation E', quantity: 5, price: 200.0 },
  ]

  const formatDate = (date) => {
    const reverseDate = date.split('-').reverse().join('-')
    return reverseDate
  }
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
          <div className="number">Lp.</div>
          <div className="product-name">Towar/Usługa</div>
          <div className="product-code">PKWIU</div>
          <div className="product-unit">J.m.</div>
          <div className="product-quantity">Ilość</div>
          <div className="net-price">Cena netto</div>
          <div className="vat">VAT</div>
          <div className="gross-price">Cena brutto</div>
          <div className="total-net">Wartość netto</div>
          <div className="total-gross">Wartość brutto</div>
        </div>
        {/* Invoice table preview */}
        <div className="invoice-body">
          <Table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>
                    {(item.quantity * item.price).toFixed(
                      2,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
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
    background-color: #f6f6f6;
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
    padding-top: 1rem;
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
  }
  button {
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #20a8de;
    color: white;
    border: none;
    cursor: pointer;
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
