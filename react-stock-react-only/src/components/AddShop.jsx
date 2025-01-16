import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { size } from '../styles/devices'

const AddShop = ({ onAddShop }) => {
  const [shopName, setShopName] = useState('')
  return (
    <Container>
      <input
        placeholder="Dodaj Sklep"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
      />
      <button
        onClick={() => {
          setShopName('')
          onAddShop(shopName)
        }}
      >
        Dodaj
      </button>
    </Container>
  )
}
const Container = styled.div`
  margin: 1rem auto 3rem auto;
  max-width: 100%;

  @media screen and (max-width: ${size.mobileL}) {
    margin: 1rem auto 2rem auto;
  }

  input {
    width: 90%;
    height: 2.5rem;
    padding-left: 1rem;
    background: linear-gradient(
      to bottom right,
      #f2f2f2,
      #dfdfdf
    );
    border-radius: 20px;
    box-shadow: 4px 6px 6px 1px rgba(0, 0, 0, 0.3);
    border: none;
    font-size: 1rem;
    margin-bottom: 1rem;
    padding: 0 2rem 0 2rem;

    @media screen and (max-width: ${size.mobileL}) {
      width: 70%;
      margin-left: 1rem;
    }
  }

  button {
    border: none;
    color: white;
    padding: 10px 25px;
    margin-top: 0.5rem;
    border-radius: 20px;
    font-size: 1rem;
    box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
    background: linear-gradient(
      to bottom right,
      #5c35b6,
      #8461c5
    );
    cursor: pointer;

    @media screen and (max-width: ${size.mobileL}) {
      margin-left: 1rem;
    }
  }
`

AddShop.propTypes = {
  onAddShop: PropTypes.func.isRequired,
}

export default AddShop
