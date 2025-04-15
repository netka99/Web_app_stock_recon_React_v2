import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { fetchData, updateDataOnApi } from '../api/fetchAPI.ts'
import shopImg from '../assets/store-img.svg'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'
import { size } from '../styles/devices'
import useTemporaryMessage from '../hooks/useTemporaryMessage'

import { Navbar, Sidebar, Footer, Spinner } from '../components/index'

const pageTitle = 'Ustawienia - Adresy'
const { VITE_APP_SETTINGS_API } = import.meta.env

const SettingsAddressPage = () => {
  interface SettingsData {
    address: Record<string, string>
    prices: Record<string, number>
    shops: string[]
  }

  const [messageText, showMessage] = useTemporaryMessage() as [
    string,
    (newMessage: string, duration?: number) => void,
  ]
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [addresses, setAddresses] = useState<Record<string, string>>({})
  const [editingShop, setEditingShop] = useState<string | null>(null)

  const handleError = useCallback(
    (error: unknown) => {
      console.error('Error fetching data:', error)
      showMessage('Problem z pobraniem danych!', 6000)
    },
    [showMessage],
  )

  const loadSettings = async (): Promise<void> => {
    try {
      const data: SettingsData = await fetchData(VITE_APP_SETTINGS_API)
      setSettings(data)
      setAddresses(data.address)
    } catch (error) {
      handleError(error)
    }
  }

  const toggleEdit = (shop: string): void => {
    setEditingShop(editingShop === shop ? null : shop)
  }

  const changeAddress = (shop: string, value: string): void => {
    setAddresses({
      ...addresses,
      [shop]: value,
    })
  }

  const saveAddressesonApi = async (): Promise<void> => {
    try {
      const updatedData = {
        shops: settings?.shops,
        prices: settings?.prices,
        address: addresses,
      }
      if (!settings) {
        showMessage('Brak ustawień!', 4000)
        return
      }
      const response = await updateDataOnApi(updatedData, VITE_APP_SETTINGS_API, 'PUT')
      if (response.status === 200) {
        showMessage('Adres został zapisany!', 4000)
      } else {
        showMessage('Dane nie zostały pobrane lub zapisane!', 4000)
      }
    } catch (error) {
      console.error('Error saving shops:', error)
      handleError('error')
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Container>
        {messageText && <div className="error-notification">{messageText}</div>}
        <div className="shopsListSettings">
          {settings ? (
            settings.shops.map((shop, index) => {
              const shopAddress = addresses[shop]
              return (
                <div key={`${shop}_${index}`} className="address-container">
                  <div className="shop-header">
                    <img className="store-picture" src={shopImg} alt="shop image" />
                    <span>{shop}</span>
                    {editingShop === shop ? (
                      <SaveButton
                        onClick={() => {
                          toggleEdit(shop)
                          saveAddressesonApi()
                        }}
                      />
                    ) : (
                      <EditButton
                        onClick={() => {
                          toggleEdit(shop)
                        }}
                      />
                    )}
                  </div>
                  <div className="shop-address">
                    {editingShop === shop ? (
                      <textarea
                        value={shopAddress || ''}
                        onChange={(e) => changeAddress(shop, e.target.value)}
                        rows={5}
                        placeholder="Wprowadź adres"
                      />
                    ) : shopAddress ? (
                      <div>
                        {shopAddress.split('\n').map((line, idx) => (
                          <div key={idx} className="address">
                            {line}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>Brak adresu</div>
                    )}
                  </div>
                </div>
              )
            })
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
interface ButtonProps {
  onClick: () => void
}

const EditButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img src={editImg} className="item-picture" alt="edit" />
  </Button>
)

const SaveButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img src={saveImg} className="item-picture" alt="save" />
  </Button>
)

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

  @media screen and (max-width: ${size.mobileL}) {
    margin-top: 4rem;
  }

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

  .shopsListSettings {
    width: 65%;

    @media screen and (max-width: ${size.mobileL}) {
      width: 95%;
    }
  }

  .address-container {
    width: 100%;
    background-color: #ffffff;
    border-radius: 15px;
    margin: 1rem 0rem;
    padding-bottom: 0.7rem;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }

  .shop-header {
    display: flex;
    align-content: space-between;
    align-items: center;
    justify-content: space-between;
    padding: 10px;

    span {
      font-weight: bold;
    }
  }

  .store-picture {
    width: 24px;
    margin: 8px;
    filter: invert(41%) sepia(0%) saturate(0%) hue-rotate(102deg) brightness(91%)
      contrast(85%);
  }
  .edit-button,
  .delete-button {
    margin-left: auto;
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding-right: 2rem;

    @media screen and (max-width: ${size.mobileL}) {
      padding-right: 0rem;
    }
    img {
      display: block;
      /* width: 90%;
      height: 90%; */
    }
  }

  .edit-button {
    padding-left: 0rem;
    img {
      filter: invert(20%) sepia(82%) saturate(2113%) hue-rotate(246deg) brightness(92%)
        contrast(95%);
    }
    &:focus,
    &:hover {
      filter: invert(44%) sepia(63%) saturate(472%) hue-rotate(219deg) brightness(87%)
        contrast(97%);
    }
  }

  .delete-button {
    padding-right: 2rem;
    img {
      filter: brightness(0) saturate(100%) invert(33%) sepia(87%) saturate(3694%)
        hue-rotate(335deg) brightness(99%) contrast(89%);
    }
    &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(30%) sepia(76%) saturate(2026%)
        hue-rotate(335deg) brightness(72%) contrast(96%);
    }
  }

  .shop-address {
    display: flex;
    flex-direction: row;
    width: 85%;
    background-color: #f6f6f6;
    margin: 0.1rem auto 0.5rem auto;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);

    textarea {
      width: 90%;
      background-color: #f6f6f6;
      border: none;
    }

    textarea:focus {
      border: none;
      outline: none;
    }
  }

  .address {
    display: flex;
    flex-direction: column;
  }
`

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`

export default SettingsAddressPage
