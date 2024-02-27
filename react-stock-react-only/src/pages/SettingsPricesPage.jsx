import * as React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useContext } from 'react'
import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
} from '../components/index'
import { PricesContext } from '../context/index'

const SettingsPricesPage = () => {
  const {
    pricesData,
    isDisabled,
    isSent,
    handleUpdate,
    handleChangePrices,
    handleSavePrices,
  } = useContext(PricesContext)
  const pageTitle = 'Ustawienia - Ceny'

  return (
    <main>
      <Navbar pageTitle={pageTitle} />

      {pricesData ? (
        <Container>
          <form onSubmit={(e) => e.preventDefault()}>
            {Object.entries(pricesData).map(
              ([productName, price]) => (
                <div key={productName}>
                  <label htmlFor={productName}>
                    {productName}
                  </label>
                  <input
                    type="number"
                    id={productName}
                    value={price}
                    disabled={isDisabled}
                    onChange={handleUpdate}
                  />
                </div>
              ),
            )}
            <button
              type="button"
              onClick={handleChangePrices}
            >
              Zmień Ceny
            </button>
            <button
              type="button"
              onClick={handleSavePrices}
            >
              {isSent ? 'Ceny zapisane' : 'Zapisz Ceny'}
            </button>
          </form>
        </Container>
      ) : (
        <Spinner />
      )}

      <Sidebar />
      <Footer />
    </main>
  )
}

const PricesContainer = ({ label, value, onChange }) => {
  return (
    <label>
      {label}
      <input value={value} onChange={onChange} />
    </label>
  )
}
PricesContainer.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 30%;
`

export default SettingsPricesPage
