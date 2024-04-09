import React from 'react'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
} from '../components/index'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import ErrorNotification from '../components/ErrorNotification'
import shopImg from '../assets/store-img.svg'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'
import trashImg from '../assets/delete.png'

const SettingsShopsPage = () => {
  const pageTitle = 'Ustawienia - Sklepy'
  const [dataAll, setDataAll] = useState(null)
  const [shops, setShops] = useState(null)
  const [message, setMessage] = useState(false)
  const [showMessageSaved, setShowMessageSaved] =
    useState(false)
  const [showMessageDeleted, setShowMessageDeleted] =
    useState(false)
  const [showError, setShowError] = useState(false)
  const errorMessage =
    'Dane nie zostały pobrane lub zapisane, skontaktuj się z administratorem!'

  const generateId = () => {
    return '_' + Math.random().toString(36).slice(2, 9)
  }

  //to close error window
  const handleClose = () => {
    setShowError(false)
  }

  useEffect(() => {
    fetchData('http://localhost:8000/settings/aneta')
      .then((data) => {
        const shopsData = data.shops.map((shop) => ({
          id: generateId(),
          name: shop,
          isEditing: false,
        }))
        setDataAll(data)
        setShops(shopsData)
        console.log(shops)
        console.log('dataAll:', data)
      })
      .catch((error) =>
        console.error('Error fetching data:', error),
      )
  }, [])

  useEffect(() => {
    if (shops !== null) {
      saveShopsOnApi()
    }
  }, [shops])

  const handleChange = (e, id) => {
    const { value } = e.target
    setShops((prevShops) =>
      prevShops.map((shop) =>
        shop.id === id ? { ...shop, name: value } : shop,
      ),
    )
  }

  const handleDeleteShop = (id) => {
    setShops((prevShops) =>
      prevShops.filter((shop) => shop.id !== id),
    )
    if (message) {
      setShowMessageDeleted(true)
      setTimeout(() => {
        setShowMessageDeleted(false)
      }, 5000)
      setMessage(false)
    }
  }

  const toggleEdit = (id) => {
    setShops((prevShops) =>
      prevShops.map((shop) =>
        shop.id === id
          ? { ...shop, isEditing: true }
          : shop,
      ),
    )
  }

  const saveShop = (id) => {
    setShops((prevShops) =>
      prevShops.map((shop) =>
        shop.id === id
          ? { ...shop, isEditing: false }
          : shop,
      ),
    )
    if (message) {
      setShowMessageSaved(true)
      setTimeout(() => {
        setShowMessageSaved(false)
      }, 5000)
      setMessage(false)
    }
  }

  const saveShopsOnApi = async () => {
    try {
      const updatedShops = shops.map((shop) => shop.name)
      const updatedData = {
        shops: updatedShops,
        prices: dataAll.prices,
      }
      const response = await updateDataOnApi(
        updatedData,
        'http://localhost:8000/settings/aneta',
      )
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)
      if (response.status === 200) {
        setMessage(true)
        console.log('data sent')
      } else {
        console.log('data not sent')
        setShowError(true)
      }
    } catch (error) {
      console.error('Error saving shops:', error)
      setShowError(true)
    }
  }

  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Container>
        <div>
          {showError && (
            <ErrorNotification
              message={errorMessage}
              onClose={handleClose}
            />
          )}
        </div>
        <div
          className={
            showMessageDeleted
              ? 'message visible'
              : 'message'
          }
        >
          Sklep został skasowany !
        </div>
        <div
          className={
            showMessageSaved ? 'message visible' : 'message'
          }
        >
          Nowa nazwa sklepu została zapisana
        </div>
        <div className="shopsListSettings">
          {shops ? (
            shops.map((shop) => (
              <div key={shop.id} className="shop">
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
                          handleChange(e, shop.id)
                        }
                      />
                      <SaveButton
                        onClick={() => {
                          saveShop(shop.id)
                          saveShopsOnApi()
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <p>{shop.name}</p>
                      <EditButton
                        onClick={() => {
                          toggleEdit(shop.id)
                        }}
                      />
                    </>
                  )}
                </div>
                <DeleteButton
                  onClick={() => {
                    handleDeleteShop(shop.id)
                  }}
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

const SaveButton = ({ onClick }) => {
  return (
    <button className="edit-button" onClick={onClick}>
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
SaveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}
DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: scroll;
  height: 85vh;
  flex-grow: 1;
  padding-bottom: 8rem;

  .message {
    padding-bottom: 1rem;
    color: #ef3a4f;
    font-style: italic;
    font-weight: bold;
    display: none;
  }

  .visible {
    display: block;
  }

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
    /* &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(30%)
        sepia(76%) saturate(2026%) hue-rotate(335deg)
        brightness(72%) contrast(96%);
    } */
  }

  .show {
    display: block;
  }

  .hide {
    display: none;
  }
`

export default SettingsShopsPage
