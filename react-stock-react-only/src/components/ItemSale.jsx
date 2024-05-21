import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const ItemSale = ({
  imageProduct,
  productName,
  saleType,
  unit,
  value,
  disabled,
  onChange,
  shopName,
}) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value)
    onChange(isNaN(newValue) ? 0 : newValue)
  }

  return (
    <Container>
      <div className="item-description">
        <img
          src={imageProduct}
          alt={productName}
          className="item-picture"
        />
        <p>{productName}</p>
      </div>
      <div className="item-input">
        <div className="item-input-container">
          <label htmlFor={shopName}>{saleType}</label>
          <input
            type="number"
            min="0"
            value={value}
            name={shopName}
            onChange={handleChange}
            disabled={disabled}
          ></input>
          <p className="item-units">{unit}</p>
        </div>
      </div>
    </Container>
  )
}

ItemSale.propTypes = {
  imageProduct: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  saleType: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  value: PropTypes.number,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
  shopName: PropTypes.string.isRequired,
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

  .item-description {
    flex: 1 1 33.33%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item-picture {
    width: 55px;
    border-radius: 25px;
  }

  .item-description p {
    color: #292929;
    font-weight: bold;
    padding-left: 0.5rem;
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
`
export default ItemSale
