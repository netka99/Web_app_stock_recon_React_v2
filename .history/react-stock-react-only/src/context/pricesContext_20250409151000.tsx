import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import PropTypes from 'prop-types'
import { SaleValue, SettingsData } from '../types'

const { VITE_APP_SETTINGS_API } = import.meta.env

interface PricesContextType {
  settingsData: SettingsData | null
  isDisabled: boolean
  isSent: boolean
  handleUpdate: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleChangePrices: () => void
  handleSavePrices: () => Promise<void>
}

const PricesContext = createContext<PricesContextType | undefined>(undefined)

interface PricesProviderProps {
  children: ReactNode
}

export const PricesProvider: React.FC<PricesProviderProps> = ({ children }) => {
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null)
  const [isDisabled, setIsDisabled] = useState<boolean>(true)
  const [isSent, setIsSent] = useState<boolean>(false)

  useEffect(() => {
    fetchData(VITE_APP_SETTINGS_API)
      .then((data) => setSettingsData(data))
      .catch((error) => console.error('Error fetching data:', error))
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
      const response = await updateDataOnApi(updatedData, VITE_APP_SETTINGS_API, 'PUT')
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
