import * as React from 'react'
import { useContext } from 'react'
// import styled from 'styled-components'
import { Navbar, Sidebar } from '../components/index'
import { PricesContext } from '../context/index'

const SalePage = () => {
  const pageTitle = 'Sprzedaż'
  const { pricesData } = useContext(PricesContext)
  console.log(pricesData)
  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
    </main>
  )
}

export default SalePage
