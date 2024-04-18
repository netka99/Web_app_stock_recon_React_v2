import React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import {
  Navbar,
  Sidebar,
  Footer,
  Spinner,
  AddShop,
  ShopItem,
} from '../components/index'

const pageTitle = 'Ustawienia - Sklepy'
const { VITE_APP_SETTINGS_API } = import.meta.env

const SettingsShopsPage = () => {
  const [dataAll, setDataAll] = useState(null)
  const [shops, setShops] = useState(null)
  const [messageText, setmessageText] = useState(false)

  const generateId = () => {
    return '_' + Math.random().toString(36).slice(2, 9)
  }

  useEffect(() => {
    fetchData(VITE_APP_SETTINGS_API)
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

  const handleMessage = (messageType) => {
    getMessageText(messageType)
    setmessageText(messageType)
    setTimeout(() => {
      setmessageText(false)
    }, 5000)
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

  const handleAddShop = (shopName) => {
    setShops([
      ...shops,
      {
        id: generateId(),
        name: shopName,
        isEditing: false,
      },
    ])
    handleMessage('added')
  }

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
    handleMessage('deleted')
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
    handleMessage('saved')
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
        VITE_APP_SETTINGS_API,
      )
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)
      if (response.status === 200) {
        console.log('data sent')
      } else {
        console.log('data not sent')
        handleMessage('error')
      }
    } catch (error) {
      console.error('Error saving shops:', error)
      handleMessage('error')
    }
  }

  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Container>
        <AddShop onAddShop={handleAddShop} />
        {messageText && (
          <div className="error-notification">
            {getMessageText(messageText)}
          </div>
        )}
        <div className="shopsListSettings">
          {shops ? (
            shops.map((shop) => (
              <ShopItem
                key={shop.id}
                id={shop.id}
                name={shop.name}
                isEditing={shop.isEditing}
                onToggleEdit={toggleEdit}
                onChange={handleChange}
                onSave={(id) => {
                  saveShop(id)
                  saveShopsOnApi()
                }}
                onDelete={handleDeleteShop}
              />
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
`

export default SettingsShopsPage
