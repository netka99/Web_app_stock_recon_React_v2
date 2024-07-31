import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { units } from '../utils/productDetails'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'
import { updateDataOnApi } from '../api/fetchAPI'

const SummaryShopProductDetails = ({
  saleData,
  returnsData,
  shop,
  productSelected,
  filteredData,
  settingsData,
  isOpenIndex,
  index,
  urlSaleVar,
  urlReturnVar,
}) => {
  const contentRef = useRef(null)
  const inputRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [editIndex, setEditIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editType, setEditType] = useState(null)

  useEffect(() => {
    if (contentRef.current) {
      if (isOpenIndex.includes(index)) {
        setContentHeight(contentRef.current.scrollHeight)
      } else {
        setContentHeight(0)
      }
    }
  }, [isOpenIndex, contentRef])

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
  }, [inputRef])

  const handleEdit = (index, quantity, type) => {
    setEditIndex(index)
    setEditValue(quantity)
    setEditType(type)
  }

  const updateItem = async (quantity, dateItem, idItem) => {
    console.log('save button clicked', quantity, idItem)
    // const urlSale = `${urlSaleVar}/${id}`
    const urlSale = 'http://localhost:8000/sales/31'

    const urlReturn = `${urlReturnVar}/${idItem}`

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
      }
      if (editType === 'Return') {
        result = await updateDataOnApi(
          data,
          urlReturn,
          'PUT',
        )
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
    return filteredData(shop, typeOfData).map(
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
              }}
            />
          ) : (
            <EditButton
              onClick={() =>
                handleEdit(idx, item.quantity, typeOfSale)
              }
            />
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
          {filteredBySaletype(saleData, '', 'Sale')}
        </div>
        <div className="return-filered">
          {filteredBySaletype(returnsData, '-', 'Return')}
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
  index: PropTypes.number,
  urlSaleVar: PropTypes.string,
  urlReturnVar: PropTypes.string,
  saleData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      id: PropTypes.number,
      is_discounted: PropTypes.number,
      product: PropTypes.string,
      quantity: PropTypes.number,
      shop: PropTypes.string,
    }),
  ),
  returnsData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      id: PropTypes.number,
      product: PropTypes.string,
      quantity: PropTypes.number,
      shop: PropTypes.string,
    }),
  ),
  isOpenIndex: PropTypes.array,
  shop: PropTypes.string,
  productSelected: PropTypes.string,
  filteredData: PropTypes.func,
  units: PropTypes.shape({
    Kartacze: PropTypes.string,
    Babka: PropTypes.string,
    Kiszka: PropTypes.string,
  }),
  settingsData: PropTypes.shape({
    shops: PropTypes.arrayOf(PropTypes.string).isRequired,
    prices: PropTypes.shape({
      Kartacze: PropTypes.number.isRequired,
      Babka: PropTypes.number.isRequired,
      Kiszka: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
}

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
  }

  .sale-filered {
    color: rgb(92, 53, 182);
    padding-bottom: 0.5rem;
  }
  .return-filered {
    color: #e51ead;
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

    @media screen and (max-width: $mobileL) {
      padding-right: 0rem;
    }
    img {
      display: block;
      width: 20px;
    }
  }

  .edit-button {
    padding-left: 2rem;
    img {
      filter: brightness(0) saturate(100%) invert(19%)
        sepia(77%) saturate(2287%) hue-rotate(247deg)
        brightness(95%) contrast(93%);
    }
    &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(13%)
        sepia(92%) saturate(4907%) hue-rotate(228deg)
        brightness(88%) contrast(105%);
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
`
export default SummaryShopProductDetails
