import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: action.payload.user, // Use the complete user object from backend
        loading: false,
        error: null
      }
    case 'UPDATE_USER_DATA':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        ...initialState,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'AUTH_ERROR':
      localStorage.removeItem('token')
      return {
        ...initialState,
        loading: false,
        error: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        await checkAuth()
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    
    checkAuthStatus()
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await api.get('/auth/me')
      
      if (response.data.success) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user: response.data.user, 
            token: state.token 
          } 
        })
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message || 'Authentication failed' })
    }
  }, [state.token])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        })
        toast.success('Login successful!')
        return response.data
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        })
        toast.success('Registration successful!')
        return response.data
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully!')
  }

  const updateProfile = async (updatedData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await api.put('/auth/me', updatedData)
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_PROFILE_SUCCESS',
          payload: response.data
        })
        toast.success('Profile updated successfully!')
        return response.data
      } else {
        throw new Error(response.data.message || 'Profile update failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      toast.error(errorMessage)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateUserData = (updatedFields) => {
    dispatch({
      type: 'UPDATE_USER_DATA',
      payload: updatedFields
    })
  }

  const refreshUserData = async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER_DATA',
          payload: response.data.user
        })
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateUserData,
    refreshUserData,
    clearError,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}