import * as React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
//, useContext
// import ReactDOM from 'react-dom/client'
import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
} from '../components/index'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'

const SettingsPricesPage = () => {
  const [pricesData, setPricesData] = useState(null)
  const [isDisabled, setIsDisabled] = useState(true)
  const [isSent, setIsSent] = useState(false)

  const pageTitle = 'Ustawienia - Ceny'

  useEffect(() => {
    fetchData('http://localhost:3001/prices')
      .then((data) => setPricesData(data))
      .catch((error) =>
        console.error('Error fetching data:', error),
      )
  }, [])

  const handleUpdate = (e) => {
    const { id, value } = e.target
    setPricesData({
      ...pricesData,
      [id]: Number(value),
    })
  }

  const handleChangePrices = () => {
    setIsDisabled(false)
    console.log(pricesData)
  }

  const handleSavePrices = async () => {
    try {
      const response = await updateDataOnApi(
        pricesData,
        'http://localhost:3001/prices',
      )
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)
      if (response.status === 200) {
        setIsSent(true)
      } else {
        setIsSent(false)
      }
    } catch (error) {
      console.error('Error saving data:', error)
      setIsSent(false)
    }
    setIsDisabled(true)
  }

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
