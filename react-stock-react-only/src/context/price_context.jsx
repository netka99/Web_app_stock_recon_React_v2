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
        loading: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading,
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
  const [prices, dispatch] = useReducer(priceReducer, {
    loading: true,
  })
  const apiUrl = import.meta.env.VITE_APP_PRICE_API

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', loading: true })
        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        dispatch({ type: 'LOAD_PRICES', prices: result })
      } catch (error) {
        console.error('Error fetching data:', error)
        dispatch({ type: 'SET_LOADING', loading: false })
      }
    }

    fetchData()
  }, [dispatch, apiUrl])

  PriceProvider.propTypes = {
    children: PropTypes.node,
  }

  const changePrice = (productName, newPrice) => {
    dispatch({
      type: 'CHANGE_PRICE',
      productName,
      newPrice,
    })
    updatePrices({
      ...prices,
      [productName]: parseFloat(newPrice),
    })
  }

  const updatePrices = async (productName, newPrice) => {
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          newPrice,
        }),
      })
      const data = await response.json()
      console.log('Data:', data)
      if (!response.ok) {
        throw new Error(
          'Failed to update prices on the server',
        )
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <PriceContext.Provider value={{ prices, changePrice }}>
      {children}
    </PriceContext.Provider>
  )
}
