import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react'
import PropTypes from 'prop-types'

const PriceContext = createContext()

const priceReducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_PRICE':
      return {
        ...state,
        [action.productName]: parseFloat(action.newPrice),
      }
    case 'LOAD_PRICES':
      return {
        ...state,
        ...action.prices,
      }
    default:
      return state
  }
}

export const usePrices = () => {
  const context = useContext(PriceContext)
  if (!context) {
    throw new Error(
      'usePrices must be used within a PriceProvider',
    )
  }
  return context
}

export const PriceProvider = ({ children }) => {
  const [prices, dispatch] = useReducer(priceReducer, {})
  const apiUrl = import.meta.env.VITE_APP_PRICE_API

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        dispatch({ type: 'LOAD_PRICES', prices: result })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [dispatch])

  PriceProvider.propTypes = {
    children: PropTypes.node,
  }

  const changePrice = (productName, newPrice) => {
    dispatch({
      type: 'CHANGE_PRICE',
      productName,
      newPrice,
    })
  }

  return (
    <PriceContext.Provider value={{ prices, changePrice }}>
      {children}
    </PriceContext.Provider>
  )
}
