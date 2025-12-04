import { createContext, useContext } from 'react'
import axios from 'axios'
import { useTelegram } from './TelegramContext'

const ApiContext = createContext(null)

export const ApiProvider = ({ children }) => {
  const { user } = useTelegram()

  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.request.use((config) => {
    if (user) {
      config.headers['X-Telegram-User-Id'] = user.id
    }
    return config
  })

  const getServices = async (status = 'all', search = '') => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'getServices',
        status,
        search
      })
      return response.data
    } catch (error) {
      console.error('Error fetching services:', error)
      throw error
    }
  }

  const getServiceDetail = async (username) => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'getServiceDetail',
        username
      })
      return response.data
    } catch (error) {
      console.error('Error fetching service detail:', error)
      throw error
    }
  }

  const getProducts = async (categoryId = null) => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'getProducts',
        category_id: categoryId
      })
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  const buyService = async (productId, quantity = 1) => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'buyService',
        product_id: productId,
        quantity
      })
      return response.data
    } catch (error) {
      console.error('Error buying service:', error)
      throw error
    }
  }

  const renewService = async (username, productId) => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'renew',
        username,
        product_id: productId
      })
      return response.data
    } catch (error) {
      console.error('Error renewing service:', error)
      throw error
    }
  }

  const getSubscriptionLink = async (username) => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'getSubscriptionLink',
        username
      })
      return response.data
    } catch (error) {
      console.error('Error getting subscription link:', error)
      throw error
    }
  }

  const getUserInfo = async () => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'getUserInfo'
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw error
    }
  }

  const getCategories = async () => {
    try {
      const response = await api.post('/miniapp.php', {
        action: 'getCategories'
      })
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  return (
    <ApiContext.Provider
      value={{
        getServices,
        getServiceDetail,
        getProducts,
        buyService,
        renewService,
        getSubscriptionLink,
        getUserInfo,
        getCategories
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within ApiProvider')
  }
  return context
}
