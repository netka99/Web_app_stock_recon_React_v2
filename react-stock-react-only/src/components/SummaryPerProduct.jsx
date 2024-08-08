import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { units } from '../utils/productDetails'
import Arrow from '../assets/chevron-down.svg'
import { SummaryShopProductDetails } from '../components/index'

const SummaryPerProduct = ({
  settingsData,
  imageProduct,
  saleData,
  returnsData,
  productSelected,
}) => {
  const [isOpenIndex, setIsOpenIndex] = useState([])
  const [localSaleData, setLocalSaleData] =
    useState(saleData)
  const [localReturnData, setLocalReturnData] =
    useState(returnsData)

  useEffect(() => {
    setLocalSaleData(saleData)
    setLocalReturnData(returnsData)
  }, [saleData, returnsData])

  useEffect(() => {}, [isOpenIndex])

  const toggleAccordion = (index) => {
    setIsOpenIndex((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  const summary = (shop, data) => {
    return (
      data
        ?.filter(
          (d) =>
            d.shop === shop &&
            d.product === productSelected,
        )
        ?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0
    )
  }

  const totals = (shop) => {
    const totalPerShop =
      summary(shop, localSaleData) -
      summary(shop, localReturnData)
    return totalPerShop
  }

  const filteredData = (shop, data) => {
    return (
      data?.filter(
        (d) =>
          d.shop === shop && d.product === productSelected,
      ) ?? []
    )
  }

  const handleUpdateLocalSaleData = (newLocalSale) => {
    setLocalSaleData(newLocalSale)
  }
  const handleUpdateLocalReturnData = (newLocalReturn) => {
    setLocalReturnData(newLocalReturn)
  }

  return (
    <Container>
      <img
        className="summary-product-image"
        src={imageProduct}
        alt="kartacze image"
      />
      <div className="shopsContainer">
        <div className="titles">
          <p className="title-shop">Sklep</p>
          <p>Ilość</p>
          <p>Koszt</p>
        </div>
        {settingsData.shops.map((shop, index) => (
          <div
            key={`${shop}-${index}`}
            className="summary-total"
          >
            <div className="summary-header">
              <div className="summary-total-shop">
                {shop}
              </div>
              <div className="summary-total-quantity">
                {`${totals(shop)} ${units[productSelected]}`}
              </div>
              <div className="summary-total-prize">{`${totals(shop) * settingsData.prices[productSelected]} zł`}</div>
              <div
                onClick={() => toggleAccordion(index)}
                className="accordion-open"
              >
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
                updateLocalReturn={
                  handleUpdateLocalReturnData
                }
              />
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

SummaryPerProduct.propTypes = {
  imageProduct: PropTypes.string.isRequired,
  shop: PropTypes.string,
  settingsData: PropTypes.shape({
    shops: PropTypes.arrayOf(PropTypes.string).isRequired,
    prices: PropTypes.shape({
      Kartacze: PropTypes.number.isRequired,
      Babka: PropTypes.number.isRequired,
      Kiszka: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
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
  productSelected: PropTypes.string,
}

const Container = styled.div`
  overflow-x: hidden;
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 70vh;
  padding-top: 4rem;
  padding-bottom: 0.5rem;
  margin: 1rem auto 6rem auto;
  flex-grow: 1;
  position: relative;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);
  /* 
    @media screen and (max-width: $tabletS) {
      width: 95%;
    }

    @media screen and (min-width: $tabletS) and (max-width: $tablet) {
      width: 80%;
    }

    @media screen and (min-width: $tablet) and (max-width: $desktop) {
      width: 70%;
    }

    @media screen and (min-width: $desktop) and (max-width: $desktopXS) {
      width: 60%;
    } */

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
    }

    .summary-total-shop {
      padding-right: 0rem;
      margin: 0em 0em;
      padding-left: 15px;
    }

    .summary-total-quantity {
      display: flex;
      justify-content: center;
      align-items: center;
      /* color: rgb(92, 53, 182); */

      @media screen and (max-width: $desktopXS) {
        padding-left: 0px;
      }
    }

    .summary-total-prize {
      display: flex;
      justify-content: center;
      align-items: center;
      /* color: rgb(92, 53, 182); */

      @media screen and (max-width: $desktopXS) {
        padding-left: 0px;
      }
    }

    @media screen and (max-width: 370px) {
      margin: 1rem 0.2rem 2rem 0.2rem;
      padding: 1rem 0rem 1rem 0rem;
      font-size: 0.9rem;
    }

    @media screen and (min-width: 370px) and (max-width: $mobileL) {
      margin: 1rem 0.5rem 2rem 0.5rem;
      padding: 1rem 0rem 1rem 0rem;
      font-size: 1rem;
    }

    @media screen and (min-width: $mobileL) and (max-width: $desktopXS) {
      margin: 1rem 1rem 2rem 1rem;
      padding: 1rem 0rem 1rem 1rem;
    }
  }

  .accordion-open {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 20px;
  }
  .accordion-arrow {
    width: 18px;
    transition: 0.3s ease-in-out;
    /* padding-right: 20px; */
    filter: brightness(0) saturate(100%) invert(22%)
      sepia(34%) saturate(4565%) hue-rotate(246deg)
      brightness(91%) contrast(94%);
    cursor: pointer;

    /* @media screen and (max-width: 256px) {
      width: 18px;
    } */
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
