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
    prices: Record<string, number>
    shops: string[]
    buyer_data: Record<string, BuyerData>
  }
  interface BuyerData {
    nazwa: string
    addressL1: string
    addressL2: string
    nip: string
    hasPodmiot3: boolean
    podmiot3?: Podmiot3Data
  }
  interface Podmiot3Data {
    nazwa: string
    addressL1: string
    addressL2: string
    idWew: string
    rola: string
  }

  const [messageText, showMessage] = useTemporaryMessage() as [
    string,
    (newMessage: string, duration?: number) => void,
  ]
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [buyerData, setBuyerData] = useState<Record<string, BuyerData>>({})
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
      setBuyerData(data.buyer_data || {})
    } catch (error) {
      handleError(error)
    }
  }

  const toggleEdit = (shop: string): void => {
    setEditingShop(editingShop === shop ? null : shop)
  }

  const changeBuyerField = (
    shop: string,
    field: keyof BuyerData,
    value: string | boolean,
  ): void => {
    setBuyerData({
      ...buyerData,
      [shop]: {
        ...buyerData[shop],
        [field]: value,
      },
    })
  }

  const changePodmiot3Field = (
    shop: string,
    field: keyof Podmiot3Data,
    value: string,
  ): void => {
    setBuyerData({
      ...buyerData,
      [shop]: {
        ...buyerData[shop],
        podmiot3: {
          ...buyerData[shop].podmiot3!,
          [field]: value,
        },
      },
    })
  }

  const togglePodmiot3 = (shop: string): void => {
    const currentData = buyerData[shop]
    setBuyerData({
      ...buyerData,
      [shop]: {
        ...currentData,
        hasPodmiot3: !currentData.hasPodmiot3,
        podmiot3: !currentData.hasPodmiot3
          ? {
              nazwa: '',
              addressL1: '',
              addressL2: '',
              idWew: '',
              rola: '2',
            }
          : currentData.podmiot3,
      },
    })
  }
  const saveAddressesonApi = async (): Promise<void> => {
    try {
      if (!settings) {
        showMessage('Brak ustawień!', 4000)
        return
      }
      const updatedData = {
        shops: settings.shops || [],
        prices: {
          ...settings.prices,
          Kartacze: settings.prices?.Kartacze ?? 0,
          Babka: settings.prices?.Babka ?? 0,
          Kiszka: settings.prices?.Kiszka ?? 0,
        },
        buyer_data: buyerData,
      }
      if (!settings) {
        showMessage('Brak ustawień!', 4000)
        return
      }
      const response = await updateDataOnApi(updatedData, VITE_APP_SETTINGS_API, 'PUT')
      if (response.status === 200) {
        showMessage('Dane został zapisany!', 4000)
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
              const shopData = buyerData[shop]
              if (!shopData) return null
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

                  {/* PODMIOT 2 - NABYWCA */}
                  <div className="section-title">
                    Nabywca/Płatnik {shopData.hasPodmiot3 && '(Główna firma)'}
                  </div>

                  <div className="shop-field">
                    <label>Nazwa:</label>
                    {editingShop === shop ? (
                      <input
                        type="text"
                        value={shopData.nazwa || ''}
                        onChange={(e) => changeBuyerField(shop, 'nazwa', e.target.value)}
                        placeholder="Nazwa firmy"
                        maxLength={512}
                      />
                    ) : (
                      <div>{shopData.nazwa || 'Brak nazwy'}</div>
                    )}
                  </div>

                  <div className="shop-field">
                    <label>Adres L1:</label>
                    {editingShop === shop ? (
                      <textarea
                        value={shopData.addressL1 || ''}
                        onChange={(e) =>
                          changeBuyerField(shop, 'addressL1', e.target.value)
                        }
                        rows={2}
                        placeholder="Ulica, nr domu"
                        maxLength={512}
                      />
                    ) : (
                      <div>{shopData.addressL1 || 'Brak adresu'}</div>
                    )}
                  </div>

                  <div className="shop-field">
                    <label>Adres L2:</label>
                    {editingShop === shop ? (
                      <input
                        type="text"
                        value={shopData.addressL2 || ''}
                        onChange={(e) =>
                          changeBuyerField(shop, 'addressL2', e.target.value)
                        }
                        placeholder="Kod pocztowy, Miasto"
                        maxLength={512}
                      />
                    ) : (
                      <div>{shopData.addressL2 || 'Brak adresu'}</div>
                    )}
                  </div>

                  <div className="shop-field">
                    <label>NIP:</label>
                    {editingShop === shop ? (
                      <input
                        type="text"
                        value={shopData.nip || ''}
                        onChange={(e) => changeBuyerField(shop, 'nip', e.target.value)}
                        placeholder="NIP (tylko cyfry)"
                        maxLength={10}
                      />
                    ) : (
                      <div>{shopData.nip || 'Brak NIP'}</div>
                    )}
                  </div>

                  {/* CHECKBOX PODMIOT3 */}
                  {editingShop === shop && (
                    <div className="shop-field">
                      <label>
                        <input
                          type="checkbox"
                          checked={shopData.hasPodmiot3 || false}
                          onChange={() => togglePodmiot3(shop)}
                        />
                        Sklep ma odbiorcę końcowego (Podmiot3)
                      </label>
                    </div>
                  )}

                  {/* PODMIOT 3 - ODBIORCA */}
                  {shopData.hasPodmiot3 && shopData.podmiot3 && (
                    <>
                      <div className="section-title podmiot3-title">
                        Odbiorca końcowy (Sklep/Oddział)
                      </div>

                      <div className="shop-field">
                        <label>Nazwa sklepu:</label>
                        {editingShop === shop ? (
                          <input
                            type="text"
                            value={shopData.podmiot3.nazwa || ''}
                            onChange={(e) =>
                              changePodmiot3Field(shop, 'nazwa', e.target.value)
                            }
                            placeholder="np. Sklep nr 24"
                            maxLength={512}
                          />
                        ) : (
                          <div>{shopData.podmiot3.nazwa || 'Brak nazwy'}</div>
                        )}
                      </div>

                      <div className="shop-field">
                        <label>Adres L1:</label>
                        {editingShop === shop ? (
                          <textarea
                            value={shopData.podmiot3.addressL1 || ''}
                            onChange={(e) =>
                              changePodmiot3Field(shop, 'addressL1', e.target.value)
                            }
                            rows={2}
                            placeholder="Ulica, nr domu"
                            maxLength={512}
                          />
                        ) : (
                          <div>{shopData.podmiot3.addressL1 || 'Brak adresu'}</div>
                        )}
                      </div>

                      <div className="shop-field">
                        <label>Adres L2:</label>
                        {editingShop === shop ? (
                          <input
                            type="text"
                            value={shopData.podmiot3.addressL2 || ''}
                            onChange={(e) =>
                              changePodmiot3Field(shop, 'addressL2', e.target.value)
                            }
                            placeholder="Kod pocztowy, Miasto"
                            maxLength={512}
                          />
                        ) : (
                          <div>{shopData.podmiot3.addressL2 || 'Brak adresu'}</div>
                        )}
                      </div>

                      <div className="shop-field">
                        <label>ID Wewnętrzny:</label>
                        {editingShop === shop ? (
                          <input
                            type="text"
                            value={shopData.podmiot3.idWew || ''}
                            onChange={(e) =>
                              changePodmiot3Field(shop, 'idWew', e.target.value)
                            }
                            placeholder="NIP-XXXXX (np. 8441866342-24001)"
                          />
                        ) : (
                          <div>{shopData.podmiot3.idWew || 'Brak ID'}</div>
                        )}
                      </div>
                    </>
                  )}
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

  .section-title {
    font-weight: bold;
    margin: 1rem 1rem 0.5rem 1rem;
    color: #333;
    font-size: 1.1rem;
  }

  .podmiot3-title {
    margin-top: 1.5rem;
    color: #5533cc;
    border-top: 2px solid #5533cc;
    padding-top: 1rem;
  }

  .shop-field {
    display: flex;
    flex-direction: column;
    width: 85%;
    background-color: #f6f6f6;
    margin: 0.5rem auto;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    box-shadow:
      0 2px 4px 0 rgba(0, 0, 0, 0.1),
      0 3px 10px 0 rgba(0, 0, 0, 0.1);

    label {
      font-weight: bold;
      margin-bottom: 0.3rem;
      color: #555;
      font-size: 0.9rem;
    }

    input,
    textarea {
      width: 95%;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 0.5rem;
      font-family: inherit;

      &:focus {
        border-color: #5533cc;
        outline: none;
      }
    }

    input[type='checkbox'] {
      width: auto;
      margin-right: 0.5rem;
    }

    div {
      color: #333;
      padding: 0.3rem 0;
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
