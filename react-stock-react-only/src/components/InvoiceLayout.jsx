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
}) => {
  const invoiceRef = useRef()
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

    const columns = ['ID', 'Name', 'Country']
    const data = [
      [1, 'John Doe', 'USA'],
      [2, 'Jane Doe', 'Canada'],
      [3, 'Mark Smith', 'UK'],
    ]

    autoTable(pdf, {
      head: [columns],
      body: data,
    })

    pdf.save('invoice.pdf')
  }

  return (
    <Container>
      <div ref={invoiceRef} className="main-container">
        <div>{seller}</div>
        <div>{shopName}</div>
        hello
      </div>
      <button
        className="generateButton"
        onClick={generatePdf}
      >
        Wygeneruj PDF
      </button>
    </Container>
  )
}

const Container = styled.div`
  .main-container {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    max-width: 100%;
    align-items: center;
    justify-content: center;
    margin: 2rem;
  }
`

export default InvoiceLayout
