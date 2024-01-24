import * as React from 'react'
// import styled from 'styled-components'
import { Navbar, Sidebar } from '../components/index'

const SalePage = () => {
  const pageTitle = 'Sprzedaż'
  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
    </main>
  )
}

export default SalePage
