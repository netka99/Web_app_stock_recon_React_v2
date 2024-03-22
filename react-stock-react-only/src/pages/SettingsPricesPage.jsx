import * as React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useContext, useState, useEffect } from 'react'
import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
} from '../components/index'
import { PricesContext } from '../context/index'
import { size } from '../styles/devices'
import { pictures } from '../utils/productPictures'

const SettingsPricesPage = () => {
  const {
    settingsData,
    isDisabled,
    isSent,
    handleUpdate,
    handleChangePrices,
    handleSavePrices,
  } = useContext(PricesContext)
  const pageTitle = 'Ustawienia - Ceny'
  const [showSavedMsg, setShowSaveMsg] = useState(false)

  const messageStyle = {
    color: '#e51ead',
    fontWeight: 'bold',
    fontStyle: 'italic',
  }

  useEffect(() => {
    if (isSent) {
      setShowSaveMsg(true)
      const timer = setTimeout(() => {
        setShowSaveMsg(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSent])

  return (
    <main>
      <Navbar pageTitle={pageTitle} />

      {settingsData ? (
        <Container>
          <form
            className="formContainer"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="container">
              {Object.entries(settingsData.prices).map(
                ([productName, price]) => (
                  <div
                    className="product_container"
                    key={productName}
                  >
                    <div className="image_label">
                      <img
                        src={pictures[productName]}
                        alt={productName}
                      />
                      <label htmlFor={productName}>
                        {productName}
                      </label>
                    </div>
                    <div className="priceInput">
                      <p>Cena</p>
                      <input
                        type="number"
                        id={productName}
                        value={price}
                        disabled={isDisabled}
                        onChange={handleUpdate}
                      />
                      <p>zł</p>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="buttons">
              {isDisabled ? (
                <button
                  className="button_change"
                  type="button"
                  onClick={handleChangePrices}
                >
                  Zmień
                </button>
              ) : (
                <button
                  className="button_save"
                  type="button"
                  onClick={handleSavePrices}
                >
                  Zapisz
                </button>
              )}
              {showSavedMsg && (
                <p style={messageStyle}>
                  Ceny zostały zapisane
                </p>
              )}
            </div>
          </form>
        </Container>
      ) : (
        <Spinner />
      )}
      <Sidebar />
      <Footer />
    </main>
  )
}

const PricesContainer = ({ label, value, onChange }) => {
  return (
    <label>
      {label}
      <input value={value} onChange={onChange} />
    </label>
  )
}
PricesContainer.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 1rem);

  @media screen and (max-width: ${size.tablet}) {
    height: calc(100vh - 5rem);
  }

  .formContainer {
    display: flex;
    flex-direction: column;
  }

  .container {
    background-color: #ffffff;
    border-radius: 15px;
    margin: 1rem auto;
    padding: 1rem 2rem;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);

    @media screen and (max-width: ${size.mobileL}) {
      padding: 0.8rem 0.8rem;
    }
  }

  .product_container {
    display: flex;
    flex-direction: row;
    background-color: #f6f6f6;
    margin: 1rem auto 1rem auto;
    padding: 1rem 0rem;
    border-radius: 10px;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);

    @media screen and (max-width: ${size.mobileL}) {
      margin: 0.7rem auto 0.7rem auto;
    }
  }

  .image_label {
    flex: 1 1 33.33%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0 2rem 0 1rem;

    @media screen and (max-width: ${size.tablet}) {
      flex: 18%;
      padding-left: 10px;
    }

    @media screen and (max-width: ${size.mobileL}) {
      margin: 0 0.5rem 0 0.5rem;
    }

    img {
      width: 55px;
      border-radius: 25px;
      margin-right: 1rem;
      @media screen and (max-width: ${size.mobileL}) {
        margin-right: 0.5rem;
      }
    }

    label {
      color: #292929;
      font-weight: bold;

      @media screen and (max-width: ${size.tablet}) {
        display: none;
      }
    }
  }

  .priceInput {
    flex: 1 1 66.67%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 0 1rem 0 2rem;

    @media screen and (max-width: ${size.tablet}) {
      flex: 78%;
    }
    @media screen and (max-width: ${size.mobileL}) {
      margin: 0 0.5rem 0 0.5rem;
    }

    input {
      width: 5rem;
      font-size: 1rem;
      font-weight: bold;
      height: 1.8rem;
      border-radius: 5px;
      border: 1px solid #a3a3a3;
      text-align: right;

      @media screen and (max-width: ${size.mobileL}) {
        font-size: 0.9rem;
        width: 3rem;
      }

      &:hover {
        border: 1px solid #6b6b6b;
      }
    }
    p {
      margin: 0px 20px 0px 10px;

      @media screen and (max-width: ${size.mobileL}) {
        margin: 0px 10px 0px 5px;
      }
    }
  }

  .button_change {
    width: 7rem;
    border: none;
    color: white;
    padding: 10px 25px;
    margin-top: 0.5rem;
    border-radius: 20px;
    font-size: 1rem;
    box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
    background: linear-gradient(
      to bottom right,
      #5c35b6,
      #8461c5
    );
    cursor: pointer;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    margin-right: 1rem;
    flex-direction: column;
    align-items: flex-end;
  }

  .button_save {
    width: 7rem;
    border: none;
    color: white;
    padding: 10px 25px;
    margin-top: 0.5rem;
    border-radius: 20px;
    font-size: 1rem;
    box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
    background: linear-gradient(
      to bottom right,
      #e51ead,
      #e086bf
    );
    cursor: pointer;
  }
`

export default SettingsPricesPage
