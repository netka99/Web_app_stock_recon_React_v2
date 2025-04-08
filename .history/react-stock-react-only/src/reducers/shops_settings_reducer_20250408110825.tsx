export interface Shop {
  id: string
  name: string
  isEditing: boolean
}

interface State {
  shops: Shop[]
}

const actionTypes = {
  SET_SHOPS: 'SET_SHOPS',
  ADD_SHOP: 'ADD_SHOP',
  CHANGE_SHOP: 'CHANGE_SHOP',
  DELETE_SHOP: 'DELETE_SHOP',
  TOGGLE_EDIT: 'TOGGLE_EDIT',
  SAVE_SHOP: 'SAVE_SHOP',
}

type ActionTypes = (typeof actionTypes)[keyof typeof actionTypes]

type Action =
  | { type: typeof actionTypes.SET_SHOPS; payload: Shop[] }
  | { type: typeof actionTypes.ADD_SHOP; payload: { id: string; name: string } }
  | { type: typeof actionTypes.CHANGE_SHOP; payload: { id: string; name: string } }
  | { type: typeof actionTypes.DELETE_SHOP; payload: { id: string } }
  | { type: typeof actionTypes.TOGGLE_EDIT; payload: { id: string } }
  | { type: typeof actionTypes.SAVE_SHOP; payload: { id: string } }

const shopReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.SET_SHOPS:
      return { ...state, shops: action.payload }
    case actionTypes.ADD_SHOP: {
      return {
        ...state,
        shops: [
          ...state.shops,
          {
            id: action.payload.id,
            name: action.payload.name,
            isEditing: false,
          },
        ],
      }
    }
    case actionTypes.CHANGE_SHOP: {
      return {
        ...state,
        shops: state.shops.map((shop) =>
          shop.id === action.payload.id ? { ...shop, name: action.payload.name } : shop,
        ),
      }
    }
    case actionTypes.DELETE_SHOP: {
      return {
        ...state,
        shops: state.shops.filter((shop) => shop.id !== action.payload.id),
      }
    }
    case actionTypes.TOGGLE_EDIT: {
      return {
        ...state,
        shops: state.shops.map((shop) =>
          shop.id === action.payload.id
            ? {
                ...shop,
                isEditing: !shop.isEditing,
              }
            : shop,
        ),
      }
    }
    case actionTypes.SAVE_SHOP: {
      return {
        ...state,
        shops: state.shops.map((shop) =>
          shop.id === action.payload.id ? { ...shop, isEditing: false } : shop,
        ),
      }
    }
    default:
      return state
  }
}

export { actionTypes, shopReducer }
