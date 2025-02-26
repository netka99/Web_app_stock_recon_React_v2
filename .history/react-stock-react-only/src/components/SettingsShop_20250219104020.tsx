import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'

const ShopList = ({ shops }) => {
  return (
    <ul>
      {shops.map((shop, index) => (
        <li key={index}>
          <Shop shop={shop} />
        </li>
      ))}
    </ul>
  )
}

ShopList.propTypes = {
  shops: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      index: PropTypes.number,
    }),
  ),
}

const Shop = ({ shop, onChange }) => {
  const [isEditing, setIsEditing] = useState(true)

  return (
    <div>
      {isEditing ? (
        <input
          value={shop.name}
          onChange={(e) => {
            onChange({
              ...shop,
              name: e.target.value,
            })
          }}
        />
      ) : (
        <span>{shop.name}</span>
      )}
    </div>
  )
}

Shop.propTypes = {
  shop: PropTypes.shape({
    name: PropTypes.string,
  }),
}
export default ShopList
