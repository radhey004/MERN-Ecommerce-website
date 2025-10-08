import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'
import { toast } from 'react-toastify'

const CartContext = createContext()

// Reducer for cart state
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload?.items || [],
        loading: false,
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        loading: false,
      }

    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
  })

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [isAuthenticated])

  // Fetch cart items
  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.get('/cart')
      dispatch({ type: 'SET_CART', payload: response.data })
    } catch (error) {
      console.error('Error fetching cart:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart/add', { productId, quantity })
      dispatch({ type: 'SET_CART', payload: response.data.cart })
      toast.success('Item added to cart!')
      return response.data.cart
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart')
      throw error
    }
  }

  // Update cart item
  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${productId}`, { quantity })
      dispatch({ type: 'SET_CART', payload: response.data.cart })
      toast.success('Cart updated!')
      return response.data.cart
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart')
      throw error
    }
  }

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`)
      dispatch({ type: 'SET_CART', payload: response.data.cart })
      toast.success('Item removed from cart!')
      return response.data.cart
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item from cart')
      throw error
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    try {
      await api.delete('/cart/clear')
      dispatch({ type: 'CLEAR_CART' })
      toast.success('Cart cleared!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear cart')
      throw error
    }
  }

  // Get cart total price
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.product?.price * item.quantity || 0)
    }, 0)
  }

  // Get total item count in cart
  const getCartCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
