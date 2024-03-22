import * as React from 'react'
import { useContext } from 'react'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
} from '../components/index'
import { PricesContext } from '../context/index'

const SalePage = () => {
  const pageTitle = 'Sprzedaż'
  const { pricesData } = useContext(PricesContext)
  console.log(pricesData)
  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
      </Container>
      <Footer />
    </StyledMain>
  )
}
const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow-y: scroll;
  /* height: calc(100vh - (10rem)); */
  height: 100vh;
  flex-grow: 1;

  h1 {
    font-size: 60px;
  }
`
export default SalePage
