import React, {
  createContext,
  useState,
  useEffect,
} from 'react'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import PropTypes from 'prop-types'

const PricesContext = createContext()

export const PricesProvider = ({ children }) => {
  const [pricesData, setPricesData] = useState(null)
  const [isDisabled, setIsDisabled] = useState(true)
  const [isSent, setIsSent] = useState(false)

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
    <PricesContext.Provider
      value={{
        pricesData,
        isDisabled,
        isSent,
        handleUpdate,
        handleChangePrices,
        handleSavePrices,
      }}
    >
      {children}
    </PricesContext.Provider>
  )
}

PricesProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate children prop
}

export default PricesContext
