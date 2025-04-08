import React, { useState, useEffect, ChangeEvent, FocusEvent } from 'react'
import styled from 'styled-components'
import { size } from '../styles/devices'

interface SaleEntry {
  id: number
  product: string
  shop: string
  quantity: number
  date: string
  is_discounted: number
}

interface ReturnEntry {
  id: number
  product: string
  shop: string
  quantity: number
  date: string
}

interface ItemSaleProps {
  imageProduct: string
  productName: string
  saleType: string
  unit: string
  value: number | string
  onChange: (value: number) => void
  shopName: string
  isShopDisabled: (
    shopName: string,
    updatedSale: SaleEntry[] | undefined,
    updatedReturn: ReturnEntry[] | undefined,
  ) => boolean
  updatedSale?: SaleEntry[]
  updatedReturn?: ReturnEntry[]
}

const ItemSale: React.FC<ItemSaleProps> = ({
  imageProduct,
  productName,
  saleType,
  unit,
  value,
  onChange,
  shopName,
  isShopDisabled,
  updatedSale,
  updatedReturn,
}) => {
  const [inputValue, setInputValue] = useState(value === 0 ? '' : value.toString())

  useEffect(() => {
    setInputValue(value === 0 ? '' : value.toString())
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleBlur = () => {
    const numericValue = parseFloat(inputValue)
    onChange(isNaN(numericValue) ? 0 : numericValue)
  }

  return (
    <Container>
      <div className="item-description">
        <img src={imageProduct} alt={productName} className="item-picture" />
        <p>{productName}</p>
      </div>
      <div className="item-input">
        <div className="item-input-container">
          <label htmlFor={`input-${shopName}`}>{saleType}</label>
          <input
            type="text"
            value={inputValue}
            id={`input-${shopName}`}
            name={shopName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isShopDisabled(shopName, updatedSale, updatedReturn)}
            placeholder="0"
          ></input>
          <p className="item-units">{unit}</p>
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 95%;
  background-color: #f6f6f6;
  margin: 10px auto 10px auto;
  padding: 0.5rem 0rem;
  border-radius: 10px;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);

  @media screen and (max-width: ${size.tabletS}) {
    flex-direction: column;
  }

  .item-description {
    flex: 1 1 33.33%;
    display: flex;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: ${size.tabletS}) {
      justify-content: flex-start;
    }
  }

  .item-picture {
    width: 55px;
    border-radius: 25px;

    @media screen and (max-width: ${size.tabletS}) {
      width: 45px;
      padding-left: 5px;
    }
  }

  .item-description p {
    color: #292929;
    font-weight: bold;
    padding-left: 0.5rem;

    @media screen and (max-width: ${size.tabletS}) {
      padding-left: 5px;
    }
  }

  .item-input {
    flex: 1 1 66.67%;
  }
  .item-input-container {
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
`
export default ItemSale
