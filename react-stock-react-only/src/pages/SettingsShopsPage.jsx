import React from 'react'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
  ShopList,
} from '../components/index'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import shopImg from '../assets/store-img.svg'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'
import trashImg from '../assets/delete.png'

const SettingsShopsPage = () => {
  const pageTitle = 'Ustawienia - Sklepy'
  const [shops, setShops] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchData('http://localhost:8000/settings/aneta')
      .then((data) => {
        console.log('Shops:', data)
        const shopsData = data.shops
        setShops(
          shopsData.map((shop, index) => ({
            name: shop,
            isEditing: false,
            index: index,
          })),
        )
      })
      .catch((error) =>
        console.error('Error fetching data:', error),
      )
  }, [])

  const handleChange = (e, index) => {
    const { value } = e.target
    setShops((prevShops) =>
      prevShops.map((shop) =>
        shop.index === index
          ? { ...shop, name: value }
          : shop,
      ),
    )
  }

  const handleDeleteShop = (index) => {
    setShops((prevShops) =>
      prevShops.filter((shop) => shop.index !== index),
    )
  }

  const toggleEdit = (index) => {
    setShops((prevShops) =>
      prevShops.map((shop) =>
        shop.index === index
          ? { ...shop, isEditing: true }
          : shop,
      ),
    )
  }

  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Container>
        <div className="shopsListSettings">
          {shops ? (
            shops.map((shop, index) => (
              <div key={index} className="shop">
                <img
                  className="store-picture"
                  src={shopImg}
                  alt="shop image"
                ></img>
                <div className="store-name">
                  {shop.isEditing ? (
                    <>
                      <input
                        value={shop.name}
                        onChange={(e) =>
                          handleChange(e, index)
                        }
                      />
                      <SaveButton />
                    </>
                  ) : (
                    <>
                      <p>{shop.name}</p>
                      <EditButton
                        onClick={() => {
                          toggleEdit(index)
                        }}
                      />
                    </>
                  )}
                </div>
                <DeleteButton
                  onClick={() => handleDeleteShop(index)}
                />
              </div>
            ))
          ) : (
            <Spinner />
          )}
        </div>
      </Container>
      <Sidebar />
      <Footer />
    </main>
  )
}

const EditButton = ({ onClick }) => {
  return (
    <button className="edit-button" onClick={onClick}>
      <img
        src={editImg}
        className="item-picture"
        alt="edit image of pen"
      />
    </button>
  )
}

const SaveButton = () => {
  return (
    <button className="edit-button">
      <img
        className="item-picture"
        src={saveImg}
        alt="shop image"
      />
    </button>
  )
}

const DeleteButton = ({ onClick }) => {
  return (
    <button className="delete-button" onClick={onClick}>
      <img
        src={trashImg}
        className="item-picture"
        alt="delete image of trash can"
      />
    </button>
  )
}

EditButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}
DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: scroll;
  height: 85vh;
  flex-grow: 1;
  padding-bottom: 8rem;

  .shop {
    display: flex;
    align-items: center;
    width: 100%;
    border-bottom: 2px solid #dfdfdf;
  }

  .store-name {
    padding-left: 1rem;
    display: flex;
    align-items: center;
    width: 100%;
    p {
      padding-right: 2rem;
    }
  }

  .store-picture {
    width: 24px;
    margin: 8px;
    filter: invert(41%) sepia(0%) saturate(0%)
      hue-rotate(102deg) brightness(91%) contrast(85%);
  }

  .edit-button,
  .delete-button {
    margin-left: auto;
    background-color: transparent;
    border: none;
    cursor: pointer;

    @media screen and (max-width: $mobileL) {
      padding-right: 0rem;
    }
    img {
      display: block;
      /* width: 90%;
      height: 90%; */
    }
  }

  .edit-button {
    padding-left: 2rem;
    img {
      filter: brightness(0) saturate(100%) invert(65%)
        sepia(45%) saturate(5826%) hue-rotate(176deg)
        brightness(97%) contrast(92%);
    }
    &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(13%)
        sepia(92%) saturate(4907%) hue-rotate(228deg)
        brightness(88%) contrast(105%);
    }
  }

  .delete-button {
    padding-right: 2rem;
    img {
      filter: brightness(0) saturate(100%) invert(33%)
        sepia(87%) saturate(3694%) hue-rotate(335deg)
        brightness(99%) contrast(89%);
    }
    &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(30%)
        sepia(76%) saturate(2026%) hue-rotate(335deg)
        brightness(72%) contrast(96%);
    }
  }

  .show {
    display: block;
  }

  .hide {
    display: none;
  }
`

export default SettingsShopsPage
