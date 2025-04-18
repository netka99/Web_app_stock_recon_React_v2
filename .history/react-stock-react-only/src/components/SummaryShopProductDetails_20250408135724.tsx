import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { units, ProductName } from '../utils/productDetails'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'
import { updateDataOnApi } from '../api/fetchAPI'
import { size } from '../styles/devices'
const { VITE_APP_SALES_API, VITE_APP_RETURNS_API } = import.meta.env
import useTemporaryMessage from '../hooks/useTemporaryMessage'

interface SaleData {
  date: string
  id: number
  is_discounted?: number
  product: string
  quantity: number
  shop: string
}

interface ReturnData {
  date: string
  id: number
  product: string
  quantity: number
  shop: string
}

interface SettingsData {
  shops: string[]
  prices: {
    Kartacze: number
    Babka: number
    Kiszka: number
  }
}

interface SummaryShopProductDetailsProps {
  localSaleData: string
  localReturnData: string
  shop: string
  productSelected: string
  filteredData: (shop: string, type: string) => (SaleData | ReturnData)[]
  settingsData: SettingsData
  isOpenIndex: number[]
  index: number
  updateLocalSale: React.Dispatch<React.SetStateAction<SaleData[]>>
  updateLocalReturn: React.Dispatch<React.SetStateAction<ReturnData[]>>
}

const SummaryShopProductDetails: React.FC<SummaryShopProductDetailsProps> = ({
  localSaleData,
  localReturnData,
  shop,
  productSelected,
  filteredData,
  settingsData,
  isOpenIndex,
  index,
  updateLocalSale,
  updateLocalReturn,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [editType, setEditType] = useState<string | null>(null)
  const [messageText, showMessage] = useTemporaryMessage()

  useEffect(() => {
    if (contentRef.current) {
      if (isOpenIndex.includes(index)) {
        setContentHeight(contentRef.current.scrollHeight)
      } else {
        setContentHeight(0)
      }
    }
  }, [isOpenIndex, contentRef, localSaleData, localReturnData])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.edit-button')
      ) {
        setEditIndex(null)
        setEditValue('')
        setEditType(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [inputRef, editIndex])

  const handleEdit = (index: number, quantity: number, type: string) => {
    setEditIndex(index)
    setEditValue(String(quantity))
    setEditType(type)
  }

  const updateItem = async (quantity: number, dateItem: string, idItem: number) => {
    const quantityNumber = Number(quantity)
    console.log('save button clicked', quantity, idItem)
    const urlSale = `${VITE_APP_SALES_API}/${idItem}`
    const urlReturn = `${VITE_APP_RETURNS_API}/${idItem}`

    const data = {
      id: null,
      product: productSelected,
      shop: shop,
      quantity: quantityNumber,
      date: dateItem,
    }

    try {
      let result
      if (editType === 'Sale') {
        result = await updateDataOnApi(data, urlSale, 'PUT')
        console.log(result.status)
        if (result && result.status !== 204) {
          showMessage('Problem z wysłaniem danych do bazy danych!', 4000)
        } else {
          showMessage('Dane zostały poprawnie zapisane!', 4000)
          updateLocalSale((prevData) =>
            prevData.map((item) =>
              item.id === idItem ? { ...item, quantity: quantityNumber } : item,
            ),
          )
        }
      }
      if (editType === 'Return') {
        result = await updateDataOnApi(data, urlReturn, 'PUT')
        console.log(result.status)
        if (result && result.status !== 204) {
          showMessage('Problem z wysłaniem danych!', 4000)
        } else {
          showMessage('Dane zostały poprawnie zapisane!', 4000)
          updateLocalReturn((prevData) =>
            prevData.map((item) =>
              item.id === idItem ? { ...item, quantity: quantityNumber } : item,
            ),
          )
        }
      }
    } catch (error) {
      console.error('Error updating data', error)
      return {
        status: 500,
        data: { message: 'Failed to save data' },
      }
    }
  }

  const filteredBySaletype = (typeOfData: string, minus: string, typeOfSale: string) => {
    return filteredData(shop, typeOfData).map((item, idx) => (
      <div key={`${shop}-${idx}-sale`} className="details-row">
        <div className="detailed-date">{item.date}</div>
        {editIndex === idx && editType === typeOfSale ? (
          <div className="quantity-input">
            {`${minus}`}
            <input
              id={`${shop}-${idx}-${typeOfSale}`}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              ref={inputRef}
            />
            {`${units[productSelected as ProductName]}`}
          </div>
        ) : (
          <div className="detailed-quantity">
            {`${minus}${item.quantity.toFixed(2)} ${units[productSelected as ProductName]}`}
          </div>
        )}

        <div className="detailed-price">
          {`${minus}${((item.quantity * settingsData.prices[productSelected as ProductName]) / 100).toFixed(2)} zł`}
        </div>
        {editIndex === idx && editType === typeOfSale ? (
          <SaveButton
            onClick={(e) => {
              e.stopPropagation()
              console.log('clicked')
              updateItem(Number(editValue), item.date, item.id)
              setEditIndex(null)
            }}
          />
        ) : (
          <EditButton
            onClick={() => {
              handleEdit(idx, item.quantity, typeOfSale)
            }}
          />
        )}
      </div>
    ))
  }

  return (
    <Container>
      <div
        className={`accordion ${isOpenIndex.includes(index) ? 'open' : ''}`}
        ref={contentRef}
        style={{
          height: `${contentHeight}px`,
          transition: 'height 0.3s ease',
        }}
      >
        {messageText && <div className="error-notification">{messageText}</div>}
        <div className="sale-filered">
          {filteredBySaletype(localSaleData, '', 'Sale')}
        </div>
        <div className="return-filered">
          {filteredBySaletype(localReturnData, '-', 'Return')}
        </div>
      </div>
    </Container>
  )
}

interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

const EditButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img src={editImg} className="item-picture" alt="edit" />
  </Button>
)

const SaveButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img src={saveImg} className="item-picture" alt="save" />
  </Button>
)

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`

const Container = styled.div`
  font-weight: 400;
  .details-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    border-bottom: 1px solid #e1e0e0;
    padding: 10px 0px 3px 2px;

    @media screen and (max-width: ${size.mobileL}) {
      grid-template-columns: 40% 23% 25% 12%;
    }
  }

  .sale-filered {
    color: #878787;
    padding-bottom: 0.5rem;
  }
  .return-filered {
    color: #b86969;
    padding-bottom: 0.5rem;
  }

  .detailed-quantity {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .detailed-price {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .detailed-date {
    display: flex;
    /* justify-content: center; */
    align-items: center;
    padding-left: 25px;
  }

  .quantity-input {
    display: flex;
    justify-content: center;
    align-items: center;

    input {
      width: 2.5rem;
    }
  }

  .edit-button,
  .delete-button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;

    @media screen and (max-width: ${size.mobileL}) {
      padding-right: 5px;
    }
    img {
      display: block;
      width: 20px;
    }
  }

  .edit-button {
    padding-left: 2rem;

    @media screen and (max-width: ${size.mobileL}) {
      padding-left: 0rem;
    }
    img {
      filter: brightness(0) saturate(100%) invert(24%) sepia(0%) saturate(484%)
        hue-rotate(174deg) brightness(98%) contrast(86%);
    }
    &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(12%) sepia(79%) saturate(7210%)
        hue-rotate(259deg) brightness(61%) contrast(139%);
    }
  }

  .accordion {
    transition: height 0.3s ease;
    height: 100%;
    overflow: hidden;
  }

  .accordion.open {
    transition: 0.3s ease;
  }

  .error-notification {
    background-color: #f8d7da;
    width: 95%;
    padding: 5px;
    border-radius: 8px;
    grid-column: 1 / -1;
    text-align: center;
    margin: 10px auto 10px auto;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
  }
`
export default SummaryShopProductDetails
