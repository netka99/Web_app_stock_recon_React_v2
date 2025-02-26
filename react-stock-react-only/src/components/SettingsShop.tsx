import React from 'react'
import { useState } from 'react'

interface ShopListProps {
  shops: Shop[]
}
interface Shop {
  name: string
  index?: number
}
interface ShopProps {
  shop: Shop
  onChange?: (updatedShop: Shop) => void
}
const ShopList: React.FC<ShopListProps> = ({ shops }) => {
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

const Shop: React.FC<ShopProps> = ({ shop, onChange }) => {
  const [isEditing, setIsEditing] = useState(true)

  return (
    <div>
      {isEditing ? (
        <input
          value={shop.name}
          onChange={(e) => {
            if (onChange) {
              onChange({
                ...shop,
                name: e.target.value,
              })
            }
          }}
        />
      ) : (
        <span>{shop.name}</span>
      )}
    </div>
  )
}

export default ShopList
