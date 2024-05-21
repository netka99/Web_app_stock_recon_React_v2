import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import StoreImg from '../assets/store-img.svg'

import { ExtraSale, ItemSale } from '../components/index'

const ItemShopContainer = ({
  imageProduct,
  productName,
  saleType,
  unit,
  shopName,
  value,
  disabled,
  saveData,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [extraSale, setExtraSale] = useState(false)

  useEffect(() => {
    setInputValue(value) // Update input value when value prop changes
  }, [value])

  const handleChange = (newValue) => {
    setInputValue(newValue) // Update input value locally
  }

  const handleSaveData = () => {
    saveData(inputValue, shopName)
  }

  const openExtraSale = () => {
    setExtraSale(true)
    setTimeout(() => {
      setExtraSale(true)
    }, 500)
  }

  return (
    <Container>
      <div className="header">
        <div className="store-title">
          <img
            src={StoreImg}
            alt="black solid store image"
          />
          <p>{shopName}</p>
        </div>
        <div className="accordion-buttons">
          <span className="button-checked">✓</span>
          <button className="accordion-open">
            <p className="accordion-arrow">˅</p>
          </button>
        </div>
      </div>
      <ItemSale
        imageProduct={imageProduct}
        productName={productName}
        saleType={saleType}
        unit={unit}
        shopName={shopName}
        value={inputValue}
        disabled={disabled}
        onChange={handleChange}
      />
      <div className="saving-buttons">
        <button
          onClick={openExtraSale}
          className="add-sale"
        >
          ＋
        </button>
        <button
          className="save-sale"
          onClick={handleSaveData}
          disabled={disabled}
        >
          Zapisz sprzedaż
        </button>
      </div>
      {extraSale && (
        <ExtraSale
          unit={unit}
          shopName={shopName}
          saveData={saveData}
        />
      )}
    </Container>
  )
}

ItemShopContainer.propTypes = {
  imageProduct: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  saleType: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  shopName: PropTypes.string.isRequired,
  value: PropTypes.number,
  disabled: PropTypes.bool.isRequired,
  saveData: PropTypes.func,
  onChange: PropTypes.func,
}

const Container = styled.div`
  width: 65%;
  background-color: #ffffff;
  border-radius: 15px;
  margin: 1rem 0rem;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);

  .header {
    display: flex;
    align-content: space-between;
    align-items: center;
    justify-content: space-between;
  }

  .store-title {
    display: flex;
    justify-content: flex-start;
    padding: 10px;
    gap: 15px;
    align-items: center;

    img {
      width: 24px;
      margin: 8px;
      filter: invert(41%) sepia(0%) saturate(0%)
        hue-rotate(102deg) brightness(91%) contrast(85%);
    }
  }

  .accordion-buttons {
    display: flex;
    align-items: center;
    gap: 1.3rem;
    padding: 10px;
  }

  .button-checked {
    content: '✓';
    font-size: 1.4rem;
    padding: 5px 20px 5px 20px;
    background: linear-gradient(
      to bottom right,
      #e51ead,
      #e086bf
    );
    color: transparent;
    border-radius: 25px;
    font-weight: bold;
    box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.3);
  }

  .accordion-open {
    background: linear-gradient(
      to bottom right,
      #5c35b6,
      #8461c5
    );
    padding: 2px 1.5rem 2px 1.5rem;
    border-radius: 15px;
    border: none;
    box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);

    &:hover {
      background: linear-gradient(
        to bottom right,
        #512fa1,
        #7656b0
      );
      cursor: pointer;
    }

    &:active {
      box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.3);
    }
  }

  .accordion-arrow {
    font-size: 2rem;
    font-weight: 500;
    color: white;
    margin: 0;
    transition: 0.3s ease-in-out;
  }

  .saving-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 10px 30px 20px 30px;

    button {
      border: none;
      color: white;
      padding: 4px 18px;
      border-radius: 15px;
      font-size: 1rem;
      font-weight: bold;
      box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
      margin: 0rem 0.5rem;

      /* @media screen and (max-width: $tablet) {
      font-size: 0.9rem;
    } */

      &:active {
        box-shadow: 1px 1px 4px 1px rgba(54, 54, 54, 0.3);
      }
    }

    .add-sale {
      background: linear-gradient(
        to bottom right,
        #d5d6d6eb,
        #ffffffeb
      );
      color: #e51ead;
      font-size: 1.5rem;
      padding: 4px 18px;

      &:hover {
        background: linear-gradient(
          to bottom right,
          #c3c4c4eb,
          #e5e5e5eb
        );
        cursor: pointer;
      }
    }

    .save-sale {
      margin-left: 20%;
      background: linear-gradient(
        to bottom right,
        #e51ead,
        #e086bf
      );
      &:hover {
        background: linear-gradient(
          to bottom right,
          #c91a97,
          #c376a7
        );
        cursor: pointer;
      }
    }
  }
`
export default ItemShopContainer
