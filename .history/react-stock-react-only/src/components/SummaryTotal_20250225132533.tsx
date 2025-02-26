import React from 'react'
import styled from 'styled-components'
import { units } from '../utils/productDetails'
import { size } from '../styles/devices'

interface SettingsData {
  shops: string[]
  prices: {
    Kartacze: number
    Babka: number
    Kiszka: number
  }
}

interface SaleData {
  date: string
  id: number
  is_discounted: number
  product: string
  quantity: number
  shop: string
}

interface ReturnsData {
  date: string
  id: number
  product: string
  quantity: number
  shop: string
}

interface SummaryTotalProps {
  settingsData: SettingsData
  saleData?: SaleData[]
  returnsData?: ReturnsData[]
  productSelected?: string
}

const SummaryTotal: React.FC<SummaryTotalProps> = ({
  settingsData,
  saleData,
  returnsData,
  productSelected,
}) => {
  const productKey: string = productSelected ?? ''
  const unit = units[productKey] || ''
  const price = settingsData.prices[productKey] || 0

  const summary = (data: SaleData[] | ReturnsData[] | undefined): number => {
    return (
      data
        ?.filter((d) => d.product === productSelected)
        ?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0
    )
  }
  return (
    <Container>
      <div className="sum-container">
        <div className="sum-header">Suma</div>
        <div className="sum-total">{`${(summary(saleData) - summary(returnsData)).toFixed(2)} ${unit}`}</div>
        <div className="sum-total-prize">{`${(((summary(saleData) - summary(returnsData)) * settingsData.prices[productSelected]) / 100).toFixed(2)} zł`}</div>
      </div>
      <div className="sum-sale">
        <div className="sum-header-sale">Sprzedaż</div>
        <div className="sum-total">{`  ${summary(saleData).toFixed(2)} ${units[productSelected]}`}</div>
        <div className="sum-total-prize">{`  ${((summary(saleData) * settingsData.prices[productSelected]) / 100).toFixed(2)} zł`}</div>
      </div>
      <div className="sum-return">
        <div className="sum-header-sale">Zwrot</div>
        <div className="sum-total">{`-${summary(returnsData).toFixed(2)} ${units[productSelected]}`}</div>
        <div className="sum-total-prize">{`-${((summary(returnsData) * settingsData.prices[productSelected]) / 100).toFixed(2)} zł`}</div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem auto 6rem auto;
  padding: 1rem 0rem 1rem 0rem;
  border-radius: 15px;
  background-color: #fdfdfd;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);
  font-size: 1rem;
  font-weight: bold;
  color: #5d5d5d;

  @media screen and (max-width: ${size.tabletS}) {
    width: 95%;
  }

  @media screen and (min-width: ${size.tabletS}) {
    width: 90%;
  }

  .sum-sale,
  .sum-container,
  .sum-return {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    width: 95%;

    @media screen and (max-width: ${size.mobileL}) {
      grid-template-columns: 40% 30% 30%;
    }

    @media screen and (max-width: ${size.tabletS}) {
      width: 100%;
    }
  }

  .sum-header {
    padding-right: 0rem;
    margin: 0em 0em;
    padding-left: 35px;

    @media screen and (max-width: ${size.mobileL}) {
      padding-left: 15px;
    }
  }

  .sum-header-sale {
    padding-right: 0rem;
    margin: 0em 0em;
    padding-left: 35px;

    @media screen and (max-width: ${size.mobileL}) {
      padding-left: 15px;
    }
  }

  .sum-container {
    font-weight: bold;
    font-size: 1rem;
    padding: 0.5rem 0 1rem 0;

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 0.9rem;
    }
  }

  .sum-sale {
    font-weight: 400;
    font-size: 1rem;
    padding: 0.5rem 0 0.5rem 0;

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 0.9rem;
    }
  }

  .sum-return {
    font-weight: 400;
    font-size: 1rem;
    color: #b86969;
    padding: 0.1rem 0 0.5rem 0;

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 0.9rem;
    }
  }

  .sum-total {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 1rem 0 1rem;

    @media screen and (max-width: ${size.tabletS}) {
      margin: 0;
    }
  }

  .sum-total-prize {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
export default SummaryTotal
