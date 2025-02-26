import * as React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FaTimes } from 'react-icons/fa'
import logo from '../assets/Logo_SK.png'
import { useProductsContext } from '../context/products_context.jsx'

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useProductsContext()

  return (
    <SidebarContainer>
      <aside className={`${isSidebarOpen ? 'sidebar show-sidebar' : 'sidebar'}`}>
        <div className="sidebar-header">
          <img src={logo} className="logo" alt="logo Smaczny Kąsek" />
          <button className="close-btn" type="button" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>
        <ul className="links">
          <li>
            <Link to="/" onClick={closeSidebar}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/sprzedaz" onClick={closeSidebar}>
              Sprzedaż
            </Link>
          </li>
          <li>
            <Link to="/zestawienie" onClick={closeSidebar}>
              Zestawienie
            </Link>
          </li>
          <li>
            <Link to="/wykresy" onClick={closeSidebar}>
              Wykresy
            </Link>
          </li>
          <li>
            <Link to="/faktury" onClick={closeSidebar}>
              Faktury
            </Link>
          </li>
          <li>
            <Link to="/ustawienia" onClick={closeSidebar}>
              Ustawienia
            </Link>
          </li>
        </ul>
      </aside>
    </SidebarContainer>
  )
}

const SidebarContainer = styled.div`
  text-align: center;
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
  }
  .close-btn {
    font-size: 2rem;
    background: transparent;
    border-color: transparent;
    color: white;
    transition: var(--transition);
    cursor: pointer;
    margin-top: 0.2rem;
  }
  .close-btn:hover {
    color: #a3a2a2;
  }
  .logo {
    justify-self: center;
    height: 45px;
    z-index: 11;
  }
  .links {
    list-style: none;
    position: fixed;
    // left: -150%;
    gap: 0rem;
    flex-direction: column;
    background: linear-gradient(45deg, #4a1bb4, #6a18a4);
    width: 100%;
    text-align: center;
    transition: 0.3s;
    height: 100vh;
    justify-content: center;
    z-index: 10;
    list-style-type: none;
    margin-block-start: 0em;
    margin-block-end: 0em;
    padding-inline-start: 0px;
  }
  .links a {
    display: block;
    padding: 1.5rem 0rem;
    color: #ececec;
    margin-left: auto;
    font-size: 1rem;
    transition: 0.7s ease;
    position: relative;
    text-decoration: none;
    margin: 16px 0;
    font-size: 1.5rem;
  }

  .links a:hover {
    padding-left: 2rem;
    background: linear-gradient(45deg, #5625c1, #421266);
    color: #ffffff;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #4a1bb4, #6a18a4);
    transition: all 0.3s linear;
    transform: translate(-100%);
    z-index: -1;
  }
  .show-sidebar {
    transform: translate(0);
    z-index: 999;
  }
  .cart-btn-wrapper {
    margin: 2rem auto;
  }
  @media screen and (min-width: 992px) {
    .sidebar {
      display: none;
    }
  }
`

export default Sidebar
