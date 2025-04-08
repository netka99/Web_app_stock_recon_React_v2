import React, { useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

interface DropdownMenuProps {
  settings: {
    address: Record<string, string>
    prices: Record<string, number>
    shops: string[]
  }
  selectedShop: string
  setSelectedShop: PropTypes.func
}

const DropdownMenu = ({ settings, selectedShop, setSelectedShop }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropDown = () => {
    setIsOpen(!isOpen)
  }

  const changeShop = (shop) => {
    setSelectedShop(shop)
    console.log(selectedShop)
  }

  return (
    <Container>
      <div onClick={toggleDropDown} className="dropdownHeader">
        <div className="dropdownHeaderCont">
          {selectedShop}
          <span className="arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
        <div>
          {isOpen && (
            <ul className="dropdownList">
              {settings.shops.map((shop, index) => (
                <li
                  key={`${shop}-${index}`}
                  className="dropdownItem"
                  onClick={() => changeShop(shop)}
                >
                  {shop}
                </li>
              ))}
              <li
                key={`All`}
                className="dropdownItem"
                onClick={() => changeShop('Wybierz sklep')}
              >
                Wszystkie
              </li>
            </ul>
          )}
        </div>
      </div>
    </Container>
  )
}

DropdownMenu.propTypes = {
  settings: PropTypes.shape({
    shops: PropTypes.arrayOf(PropTypes.string),
    prices: PropTypes.shape({
      Kartacze: PropTypes.number,
      Babka: PropTypes.number,
      Kiszka: PropTypes.number,
    }),
  }),
  selectedShop: PropTypes.string,
  setSelectedShop: PropTypes.func,
}

const Container = styled.div`
  width: 20rem;
  padding: 1rem 1rem;
  display: flex;
  justify-content: center;

  .dropdownHeader {
    display: flex;
    flex-direction: column;
    width: 16rem;
    border: none;
    padding: 0.6rem 0.8rem;
    position: relative;
    line-height: 24px;
    overflow: hidden;
    text-align: center;
    z-index: 1;
    display: inline-block;
    border-radius: 15px;
    background-color: #f9f9f9;
    font-weight: bold;
    outline: none;
    height: 100%;
    color: #656464;
    cursor: pointer;
    box-shadow:
      4px 4px 6px 0 rgba(0, 0, 0, 0.3),
      -6px -6px 12px 0 rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .arrow {
    margin-left: 15px;
  }

  .dropdownList {
    list-style-type: none;
    padding: 0.5rem 0 0.5rem 0;
    margin: 0;
    border: '1px solid #ccc';
    border-radius: '5px';
    background-color: '#fff';
  }

  .dropdownItem {
    font-weight: 400;
    padding: 5px 0rem 5px 0rem;
  }
`

export default DropdownMenu
