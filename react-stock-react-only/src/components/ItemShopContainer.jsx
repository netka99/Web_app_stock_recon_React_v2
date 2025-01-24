import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import StoreImg from '../assets/store-img.svg'
import Arrow from '../assets/chevron-down.svg'
import { size } from '../styles/devices'

import { ExtraSale, ItemSale } from '../components/index'

const ItemShopContainer = ({
  imageProduct,
  productName,
  saleType,
  unit,
  shopName,
  value,
  valueExtra,
  disabled,
  saveData,
  isSale,
  isShopDisabled,
  extraShopDisabled,
  saveExtraData,
  disabledExtraShops,
  extraReturnValues,
  extraSaleValues,
  todaysDate,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [extraSale, setExtraSale] = useState(false)
  const [messageText, setMessageText] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef(null)
  const contentRefExtra = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    setInputValue(value) // Update input value when value prop changes
  }, [value, saleType])

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(
        isOpen ? contentRef.current.scrollHeight : 0,
      )
    }
  }, [isOpen, contentHeight])

  //responsible to close all containers whenever product, type of sale, date is changed
  useEffect(() => {
    setIsOpen(false)
  }, [todaysDate, isSale, productName])

  const handleChange = (newValue) => {
    setInputValue(newValue) // Update input value locally
  }

  const handleSaveData = async (
    valueofData,
    savingData,
  ) => {
    const result = await savingData(valueofData, shopName)
    if (result && result.status !== 200) {
      handleMessage('errorSave')
    } else {
      if (isSale) {
        handleMessage('saleSaved')
      } else if (!isSale) {
        handleMessage('returnSaved')
      }
    }
  }

  const openExtraSale = () => {
    setExtraSale(true)
    setTimeout(() => {
      if (contentRefExtra.current) {
        setContentHeight(
          contentHeight +
            contentRefExtra.current.scrollHeight,
        )
      }
    }, 0)
    setTimeout(() => {
      setExtraSale(true)
    }, 500)
  }

  const handleMessage = (messageType) => {
    getMessageText(messageType)
    setMessageText(messageType)
    setTimeout(() => {
      setMessageText(false)
    }, 5000)
  }

  const getMessageText = (messageType) => {
    switch (messageType) {
      case 'saleSaved':
        return 'Sprzedaż została zapisana!'
      case 'errorSave':
        return 'Problem z wysłaniem danych do bazy danych!'
      case 'returnSaved':
        return 'Zwrot został zapisany!'
      default:
        return ''
    }
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
          <span
            className={`button-checked ${isShopDisabled(shopName) ? 'saved' : ''}`}
          >
            ✓
          </span>
          <button
            onClick={toggleAccordion}
            className="accordion-open"
          >
            <img
              className={`accordion-arrow ${isOpen ? 'rotate' : ''}`}
              src={Arrow}
              alt="chevron down"
            />
          </button>
        </div>
      </div>
      {messageText && (
        <div className="error-notification">
          {getMessageText(messageText)}
        </div>
      )}
      <div
        className={`container-input-sale ${isOpen ? 'open' : ''}`}
        ref={contentRef}
        style={{ height: `${contentHeight}px` }}
      >
        <ItemSale
          imageProduct={imageProduct}
          productName={productName}
          saleType={saleType}
          unit={unit}
          shopName={shopName}
          value={inputValue}
          disabled={disabled}
          onChange={handleChange}
          isShopDisabled={isShopDisabled}
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
            onClick={() => {
              handleSaveData(inputValue, saveData)
            }}
            disabled={isShopDisabled(shopName)}
          >
            {isShopDisabled(shopName)
              ? isSale
                ? 'Sprzedaż zapisana'
                : 'Zwrot zapisany'
              : isSale
                ? 'Zapisz sprzedaż'
                : 'Zapisz zwrot'}
          </button>
        </div>

        {extraSale && (
          <ExtraSale
            unit={unit}
            shopName={shopName}
            handleSaveData={handleSaveData}
            handleMessage={handleMessage}
            ref={contentRefExtra}
            saleType={saleType}
            extraShopDisabled={extraShopDisabled}
            saveExtraData={saveExtraData}
            isSale={isSale}
            disabledExtraShops={disabledExtraShops}
            valueExtra={valueExtra}
            extraReturnValues={extraReturnValues}
            extraSaleValues={extraSaleValues}
            productName={productName}
            todaysDate={todaysDate}
          />
        )}
      </div>
    </Container>
  )
}

ItemShopContainer.propTypes = {
  imageProduct: PropTypes.string.isRequired,
  todaysDate: PropTypes.string,
  productName: PropTypes.string.isRequired,
  saleType: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  shopName: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  valueExtra: PropTypes.number,
  disabled: PropTypes.bool,
  saveData: PropTypes.func,
  onChange: PropTypes.func,
  isSale: PropTypes.bool,
  isShopDisabled: PropTypes.func,
  extraShopDisabled: PropTypes.func,
  saveExtraData: PropTypes.func,
  disabledExtraShops: PropTypes.bool,
  extraSaleValues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      product: PropTypes.string,
      shop: PropTypes.string,
      quantity: PropTypes.number,
      date: PropTypes.string,
      is_discounted: PropTypes.number,
    }),
  ),
  extraReturnValues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      product: PropTypes.string,
      shop: PropTypes.string,
      quantity: PropTypes.number,
      date: PropTypes.string,
    }),
  ),
}

const Container = styled.div`
  width: 65%;
  background-color: #ffffff;
  border-radius: 15px;
  margin: 1rem 0rem;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);

  @media screen and (max-width: ${size.tabletS}) {
    width: 95%;
  }

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

    @media screen and (max-width: ${size.tabletS}) {
      gap: 0.5rem;
    }
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

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 1rem;
    }
  }

  .button-checked.saved {
    color: white;
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

    @media screen and (max-width: ${size.tabletS}) {
      padding: 2px 1rem 2px 1rem;
    }

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
    width: 25px;
    padding: 8px 0px;
    margin: 0;
    transition: 0.3s ease-in-out;
    filter: invert(100%) sepia(44%) saturate(124%)
      hue-rotate(254deg) brightness(114%) contrast(88%);

    @media screen and (max-width: ${size.tabletS}) {
      width: 18px;
    }
  }

  .accordion-arrow.rotate {
    transform: rotate(-180deg);
    transform-origin: center center;
  }

  .container-input-sale {
    overflow: hidden;
    transition: height 0.3s ease;
    height: 0;
  }

  .container-input-sale.open {
    transition: height 0.3s ease;
  }

  .saving-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 10px 15px 20px 15px;

    button {
      border: none;
      color: white;
      padding: 4px 18px;
      border-radius: 15px;
      font-size: 1rem;
      font-weight: bold;
      box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
      /* margin: 0rem 0.5rem; */

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
      margin-left: 18%;
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

  .error-notification {
    background-color: #f8d7da;
    width: 50%;
    padding: 0.3rem;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 0.5rem auto;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
    box-shadow:
      0 3px 6px 0 rgba(0, 0, 0, 0.2),
      0 3px 10px 0 rgba(0, 0, 0, 0.19);
  }
`
export default ItemShopContainer
