import React from 'react'
import styled from 'styled-components'
import logo from '../assets/Logo_white.png'
import backgroundImgBig from '../assets/backgroundBig.png'
import backgroundImgS from '../assets/background.png'

const NavbarMain = () => {
  return (
    <NavContainer>
      <div className="nav-center">
        <div className="nav-header">
          <img src={logo} className="nav-logo" alt="logo Smaczny Kąsek" />
        </div>
      </div>
      <div className="nav-background">
        <div className="backgroundImage"></div>
      </div>
    </NavContainer>
  )
}

const NavContainer = styled.nav`
  height: 3rem;
  background: linear-gradient(45deg, #4a1bb4, #6a18a4);
  box-shadow: 5px 6px 6px rgba(0, 0, 0, 0.25);
  margin: 0;

  .nav-logo {
    height: 3rem;
  }
  .nav-center {
    width: 90vw;
    margin: 0 auto;
    max-width: var(--max-width);
  }
  .nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    img {
      width: 175px;
      margin-left: -15px;
    }
  }
  .nav-toggle {
    background: transparent;
    border: transparent;
    color: #e5e5e5;
    cursor: pointer;
    svg {
      font-size: 1.8rem;
    }
  }
  .nav-links {
    display: none;
  }
  .cart-btn-wrapper {
    display: none;
  }
  @media (min-width: 992px) {
    .nav-toggle {
      display: none;
    }
    .nav-center {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-links {
      display: flex;
      justify-content: center;
      color: #ececec;
      list-style-type: none;
      text-decoration: none;
      li {
        margin: 0 0.5rem;
      }
      a {
        color: #e5e5e5;
        font-size: 1rem;
        text-transform: capitalize;
        letter-spacing: var(--spacing);
        padding: 0.5rem;
        text-decoration: none;
        &:hover {
          border-bottom: 2px solid var(--clr-primary-7);
        }
      }
    }
    .cart-btn-wrapper {
      display: grid;
    }
  }
  .backgroundImage {
    background-image: url(${backgroundImgBig});
    background-repeat: no-repeat;
    position: relative;
    height: 170px;
    width: 100vw;
    background-size: 100% 40%;
    display: block;
    z-index: -1;

    @media screen and (max-width: 321px) {
      height: 90px;
    }

    @media screen and (min-width: 321px) and (max-width: 426px) {
      height: 130px;
    }

    @media screen and (max-width: 576px) {
      background-image: url(${backgroundImgS});
      background-size: 120% 45%;
    }

    @media screen and (min-width: 426px) and (max-width: 576px) {
      height: 150px;
    }

    @media screen and (min-width: 576px) and (max-width: 768px) {
      height: 100px;
    }

    @media screen and (min-width: 768px) and (max-width: 1440px) {
      height: 120px;
    }

    @media screen and (min-width: 1440px) and (max-width: 1700px) {
      height: 220px;
    }

    @media screen and (min-width: 1700px) {
      height: 320px;
    }
  }
`

export default NavbarMain
