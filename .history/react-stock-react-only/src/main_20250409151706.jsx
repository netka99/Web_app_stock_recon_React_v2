import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ProductsProvider } from './context/products_context.tsx'
import { PricesProvider } from './context/pricesContext.tsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProductsProvider>
      <PricesProvider>
        <App />
      </PricesProvider>
    </ProductsProvider>
  </React.StrictMode>,
)
