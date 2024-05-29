import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const SummarySale = ({ sale }) => {
  const [kartaczeSale, setKartaczeSale] = useState(0)
  const [babkaSale, setBabkaSale] = useState(0)
  const [kiszkaSale, setKiszkaSale] = useState(0)

  const calculationByProduct = (productType) => {
    return (
      sale
        ?.filter((p) => p.product === productType)
        ?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0
    )
  }

  useEffect(() => {
    setKartaczeSale(calculationByProduct('Kartacze'))
    setBabkaSale(calculationByProduct('Babka'))
    setKiszkaSale(calculationByProduct('Kiszka'))
  }, [sale])

  return (
    <Container>
      <div className="title-main">
        <p>Dzienna Sprzedaż</p>
      </div>
      <div className="summary">
        <p className="title-first">Kartacze</p>
        <p className="title-second">Babka</p>
        <p className="title-third">Kiszka</p>
        <div className="types">
          <p>Sprzedaż</p>
          <p>Zwrot</p>
        </div>
        <div className="quantities">
          <p>{kartaczeSale} szt</p>
          <p>0 szt</p>
        </div>
        <div className="quantities">
          <p>{babkaSale} kg</p>
          <p>0.00 kg</p>
        </div>
        <div className="quantities">
          <p>{kiszkaSale} kg</p>
          <p>0.00 kg</p>
        </div>
        <div className="sum sum-title">Suma</div>
        <div className="sum sum-quantities">
          {kartaczeSale} szt
        </div>
        <div className="sum sum-quantities">
          {babkaSale} kg
        </div>
        <div className="sum sum-quantities">
          {kiszkaSale} kg
        </div>
      </div>
    </Container>
  )
}

SummarySale.propTypes = {
  sale: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.string,
      quantity: PropTypes.number,
      shop: PropTypes.string,
      date: PropTypes.string,
      is_discounted: PropTypes.number,
    }),
  ),
}

const Container = styled.div`
  width: 60%;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);
  padding: 0 0 3rem 0;
  margin: auto;
  margin-top: 1.5em;
  margin-bottom: 7rem;
  flex-grow: 1;
  height: 100%;
  /* @media screen and (max-width: $tablet) {
    width: 85%;
  } */

  .summary {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    grid-template-rows: min-content min-content;
    margin: 0;
    align-items: center;

    /* @media screen and (max-width: $tablet) {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    } */
  }

  .title-main > p,
  .sum-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333232;
    padding-left: 1rem;
  }

  .title-first {
    grid-column: 2 / 3;
    grid-row: span 1;
  }

  .title-second {
    grid-column: 3 / 4;
    grid-row: span 1;
  }

  .title-third {
    grid-column: 4 / 5;
    grid-row: span 1;
  }

  .title-first,
  .title-second,
  .title-third {
    font-size: 1.1rem;
    font-weight: bold;
    color: #4a1bb4;
    margin-bottom: 0.5rem;

    /* @media screen and (max-width: $tablet) {
      font-size: 1rem;
    } */
  }

  .types {
    p {
      font-size: 1.1rem;
      font-weight: bold;
      color: #4f4f4f;
      padding-left: 1em;

      /* @media screen and (max-width: $tablet) {
        font-size: 1rem;
        padding-left: 0em;
      } */
    }
  }

  .types,
  .quantities {
    border-bottom: 3px solid #d9d9d9;
    border-top: 3px solid #d9d9d9;
    font-size: 1.1rem;
    font-weight: bold;
    color: #4f4f4f;
    /* 
    @media screen and (max-width: $tablet) {
      font-size: 1rem;
    } */
    p {
      margin-bottom: 0.5rem;
      margin-top: 0.5rem;
    }
  }

  .sum {
    margin-top: 0.5rem;
  }

  /* .sum-title {
    @media screen and (max-width: $tablet) {
      font-size: 1rem;
      padding-left: 0rem;
    }
  } */

  .sum-quantities {
    font-size: 1.1rem;
    font-weight: bold;
    color: #4a1bb4;

    /* @media screen and (max-width: $tablet) {
      font-size: 1rem;
    } */
  }
`
export default SummarySale
