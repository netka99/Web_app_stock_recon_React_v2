import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { units } from '../utils/productDetails'
import { size } from '../styles/devices'
import Arrow from '../assets/chevron-down.svg'
import { SummaryShopProductDetails } from '../components/index'

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

interface SummaryPerProductProps {
  imageProduct: string
  saleData: SaleData[]
  returnsData: ReturnData[]
  settingsData: SettingsData
  productSelected: string
  isOpenIndex: number[]
  setIsOpenIndex: React.Dispatch<React.SetStateAction<number[]>>
}

const SummaryPerProduct: React.FC<SummaryPerProductProps> = ({
  settingsData,
  imageProduct,
  saleData,
  returnsData,
  productSelected,
  isOpenIndex,
  setIsOpenIndex,
}) => {
  const [localSaleData, setLocalSaleData] = useState<SaleData[]>(saleData)
  const [localReturnData, setLocalReturnData] = useState<ReturnData[]>(returnsData)

  useEffect(() => {
    setLocalSaleData(saleData)
    setLocalReturnData(returnsData)
  }, [saleData, returnsData])

  useEffect(() => {}, [isOpenIndex])

  const toggleAccordion = (index: number) => {
    setIsOpenIndex((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  const summary = (shop: string, data: (SaleData | ReturnData)[]) => {
    return (
      data
        ?.filter((d) => d.shop === shop && d.product === productSelected)
        ?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0
    )
  }

  const totals = (shop: string) => {
    const totalPerShop = summary(shop, localSaleData) - summary(shop, localReturnData)
    return totalPerShop
  }

  const filteredData = (shop: string, data: (SaleData | ReturnData)[]) => {
    return data?.filter((d) => d.shop === shop && d.product === productSelected) ?? []
  }

  const handleUpdateLocalSaleData = (newLocalSale: SaleData[]) => {
    setLocalSaleData(newLocalSale)
  }
  const handleUpdateLocalReturnData = (newLocalReturn: ReturnData[]) => {
    setLocalReturnData(newLocalReturn)
  }

  return (
    <Container>
      <img className="summary-product-image" src={imageProduct} alt="kartacze image" />
      <div className="shopsContainer">
        <div className="titles">
          <p className="title-shop">Sklep</p>
          <p>Ilość</p>
          <p>Koszt</p>
        </div>
        {settingsData.shops.map((shop, index) => (
          <div key={`${shop}-${index}`} className="summary-total">
            <div className="summary-header">
              <div className="summary-total-shop">{shop}</div>
              <div className="summary-total-quantity">
                {`${totals(shop).toFixed(2)} ${units[productSelected]}`}
              </div>
              <div className="summary-total-prize">{`${((totals(shop) * settingsData.prices[productSelected]) / 100).toFixed(2)} zł`}</div>
              <div onClick={() => toggleAccordion(index)} className="accordion-open">
                <img
                  className={`accordion-arrow ${isOpenIndex.includes(index) ? 'rotate' : ''}`}
                  src={Arrow}
                  alt="chevron down"
                />
              </div>
            </div>
            <div className="details-container">
              <SummaryShopProductDetails
                localSaleData={localSaleData}
                isOpenIndex={isOpenIndex}
                localReturnData={localReturnData}
                productSelected={productSelected}
                shop={shop}
                filteredData={filteredData}
                units={units}
                settingsData={settingsData}
                index={index}
                updateLocalSale={handleUpdateLocalSaleData}
                updateLocalReturn={handleUpdateLocalReturnData}
              />
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

const Container = styled.div`
  overflow-x: hidden;
  width: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 70vh;
  padding-top: 4rem;
  padding-bottom: 0.5rem;
  margin: 1rem auto 1rem auto;
  flex-grow: 1;
  position: relative;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);

  @media screen and (max-width: ${size.tabletS}) {
    width: 95%;
  }

  @media screen and (min-width: ${size.tabletS}) {
    width: 90%;
  }

  .summary-product-image {
    width: 60px;
    border-radius: 45px;
    border: 5px solid #ffffff;
    position: absolute;
    top: 10px;
    left: 10px;
  }

  .titles {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 0rem 1rem 0rem 1rem;
    margin: 0rem 2rem 0rem 2rem;

    @media screen and (max-width: ${size.mobileL}) {
      grid-template-columns: 40% 23% 25% 12%;
      margin: 0rem;
    }

    p {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1rem;
      font-weight: bold;
      margin-bottom: 0.2rem;
    }

    .title-shop {
      justify-content: left;

      @media screen and (max-width: ${size.mobileL}) {
        padding-left: 10px;
      }
    }
  }

  .summary-total {
    /* display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr; */
    padding: 1rem 1rem 1rem 1rem;
    background-color: $sec-bg;
    margin: 1rem 2rem 1rem 2rem;
    border-radius: 10px;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
    font-size: 1rem;
    font-weight: bold;
    color: #5d5d5d;

    .summary-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      padding: 0.5rem 0 1rem 0;

      @media screen and (max-width: ${size.mobileL}) {
        grid-template-columns: 40% 23% 25% 12%;
      }
    }

    .summary-total-shop {
      padding-right: 0rem;
      margin: 0em 0em;
      padding-left: 15px;
      text-align: left;
    }

    .summary-total-quantity {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: right;
      /* color: rgb(92, 53, 182); */

      @media screen and (max-width: ${size.desktopXS}) {
        padding-left: 0px;
      }
    }

    .summary-total-prize {
      display: flex;
      justify-content: center;
      align-items: center;
      /* color: rgb(92, 53, 182); */

      @media screen and (max-width: ${size.desktopXS}) {
        padding-left: 0px;
      }
    }

    @media screen and (max-width: 370px) {
      margin: 1rem 0.2rem 0.2rem 0.2rem;
      padding: 0.5rem 0rem 0.5rem 0rem;
      font-size: 0.8rem;
    }

    @media screen and (min-width: 370px) and (max-width: ${size.mobileL}) {
      margin: 1rem 0.5rem 1rem 0.5rem;
      padding: 0.5rem 0rem 0.5rem 0rem;
      font-size: 0.9rem;
    }

    @media screen and (min-width: ${size.mobileL}) and (max-width: ${size.desktopXS}) {
      margin: 1rem 1rem 2rem 1rem;
      padding: 0.8rem 0rem 0.8rem 0rem;
      font-size: 0.9rem;
    }
  }

  .accordion-open {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 20px;

    @media screen and (max-width: ${size.tabletS}) {
      justify-content: right;
      padding-right: 10px;
    }
  }
  .accordion-arrow {
    width: 18px;
    transition: 0.3s ease-in-out;
    /* padding-right: 20px; */
    filter: brightness(0) saturate(100%) invert(22%) sepia(34%) saturate(4565%)
      hue-rotate(246deg) brightness(91%) contrast(94%);
    cursor: pointer;

    @media screen and (max-width: 256px) {
      width: 18px;
    }
  }

  .accordion-arrow.rotate {
    transform: rotate(-180deg);
    transform-origin: center center;
  }

  .details-container {
    grid-column: 1 / -1;
    /* transition: height 0.3s ease;
    display: block; */
  }

  /* .details-container.open {
    transition: 0.3s ease;
    display: none;
  } */
`

export default SummaryPerProduct
