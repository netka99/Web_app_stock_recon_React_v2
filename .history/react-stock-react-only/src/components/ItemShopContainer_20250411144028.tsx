import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import StoreImg from '../assets/store-img.svg'
import Arrow from '../assets/chevron-down.svg'
import { size } from '../styles/devices'
import useTemporaryMessage from '../hooks/useTemporaryMessage'
import { ExtraSale, ItemSale } from './index'

interface SaleValue {
  id: number | null
  product: string
  shop: string
  quantity: number
  date: string
  is_discounted?: number
}

interface ApiResponse<T> {
  status: number
  data: T | null
}

interface ErrorResponse {
  message: string
}

interface ItemShopContainerProps {
  imageProduct: string
  todaysDate: string
  productName: string
  saleType: string
  unit: string
  shopName: string
  value: number | string
  // valueExtra: SaleValue[]
  saveData: (
    quantity: number,
    shopName: string,
    isExtra?: boolean,
    // ) => Promise<{ status: number; data: { message: string } }>
  ) => Promise<ApiResponse<{ message: string } | null | ErrorResponse>>
  isSale: boolean
  isShopDisabled: (shop: string, sale: SaleValue[], returns: SaleValue[]) => boolean
  saveExtraData: (
    quantity: number,
    shopName: string,
  ) => Promise<ApiResponse<{ message: string } | null | ErrorResponse>>
  extraSaleValues: SaleValue[]
  extraReturnValues: SaleValue[]
  updatedSale: SaleValue[]
  updatedReturn: SaleValue[]
}

const ItemShopContainer: React.FC<ItemShopContainerProps> = ({
  imageProduct,
  productName,
  saleType,
  unit,
  shopName,
  value,
  // valueExtra,
  saveData,
  isSale,
  isShopDisabled,
  saveExtraData,
  updatedSale,
  updatedReturn,
  extraReturnValues,
  extraSaleValues,
  todaysDate,
}) => {
  const [inputValue, setInputValue] = useState<number | string>(value)
  const [extraSale, setExtraSale] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const contentRefExtra = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [messageText, showMessage] = useTemporaryMessage()

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    setInputValue(value) // Update input value when value prop changes
  }, [value, saleType])

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen, contentHeight])

  //responsible to close all containers whenever product, type of sale, date is changed
  useEffect(() => {
    setIsOpen(false)
  }, [todaysDate, isSale, productName])

  const handleChange = (newValue: string | number) => {
    setInputValue(newValue)
  }

  const handleSaveData = async (
    valueofData: number | string,
    savingData: ItemShopContainerProps['saveData'],
  ) => {
    const numericValue =
      typeof valueofData === 'number' ? valueofData : Number(valueofData)
    const result = await savingData(numericValue, shopName)
    if (result && result.status !== 200) {
      showMessage('Problem z pobraniem danych!', 6000)
    } else {
      if (isSale) {
        showMessage('Sprzedaż została zapisana!', 4000)
      } else if (!isSale) {
        showMessage('Zwrot został zapisany!!', 4000)
      }
    }
  }

  const openExtraSale = () => {
    setExtraSale(true)
    setTimeout(() => {
      if (contentRefExtra.current) {
        setContentHeight(contentHeight + contentRefExtra.current.scrollHeight)
      }
    }, 0)
    setTimeout(() => {
      setExtraSale(true)
    }, 500)
  }

  return (
    <Container>
      <div className="header">
        <div className="store-title">
          <img src={StoreImg} alt="black solid store image" />
          <p>{shopName}</p>
        </div>
        <div className="accordion-buttons">
          <span
            className={`button-checked ${isShopDisabled(shopName, updatedSale, updatedReturn) ? 'saved' : ''}`}
          >
            ✓
          </span>
          <button onClick={toggleAccordion} className="accordion-open">
            <img
              className={`accordion-arrow ${isOpen ? 'rotate' : ''}`}
              src={Arrow}
              alt="chevron down"
            />
          </button>
        </div>
      </div>
      {messageText && <div className="error-notification">{messageText}</div>}
      <div
        className={`container-input-sale ${isOpen ? 'open' : ''}`}
        ref={contentRef}
        style={{ height: `${contentHeight}px` }}
      >
        <ItemSale
          imageProduct={imageProduct}
          productName={productName}
          saleType={saleType}
          unit={unit}
          shopName={shopName}
          value={inputValue}
          onChange={handleChange}
          updatedSale={updatedSale}
          updatedReturn={updatedReturn}
          isShopDisabled={(shop) => isShopDisabled(shop, updatedSale, updatedReturn)}
        />
        <div className="saving-buttons">
          <button onClick={openExtraSale} className="add-sale">
            ＋
          </button>
          <button
            className="save-sale"
            onClick={() => {
              handleSaveData(inputValue, saveData)
            }}
            disabled={isShopDisabled(shopName, updatedSale, updatedReturn)}
          >
            {isShopDisabled(shopName, updatedSale, updatedReturn)
              ? isSale
                ? 'Sprzedaż zapisana'
                : 'Zwrot zapisany'
              : isSale
                ? 'Zapisz sprzedaż'
                : 'Zapisz zwrot'}
          </button>
        </div>

        {extraSale && (
          <ExtraSale
            unit={unit}
            shopName={shopName}
            handleSaveData={handleSaveData}
            ref={contentRefExtra}
            saleType={saleType}
            isShopDisabled={(shop) =>
              isShopDisabled(shop, extraSaleValues, extraReturnValues)
            }
            saveExtraData={saveExtraData}
            isSale={isSale}
            // valueExtra={valueExtra}
            extraReturnValues={extraReturnValues}
            extraSaleValues={extraSaleValues}
            productName={productName}
            todaysDate={todaysDate}
          />
        )}
      </div>
    </Container>
  )
}

const Container = styled.div`
  width: 65%;
  background-color: #ffffff;
  border-radius: 15px;
  margin: 1rem 0rem;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);

  @media screen and (max-width: ${size.tabletS}) {
    width: 95%;
  }

  .header {
    display: flex;
    align-content: space-between;
    align-items: center;
    justify-content: space-between;
  }

  .store-title {
    display: flex;
    justify-content: flex-start;
    padding: 10px;
    gap: 15px;
    align-items: center;

    img {
      width: 24px;
      margin: 8px;
      filter: invert(41%) sepia(0%) saturate(0%) hue-rotate(102deg) brightness(91%)
        contrast(85%);
    }
  }

  .accordion-buttons {
    display: flex;
    align-items: center;
    gap: 1.3rem;
    padding: 10px;

    @media screen and (max-width: ${size.tabletS}) {
      gap: 0.5rem;
    }
  }

  .button-checked {
    content: '✓';
    font-size: 1.4rem;
    padding: 5px 20px 5px 20px;
    background: linear-gradient(to bottom right, #e51ead, #e086bf);
    color: transparent;
    border-radius: 25px;
    font-weight: bold;
    box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.3);

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 1rem;
    }
  }

  .button-checked.saved {
    color: white;
  }

  .accordion-open {
    background: linear-gradient(to bottom right, #5c35b6, #8461c5);
    padding: 2px 1.5rem 2px 1.5rem;
    border-radius: 15px;
    border: none;
    box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);

    @media screen and (max-width: ${size.tabletS}) {
      padding: 2px 1rem 2px 1rem;
    }

    &:hover {
      background: linear-gradient(to bottom right, #512fa1, #7656b0);
      cursor: pointer;
    }

    &:active {
      box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.3);
    }
  }

  .accordion-arrow {
    width: 25px;
    padding: 8px 0px;
    margin: 0;
    transition: 0.3s ease-in-out;
    filter: invert(100%) sepia(44%) saturate(124%) hue-rotate(254deg) brightness(114%)
      contrast(88%);

    @media screen and (max-width: ${size.tabletS}) {
      width: 18px;
    }
  }

  .accordion-arrow.rotate {
    transform: rotate(-180deg);
    transform-origin: center center;
  }

  .container-input-sale {
    overflow: hidden;
    transition: height 0.3s ease;
    height: 0;
  }

  .container-input-sale.open {
    transition: height 0.3s ease;
  }

  .saving-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 10px 15px 20px 15px;

    button {
      border: none;
      color: white;
      padding: 4px 18px;
      border-radius: 15px;
      font-size: 1rem;
      font-weight: bold;
      box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
      /* margin: 0rem 0.5rem; */

      /* @media screen and (max-width: $tablet) {
      font-size: 0.9rem;
    } */

      &:active {
        box-shadow: 1px 1px 4px 1px rgba(54, 54, 54, 0.3);
      }
    }

    .add-sale {
      background: linear-gradient(to bottom right, #d5d6d6eb, #ffffffeb);
      color: #e51ead;
      font-size: 1.5rem;
      padding: 4px 18px;

      &:hover {
        background: linear-gradient(to bottom right, #c3c4c4eb, #e5e5e5eb);
        cursor: pointer;
      }
    }

    .save-sale {
      margin-left: 18%;
      background: linear-gradient(to bottom right, #e51ead, #e086bf);
      &:hover {
        background: linear-gradient(to bottom right, #c91a97, #c376a7);
        cursor: pointer;
      }
    }
  }

  .error-notification {
    background-color: #f8d7da;
    width: 50%;
    padding: 0.3rem;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 0.5rem auto;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
    box-shadow:
      0 3px 6px 0 rgba(0, 0, 0, 0.2),
      0 3px 10px 0 rgba(0, 0, 0, 0.19);
  }
`
export default ItemShopContainer
