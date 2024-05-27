import React, { useState, forwardRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import truck from '../assets/delivery-truck.svg'

const ExtraSale = forwardRef(function ExtraSale(
  { unit, shopName, handleMessage, handleSaveData },
  ref,
) {
  const [extraInputValue, setExtraInputValue] = useState(0)
  const [disabled, setDisabled] = useState(false)

  const handleChangeExtra = (e) => {
    const value =
      e.target.value !== '' ? parseFloat(e.target.value) : 0
    setExtraInputValue(value)
  }

  return (
    <Container ref={ref}>
      <div className="extra-sale-container">
        <div className="image-description">
          <img
            src={truck}
            alt="icon of truck"
            className="extra-image"
          />
          <p>Extra dowóz</p>
        </div>
        <div className="extra-sale">
          <div className="extra-sale-input">
            <label htmlFor={shopName}>Sprzedaż</label>
            <input
              type="number"
              min="0"
              value={extraInputValue}
              onChange={handleChangeExtra}
              disabled={disabled}
            />
            <p className="item-units">{unit}</p>
          </div>
        </div>
      </div>
      <div className="sale-extra-sale">
        <button
          onClick={() => {
            handleSaveData(extraInputValue, shopName)
            handleMessage('saleSaved')
            setDisabled(true)
          }}
          className="sale-extra-sale-button"
          disabled={disabled}
        >
          Zapisz dowóz
        </button>
      </div>
    </Container>
  )
})

ExtraSale.propTypes = {
  unit: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  shopName: PropTypes.string.isRequired,
  saveData: PropTypes.func,
  handleMessage: PropTypes.func,
  handleSaveData: PropTypes.func,
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 95%;
  background-color: #f6f6f6;
  margin: 10px auto 1rem auto;
  padding: 0.5rem 0rem;
  border-radius: 10px;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);

  .extra-sale-container {
    width: 100%;
    display: flex;
    flex-direction: row;
  }
  .image-description {
    flex: 1 1 33.33%;
    display: flex;
    justify-content: center;
    align-items: center;

    p {
      color: #292929;
      font-weight: bold;
      padding-left: 0.5rem;
    }
  }

  .extra-image {
    width: 55px;
    border-radius: 25px;
  }

  .extra-sale {
    flex: 1 1 66.67%;
  }

  .extra-sale-input {
    display: flex;
    align-items: center;
    gap: 1.2em;
    justify-content: flex-end;
    margin: 10px 0px 10px 0px;

    label {
      margin-right: 20%;
    }

    input {
      width: 5em;
      height: 1.8em;
      border-radius: 5px;
      border: 1px solid #a3a3a3;
    }

    p {
      margin: 0px 20px 0px 0px;
    }
  }

  .sale-extra-sale {
    display: flex;
    justify-content: flex-end;
    padding: 0.3rem 0.8rem 0.5rem 0;
  }

  .sale-extra-sale-button {
    border: none;
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 15px;
    font-size: 1rem;
    font-weight: bold;
    box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
    margin: 0rem 0.5rem;
    background: linear-gradient(
      to bottom right,
      #d2d1d2,
      #6f6f6f
    );

    &:hover {
      background: linear-gradient(
        to bottom right,
        #c1bfc1,
        #5e5e5e
      );
      cursor: pointer;
    }
  }
`
export default ExtraSale
