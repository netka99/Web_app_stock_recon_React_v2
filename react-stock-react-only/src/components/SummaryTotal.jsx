import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { units } from '../utils/productDetails'

const SummaryTotal = ({
  settingsData,
  saleData,
  returnsData,
  productSelected,
}) => {
  const summary = (data) => {
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
        <div className="sum-total">{`${summary(saleData) - summary(returnsData)} ${units[productSelected]}`}</div>
        <div className="sum-total-prize">{`${(summary(saleData) - summary(returnsData)) * settingsData.prices[productSelected]} zł`}</div>
      </div>
      <div className="sum-sale">
        <div className="sum-header-sale">Sprzedaż</div>
        <div className="sum-total">{`  ${summary(saleData)} ${units[productSelected]}`}</div>
        <div className="sum-total-prize">{`  ${summary(saleData) * settingsData.prices[productSelected]} zł`}</div>
      </div>
      <div className="sum-return">
        <div className="sum-header-sale">Zwrot</div>
        <div className="sum-total">{`-${summary(returnsData)} ${units[productSelected]}`}</div>
        <div className="sum-total-prize">{`-${summary(returnsData) * settingsData.prices[productSelected]} zł`}</div>
      </div>
    </Container>
  )
}

SummaryTotal.propTypes = {
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
  width: 60%;
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

  .sum-sale,
  .sum-container,
  .sum-return {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    width: 95%;
  }

  .sum-header {
    padding-right: 0rem;
    margin: 0em 0em;
    padding-left: 35px;
  }

  .sum-header-sale {
    padding-right: 0rem;
    margin: 0em 0em;
    padding-left: 35px;
  }

  .sum-container {
    font-weight: bold;
    font-size: 1.1rem;
    padding: 0.5rem 0 1rem 0;
  }

  .sum-sale {
    font-weight: 400;
    font-size: 1rem;
    padding: 0.5rem 0 0.5rem 0;
  }

  .sum-return {
    font-weight: 400;
    font-size: 1rem;
    color: #b86969;
    padding: 0.1rem 0 0.5rem 0;
  }

  .sum-total {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 1rem 0 1rem;
  }

  .sum-total-prize {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
export default SummaryTotal