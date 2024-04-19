import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const ItemSale = ({
  imageProduct,
  productName,
  saleType,
  unit,
  id,
}) => {
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
        <label htmlFor={id}>{saleType}</label>
        <input
          type="number"
          min="0"
          //   onInput="undefined"
          name={id}
        ></input>
        <p className="item-units">{unit}</p>
      </div>
    </Container>
  )
}

ItemSale.propTypes = {
  imageProduct: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  saleType: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  /* height: calc(100vh - 1rem); */
`
export default ItemSale
