import * as React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom'
import { Navbar, Sidebar, Footer } from './components/index'
import {
  HomePage,
  SalePage,
  SummaryPage,
  GraphsPage,
  SettingsPage,
  ErrorPage,
  SettingsPricesPage,
  SettingsShopsPage,
  InvoicePage,
} from './pages/index'
import './App.css'

function App() {
  return (
    <Router>
      {/* <Navbar />
      <Sidebar /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="sprzedaz" element={<SalePage />} />
        <Route
          path="zestawienie"
          element={<SummaryPage />}
        />
        <Route path="wykresy" element={<GraphsPage />} />
        <Route path="faktury" element={<InvoicePage />} />
        <Route
          path="ustawienia"
          element={<SettingsPage />}
        />
        <Route
          path="sklepy"
          element={<SettingsShopsPage />}
        />
        <Route
          path="ceny"
          element={<SettingsPricesPage />}
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      {/* <Footer /> */}
    </Router>
  )
}

export default App
