import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { units } from '../utils/productDetails'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'
import { updateDataOnApi } from '../api/fetchAPI'
const { VITE_APP_SALES_API, VITE_APP_RETURNS_API } =
  import.meta.env

const SummaryShopProductDetails = ({
  saleData,
  returnsData,
  shop,
  productSelected,
  filteredData,
  settingsData,
  isOpenIndex,
  index,
}) => {
  const contentRef = useRef(null)
  const inputRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [editIndex, setEditIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editType, setEditType] = useState(null)
  const [messageText, setMessageText] = useState(false)
  const [localSaleData, setLocalSaleData] =
    useState(saleData)
  const [localReturnsData, setLocalReturnsData] =
    useState(returnsData)

  useEffect(() => {
    if (contentRef.current) {
      if (isOpenIndex.includes(index)) {
        setContentHeight(contentRef.current.scrollHeight)
      } else {
        setContentHeight(0)
      }
    }
  }, [isOpenIndex, contentRef, messageText])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        !event.target.closest('.edit-button')
      ) {
        setEditIndex(null)
        setEditValue('')
        setEditType(null)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [inputRef, editIndex])

  const handleEdit = (index, quantity, type) => {
    setEditIndex(index)
    setEditValue(quantity)
    setEditType(type)
  }

  //message displayed on the screen after updated data are saved
  const getMessageText = (messageType) => {
    switch (messageType) {
      case 'dataSaved':
        return 'Dane zostały poprawnie zapisane!'
      case 'errorSave':
        return 'Problem z wysłaniem danych do bazy danych!'
      default:
        return ''
    }
  }

  const handleMessage = (messageType) => {
    getMessageText(messageType)
    setMessageText(messageType)
    setTimeout(() => {
      setMessageText(false)
    }, 5000)
  }

  const updateItem = async (quantity, dateItem, idItem) => {
    console.log('save button clicked', quantity, idItem)
    const urlSale = `${VITE_APP_SALES_API}/${idItem}`
    const urlReturn = `${VITE_APP_RETURNS_API}/${idItem}`

    const data = {
      id: null,
      product: productSelected,
      shop: shop,
      quantity: quantity,
      date: dateItem,
    }

    try {
      let result
      if (editType === 'Sale') {
        result = await updateDataOnApi(data, urlSale, 'PUT')
        console.log(result.status)
        if (result && result.status !== 204) {
          handleMessage('errorSave')
        } else {
          handleMessage('dataSaved')
          setLocalSaleData((prevData) =>
            prevData.map((item, idx) =>
              idx === editIndex
                ? { ...item, quantity: quantity }
                : item,
            ),
          )
        }
      }
      if (editType === 'Return') {
        result = await updateDataOnApi(
          data,
          urlReturn,
          'PUT',
        )
        console.log(result.status)
        if (result && result.status !== 204) {
          handleMessage('errorSave')
        } else {
          handleMessage('dataSaved')
          setLocalReturnsData((prevData) =>
            prevData.map((item, idx) =>
              idx === editIndex
                ? { ...item, quantity: quantity }
                : item,
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

  const filteredBySaletype = (
    typeOfData,
    minus,
    typeOfSale,
  ) => {
    const dataToUse =
      typeOfSale === 'Sale'
        ? localSaleData
        : localReturnsData
    return filteredData(shop, dataToUse).map(
      (item, idx) => (
        <div
          key={`${shop}-${idx}-sale`}
          className="details-row"
        >
          <div className="detailed-date">{item.date}</div>
          {editIndex === idx && editType === typeOfSale ? (
            <div className="quantity-input">
              {`${minus}`}
              <input
                id={`${shop}-${idx}-${typeOfSale}`}
                type="text"
                value={editValue}
                onChange={(e) =>
                  setEditValue(e.target.value)
                }
                ref={inputRef}
              />
              {`${units[productSelected]}`}
            </div>
          ) : (
            <div className="detailed-quantity">
              {`${minus}${item.quantity} ${units[productSelected]}`}
            </div>
          )}

          <div className="detailed-price">
            {`${minus}${item.quantity * settingsData.prices[productSelected]} zł`}
          </div>
          {editIndex === idx && editType === typeOfSale ? (
            <SaveButton
              onClick={(e) => {
                e.stopPropagation()
                console.log('clicked')
                updateItem(editValue, item.date, item.id)
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
          {editIndex === idx && messageText && (
            <div className="error-notification">
              {getMessageText(messageText)}
            </div>
          )}
        </div>
      ),
    )
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
        <div className="sale-filered">
          {filteredBySaletype('Sale', '', 'Sale')}
        </div>
        <div className="return-filered">
          {filteredBySaletype('Return', '-', 'Return')}
        </div>
      </div>
    </Container>
  )
}

const EditButton = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img
      src={editImg}
      className="item-picture"
      alt="edit"
    />
  </Button>
)

const SaveButton = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img
      src={saveImg}
      className="item-picture"
      alt="save"
    />
  </Button>
)

SummaryShopProductDetails.propTypes = {
  saleData: PropTypes.array.isRequired,
  returnsData: PropTypes.array.isRequired,
  shop: PropTypes.string.isRequired,
  productSelected: PropTypes.string.isRequired,
  filteredData: PropTypes.func.isRequired,
  settingsData: PropTypes.object.isRequired,
  isOpenIndex: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
}

const Container = styled.div`
  .accordion {
    overflow: hidden;
  }
  .details-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .quantity-input {
    display: flex;
    align-items: center;
  }
  .detailed-quantity,
  .detailed-date,
  .detailed-price {
    margin: 0 10px;
  }
  .error-notification {
    color: red;
  }
`

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  .item-picture {
    width: 20px;
    height: 20px;
  }
`

export default SummaryShopProductDetails
