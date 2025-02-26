import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { size } from '../styles/devices'

interface Sale {
  product: string
  quantity: number
  shop: string
  date: string
  is_discounted: number
}

interface Returns {
  product: string
  quantity: number
  shop: string
  date: string
}

interface ExtraReturns {
  product: string
  quantity: number
  shop: string
  date: string
}

interface ExtraSales {
  product: string
  quantity: number
  shop: string
  date: string
  is_discounted: number
}

interface SummarySaleProps {
  sale: Sale[]
  returns: Returns[]
  extraReturns: ExtraReturns[]
  extraSales: ExtraSales[]
}

const SummarySale: React.FC<SummarySaleProps> = ({
  sale,
  returns,
  extraReturns,
  extraSales,
}) => {
  const [totals, setTotals] = useState({
    kartaczeSale: 0,
    kartaczeReturn: 0,
    babkaSale: 0,
    babkaReturn: 0,
    kiszkaSale: 0,
    kiszkaReturn: 0,
  })

  const calculationByProduct = (productType: string, saleType) => {
    return (
      saleType
        ?.filter((p) => p.product === productType)
        ?.reduce((acc, curr) => acc + Number(curr.quantity), 0) ?? 0
    )
  }

  useEffect(() => {
    const consolidatedSales = [...(sale || []), ...(extraSales || [])]
    const consolidatedReturns = [...(returns || []), ...(extraReturns || [])]

    setTotals({
      kartaczeSale: calculationByProduct('Kartacze', consolidatedSales),
      kartaczeReturn: calculationByProduct('Kartacze', consolidatedReturns),
      babkaSale: calculationByProduct('Babka', consolidatedSales),
      babkaReturn: calculationByProduct('Babka', consolidatedReturns),
      kiszkaSale: calculationByProduct('Kiszka', consolidatedSales),
      kiszkaReturn: calculationByProduct('Kiszka', consolidatedReturns),
    })
  }, [sale, returns, extraSales, extraReturns])

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
          <p>{totals.kartaczeSale} szt</p>
          <p>{totals.kartaczeReturn} szt</p>
        </div>
        <div className="quantities">
          <p>{totals.babkaSale.toFixed(2)} kg</p>
          <p>{totals.babkaReturn.toFixed(2)} kg</p>
        </div>
        <div className="quantities">
          <p>{totals.kiszkaSale.toFixed(2)} kg</p>
          <p>{totals.kiszkaReturn.toFixed(2)} kg</p>
        </div>
        <div className="sum sum-title">Suma</div>
        <div className="sum sum-quantities">
          {totals.kartaczeSale - totals.kartaczeReturn} szt
        </div>
        <div className="sum sum-quantities">
          {(totals.babkaSale - totals.babkaReturn).toFixed(2)} kg
        </div>
        <div className="sum sum-quantities">
          {(totals.kiszkaSale - totals.kiszkaReturn).toFixed(2)} kg
        </div>
      </div>
    </Container>
  )
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

  @media screen and (max-width: ${size.tabletS}) {
    width: 95%;
  }

  .summary {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    grid-template-rows: min-content min-content;
    margin: 0;
    align-items: center;

    @media screen and (max-width: ${size.tabletS}) {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  }

  .title-main > p,
  .sum-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333232;
    padding-left: 1rem;

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 1rem;
      padding-left: 5px;
    }
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

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 1rem;
    }
  }

  .types {
    p {
      font-size: 1.1rem;
      font-weight: bold;
      color: #4f4f4f;
      padding-left: 1em;

      @media screen and (max-width: ${size.tabletS}) {
        font-size: 1rem;
        padding-left: 0em;
      }
    }
  }

  .types,
  .quantities {
    border-bottom: 3px solid #d9d9d9;
    border-top: 3px solid #d9d9d9;
    font-size: 1.1rem;
    font-weight: bold;
    color: #4f4f4f;

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 1rem;
      padding-left: 5px;
    }
    p {
      margin-bottom: 0.5rem;
      margin-top: 0.5rem;
    }
  }

  .sum {
    margin-top: 0.5rem;
  }

  .sum-title {
    @media screen and (max-width: ${size.tabletS}t) {
      font-size: 1rem;
      padding-left: 0rem;
    }
  }

  .sum-quantities {
    font-size: 1.1rem;
    font-weight: bold;
    color: #4a1bb4;

    @media screen and (max-width: ${size.tabletS}) {
      font-size: 1rem;
      padding-left: 5px;
    }
  }
`
export default SummarySale
