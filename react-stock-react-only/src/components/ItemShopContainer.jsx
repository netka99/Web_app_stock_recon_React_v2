import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Item from './ItemSale'

const ItemShopContainer = ({
  imageProduct,
  productName,
  saleType,
  unit,
  id,
}) => {
  return (
    <>
      <Item
        imageProduct={imageProduct}
        productName={productName}
        saleType={saleType}
        unit={unit}
        id={id}
      />
    </>
  )
}

ItemShopContainer.propTypes = {
  imageProduct: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  saleType: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
}
export default ItemShopContainer
