import React from 'react'
import { useState, useEffect, useReducer, useRef } from 'react'
import styled from 'styled-components'
import { fetchData, updateDataOnApi } from '../api/fetchAPI'
import { actionTypes, shopReducer } from '../reducers/shops_settings_reducer'
import { Navbar, Sidebar, Footer, Spinner, AddShop, ShopItem } from '../components/index'
import { size } from '../styles/devices'
import useTemporaryMessage from '../hooks/useTemporaryMessage'

const pageTitle = 'Ustawienia - Sklepy'
const { VITE_APP_SETTINGS_API } = import.meta.env

const SettingsShopsPage = () => {
  const initialShopsState = {
    shops: null,
  }
  const [dataAll, setDataAll] = useState(null)
  const [messageText, showMessage] = useTemporaryMessage()
  const [state, dispatch] = useReducer(shopReducer, initialShopsState)

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
        dispatch({
          type: actionTypes.SET_SHOPS,
          payload: shopsData,
        })
      })
      .catch((error) => console.error('Error fetching data:', error))
  }, [])

  useEffect(() => {
    if (state.shops) {
      saveShopsOnApi()
    }
  }, [state.shops])

  const handleAddShop = (shopName) => {
    dispatch({
      type: actionTypes.ADD_SHOP,
      payload: {
        id: generateId(),
        name: shopName,
      },
    })
    saveShopsOnApi()
    showMessage('Sklep został dodany!', 4000)
  }

  const handleChange = (e, id) => {
    const { value } = e.target
    dispatch({
      type: actionTypes.CHANGE_SHOP,
      payload: { id, name: value },
    })
  }

  const handleDeleteShop = (id) => {
    dispatch({
      type: actionTypes.DELETE_SHOP,
      payload: { id },
    })
    showMessage('Sklep został skasowany!', 4000)
  }

  const toggleEdit = (id) => {
    dispatch({
      type: actionTypes.TOGGLE_EDIT,
      payload: { id },
    })
  }

  const saveShop = (id) => {
    dispatch({
      type: actionTypes.SAVE_SHOP,
      payload: { id },
    })
    showMessage('Nowa nazwa sklepu została zapisana!', 4000)
  }

  const saveShopsOnApi = async () => {
    try {
      const updatedShops = state.shops.map((shop) => shop.name)
      const updatedData = {
        shops: updatedShops,
        prices: dataAll.prices,
        address: dataAll.address,
      }
      const response = await updateDataOnApi(updatedData, VITE_APP_SETTINGS_API, 'PUT')
      if (response.status === 200) {
        showMessage('Sklep został zapisany!', 4000)
      } else {
        showMessage('Dane nie zostały pobrane lub zapisane!', 4000)
      }
    } catch (error) {
      console.error('Error saving shops:', error)
      showMessage('Dane nie zostały pobrane lub zapisane!', 4000)
    }
  }

  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Container>
        <AddShop onAddShop={handleAddShop} />
        {messageText && <div className="error-notification">{messageText}</div>}
        <div className="shopsListSettings">
          {state.shops ? (
            state.shops.map((shop) => (
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
  max-width: 100vw;

  @media screen and (max-width: ${size.mobileL}) {
    margin-top: 5rem;
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
    margin: 0 auto;
  }
`

export default SettingsShopsPage
