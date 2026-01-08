import React from 'react'
// import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { size } from '../styles/devices'

interface DatePickerProps {
  todaysDate: string
  setTodaysDate: (date: string) => void
  // setSentQuantities,
  className?: string
}

const DatePicker: React.FC<DatePickerProps> = ({
  todaysDate,
  setTodaysDate,
  // setSentQuantities,
  className,
}) => {
  return (
    <DateContainer className={className}>
      <input
        data-testid="datepicker"
        value={todaysDate}
        type="date"
        onChange={(e) => {
          setTodaysDate(e.target.value)
          // setSentQuantities([])
        }}
        required
      />
    </DateContainer>
  )
}

const DateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;

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
