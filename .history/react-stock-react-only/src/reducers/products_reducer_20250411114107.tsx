import { SIDEBAR_OPEN, SIDEBAR_CLOSE, ProductsAction } from '../actions.tsx'

interface ProductsState {
  isSidebarOpen: boolean
  isSidebarOpen: boolean
}

const products_reducer = (
  state: ProductsState,
  action: ProductsAction,
): ProductsState => {
  if (action.type === SIDEBAR_OPEN) {
    return { ...state, isSidebarOpen: true }
  }
  if (action.type === SIDEBAR_CLOSE) {
    return { ...state, isSidebarOpen: false }
  }
  return state
}

export default products_reducer
