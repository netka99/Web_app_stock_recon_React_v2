import React, { useState, forwardRef, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import truck from '../assets/delivery-truck.svg'
import { size } from '../styles/devices'

interface ExtraSaleValue {
  id: number
  product: string
  shop: string
  quantity: number
  date: string
  is_discounted?: number
}

interface ExtraSaleProps {
  unit: string
  todaysDate?: string
  disabled?: boolean
  onChange?: (value: string) => void
  shopName: string
  saveData?: (data: any) => void
  handleSaveData: (
    value: number,
    callback: (quantity: number, shopName: string) => void,
  ) => void
  saleType: string
  isShopDisabled?: (shopName: string) => boolean
  saveExtraData: (quantity: number, shopName: string, isSale: boolean) => void
  isSale: boolean
  valueExtra?: any[]
  productName?: string
  extraSaleValues: ExtraSaleValue[]
  extraReturnValues: ExtraSaleValue[]
}

const ExtraSale = forwardRef(function ExtraSale(
  {
    unit,
    shopName,
    handleSaveData,
    saleType,
    isShopDisabled,
    saveExtraData,
    isSale,
    extraSaleValues,
    extraReturnValues,
    productName,
    todaysDate,
  },
  ref,
) {
  const [extraInputValue, setExtraInputValue] = useState('')

  const extraValueCurrent = (shop) => {
    const data = isSale ? extraSaleValues : extraReturnValues
    const currentValue =
      data?.find((s) => s.shop === shop && s.product === productName)?.quantity ?? ''
    return currentValue.toString()
  }

  useEffect(() => {
    const currentValue = extraValueCurrent(shopName)
    setExtraInputValue(currentValue)
  }, [extraSaleValues, extraReturnValues, productName, isSale, shopName, todaysDate])

  const handleChangeExtra = (e) => {
    setExtraInputValue(e.target.value)
  }

  const handleSave = () => {
    const numericValue = parseFloat(extraInputValue) || 0
    handleSaveData(numericValue, (quantity, shopName) =>
      saveExtraData(quantity, shopName, true),
    )
  }

  return (
    <Container ref={ref}>
      <div className="extra-sale-container">
        <div className="image-description">
          <img src={truck} alt="icon of truck" className="extra-image" />
          <p>Extra</p>
        </div>
        <div className="extra-sale">
          <div className="extra-sale-input">
            <label htmlFor={shopName}>{saleType}</label>
            <input
              type="text"
              value={extraInputValue}
              onChange={handleChangeExtra}
              disabled={isShopDisabled(shopName, extraSaleValues, extraReturnValues)}
              placeholder="0"
            />
            <p className="item-units">{unit}</p>
          </div>
        </div>
      </div>
      <div className="sale-extra-sale">
        <button
          onClick={handleSave}
          className="sale-extra-sale-button"
          disabled={isShopDisabled(shopName, extraSaleValues, extraReturnValues)}
        >
          {isShopDisabled(shopName, extraSaleValues, extraReturnValues)
            ? 'Zapisane'
            : 'Zapisz'}
        </button>
      </div>
    </Container>
  )
})

ExtraSale.propTypes = {
  unit: PropTypes.string.isRequired,
  todaysDate: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  shopName: PropTypes.string.isRequired,
  saveData: PropTypes.func,
  handleSaveData: PropTypes.func,
  saleType: PropTypes.string.isRequired,
  isShopDisabled: PropTypes.func,
  saveExtraData: PropTypes.func,
  isSale: PropTypes.bool,
  valueExtra: PropTypes.array,
  productName: PropTypes.string,
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

    @media screen and (max-width: ${size.tabletS}) {
      flex-direction: column;
    }
  }
  .image-description {
    flex: 1 1 33.33%;
    display: flex;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: ${size.tabletS}) {
      justify-content: flex-start;
    }

    p {
      color: #292929;
      font-weight: bold;
      padding-left: 0.5rem;
    }
  }

  .extra-image {
    width: 55px;
    border-radius: 25px;

    @media screen and (max-width: ${size.tabletS}) {
      width: 45px;
    }
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

    @media screen and (max-width: ${size.tabletS}) {
      gap: 0.5rem;
    }

    label {
      margin-right: 20%;

      @media screen and (max-width: ${size.tabletS}) {
        margin-right: 0%;
      }
    }

    input {
      width: 5em;
      height: 1.8em;
      border-radius: 5px;
      border: 1px solid #a3a3a3;

      @media screen and (max-width: ${size.tabletS}) {
        text-align: center;
      }
    }

    p {
      margin: 0px 20px 0px 0px;

      @media screen and (max-width: ${size.tabletS}) {
        margin: 0px 9px 0px 0px;
      }
    }
  }

  .sale-extra-sale {
    display: flex;
    justify-content: flex-end;
    padding: 0.3rem 0.8rem 0.5rem 0;

    @media screen and (max-width: ${size.tabletS}) {
      padding: 0.3rem 15px 0.5rem 0;
    }
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
    background: linear-gradient(to bottom right, #d2d1d2, #6f6f6f);

    @media screen and (max-width: ${size.tabletS}) {
      margin: 0rem 0rem;
    }

    &:hover {
      background: linear-gradient(to bottom right, #c1bfc1, #5e5e5e);
      cursor: pointer;
    }
  }
`
export default ExtraSale
