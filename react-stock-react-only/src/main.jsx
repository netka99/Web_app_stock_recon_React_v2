import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ProductsProvider } from './context/products_context.jsx'
import { PriceProvider } from './context/price_context.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProductsProvider>
      <PriceProvider>
        <App />
      </PriceProvider>
    </ProductsProvider>
  </React.StrictMode>,
)
