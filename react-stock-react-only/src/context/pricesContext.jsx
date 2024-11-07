import React, {
  createContext,
  useState,
  useEffect,
} from 'react'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import PropTypes from 'prop-types'

const PricesContext = createContext()

export const PricesProvider = ({ children }) => {
  const [settingsData, setSettingsData] = useState(null)
  const [isDisabled, setIsDisabled] = useState(true)
  const [isSent, setIsSent] = useState(false)

  useEffect(() => {
    fetchData('http://localhost:8000/settings/aneta')
      .then((data) => setSettingsData(data))
      .catch((error) =>
        console.error('Error fetching data:', error),
      )
  }, [])

  const handleUpdate = (e) => {
    const { id, value } = e.target
    setSettingsData({
      ...settingsData,
      prices: {
        ...settingsData.prices,
        [id]: Math.round(value * 100),
      },
    })
  }

  const handleChangePrices = () => {
    setIsDisabled(false)
    setIsSent(false)
    console.log(settingsData)
  }

  const handleSavePrices = async () => {
    try {
      const updatedPrices = { ...settingsData.prices }
      const updatedData = {
        shops: settingsData.shops,
        prices: updatedPrices,
        address: settingsData.address,
      }
      const response = await updateDataOnApi(
        updatedData,
        'http://localhost:8000/settings/aneta',
        'PUT',
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
        settingsData,
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
  children: PropTypes.node.isRequired,
}

export default PricesContext
