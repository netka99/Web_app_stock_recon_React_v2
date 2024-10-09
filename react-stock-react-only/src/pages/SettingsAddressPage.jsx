import React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import shopImg from '../assets/store-img.svg'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'

import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
} from '../components/index'

const pageTitle = 'Ustawienia - Adresy'
const { VITE_APP_SETTINGS_API } = import.meta.env

const SettingsAddressPage = () => {
  const [messageText, setMessageText] = useState('')
  const [settings, setSettings] = useState(null)
  const [addresses, setAddresses] = useState({})
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleMessage = (messageType) => {
    getMessageText(messageType)
    setmessageText(messageType)
    setTimeout(() => {
      setmessageText(false)
    }, 10000)
  }

  const getMessageText = (messageType) => {
    switch (messageType) {
      case 'added':
        return 'Sklep został dodany!'
      case 'deleted':
        return 'Sklep został skasowany!'
      case 'saved':
        return 'Nowa nazwa sklepu została zapisana!'
      case 'error':
        return 'Dane nie zostały pobrane lub zapisane, skontaktuj się z administratorem!'
      default:
        return ''
    }
  }

  const handleError = (error) => {
    console.error('Error fetching data:', error),
      setTimeout(() => {
        setMessageText(getMessageText('errorFetching'))
      }, 4000)
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await fetchData(VITE_APP_SETTINGS_API)
      setSettings(data)
      setAddresses(data.address)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Container>
        {messageText && (
          <div className="error-notification">
            {getMessageText(messageText)}
          </div>
        )}
        <div className="shopsListSettings">
          {settings ? (
            settings.shops.map((shop, index) => (
              <div key={`${shop}_${index}`}>
                <div className="shop-header">
                  <img
                    className="store-picture"
                    src={shopImg}
                    alt="shop image"
                  />
                  <span>{shop}</span>
                </div>
                {addresses[shop] ? (
                  <div className="shop-address">
                    {isEditing ? (
                      <textarea
                        type="text"
                        defaultValue={addresses[shop]}
                        onChange={(e) => e.target.value}
                      />
                    ) : (
                      <div>
                        <div>{addresses[shop]}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>brak adresu</div>
                )}
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: scroll;
  /* height: 100vh; */
  flex-grow: 1;
  margin-bottom: 8rem;
  margin-top: 10rem;

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

  .error-notification {
    background-color: #f8d7da;
    border: 1px solid #e74c3c;
    padding: 0.8rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
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
`

export default SettingsAddressPage
