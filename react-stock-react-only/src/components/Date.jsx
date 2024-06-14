import React from 'react'
// import { useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { size } from '../styles/devices'

const DatePicker = ({
  todaysDate,
  setTodaysDate,
  setSentQuantities,
}) => {
  return (
    <DateContainer>
      <input
        value={todaysDate}
        type="date"
        onChange={(e) => {
          setTodaysDate(e.target.value)
          setSentQuantities([])
        }}
        required
      />
    </DateContainer>
  )
}

DatePicker.propTypes = {
  todaysDate: PropTypes.string.isRequired,
  setTodaysDate: PropTypes.func,
  setSentQuantities: PropTypes.func,
}
const DateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media screen and (max-width: ${size.tablet}) {
    padding: 1rem;
  }

  span::after {
    padding-left: 5px;
  }

  input:invalid + span::after {
    content: '✖';
    font-size: 1.4rem;
  }

  textarea:focus {
    outline: none;
  }

  input:valid + span::after {
    content: '✓';
    color: green;
    font-size: 2rem;
    font-weight: bold;
  }

  input[type='date'] {
    appearance: none;
    -webkit-appearance: none;
    color: #656464;
    font-size: 1.6rem;
    border: 1px solid #616161;
    border-radius: 10px;
    background: #ecf0f1;
    padding: 10px;
    display: inline-block !important;
    visibility: visible !important;

    /* @media screen and (max-width: $mobileL) {
      font-size: 1.2rem;
    } */

    &:focus {
      color: #656464;
      box-shadow: none;
      -webkit-box-shadow: none;
      -moz-box-shadow: none;
    }
  }

  .dateButton {
    color: #656464;
    font-size: 1rem;
    border: 1px solid #616161;
    border-radius: 10px;
    background: #ecf0f1;
    padding: 6px;
    display: inline-block !important;
    visibility: visible !important;
    margin-left: 0.5rem;

    &:hover {
      background: #dbdbdc;
      cursor: pointer;
      color: #3a3a3a;
    }

    &:active {
      box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.3);
    }
  }
`
export default DatePicker
