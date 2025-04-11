import React, { useContext, useReducer, createContext } from 'react'
import { SIDEBAR_OPEN, SIDEBAR_CLOSE } from '../actions'
import reducer from '../reducers/products_reducer'
import PropTypes from 'prop-types'

interface ProductsState {
  isSidebarOpen: boolean
}

interface ProductsContextType extends ProductsState {
  openSidebar: () => void
  closeSidebar: () => void
}

const initialState = {
  isSidebarOpen: false,
}
const ProductsContext = createContext()

export const ProductsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const openSidebar = () => {
    dispatch({ type: SIDEBAR_OPEN })
  }

  const closeSidebar = () => {
    dispatch({ type: SIDEBAR_CLOSE })
  }
  return (
    <ProductsContext.Provider value={{ ...state, openSidebar, closeSidebar }}>
      {children}
    </ProductsContext.Provider>
  )
}
ProductsProvider.propTypes = {
  children: PropTypes.node,
}

export const useProductsContext = () => {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider')
  }
  return context
}
