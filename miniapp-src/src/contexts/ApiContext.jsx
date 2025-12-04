import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useTelegram } from './TelegramContext'

const ApiContext = createContext(null)

export const ApiProvider = ({ children }) => {
  const { user } = useTelegram()
  const [userToken, setUserToken] = useState(null)

  // Get user token from database when component mounts
  useEffect(() => {
    const fetchToken = async () => {
      if (user && user.id) {
        // Store user token - in real app, get from Telegram WebApp initData
        // For now, you need to set it manually or get from backend
        const token = localStorage.getItem('user_token')
        if (token) {
          setUserToken(token)
        }
      }
    }
    fetchToken()
  }, [user])

  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.request.use((config) => {
    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`
    }
    return config
  })

  const getUserInfo = async () => {
    try {
      if (!user) return { balance: 0, count_order: 0 }
      const response = await api.get(`/miniapp.php?actions=user_info&user_id=${user.id}`)
      return {
        wallet_balance: response.data.obj?.balance || 0,
        active_services: response.data.obj?.count_order || 0,
        total_purchases: response.data.obj?.count_payment || 0,
        user_id: user.id,
        ...response.data.obj
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      return { wallet_balance: 0, active_services: 0, total_purchases: 0 }
    }
  }

  const getServices = async (status = 'all', search = '') => {
    try {
      if (!user) return { services: [] }
      const params = new URLSearchParams({
        actions: 'service',
        user_id: user.id,
        page: 1,
        limit: 50
      })
      if (search) params.append('q', search)
      
      const response = await api.get(`/miniapp.php?${params}`)
      return {
        status: true,
        services: response.data.obj?.list || []
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      return { services: [] }
    }
  }

  const getCategories = async () => {
    try {
      if (!user) return { categories: [] }
      const response = await api.get(`/miniapp.php?actions=categories&user_id=${user.id}`)
      return {
        status: true,
        categories: response.data.obj?.list || []
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { categories: [] }
    }
  }

  const getProducts = async (categoryId = null) => {
    try {
      if (!user) return { products: [] }
      const params = new URLSearchParams({
        actions: 'services',
        user_id: user.id,
        page: 1,
        limit: 50
      })
      if (categoryId) params.append('category_id', categoryId)
      
      const response = await api.get(`/miniapp.php?${params}`)
      return {
        status: true,
        products: response.data.obj?.list || []
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return { products: [] }
    }
  }

  const buyService = async (productId, quantity = 1) => {
    try {
      const response = await api.post('/miniapp.php', {
        actions: 'purchase',
        user_id: user.id,
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
      // Note: renew might not exist in current API, using purchase instead
      const response = await api.post('/miniapp.php', {
        actions: 'purchase',
        user_id: user.id,
        product_id: productId,
        username: username
      })
      return response.data
    } catch (error) {
      console.error('Error renewing service:', error)
      throw error
    }
  }

  const getServiceDetail = async (username) => {
    try {
      if (!user) return null
      const response = await api.get(`/miniapp.php?actions=service&user_id=${user.id}&username=${username}`)
      const services = response.data.obj?.list || []
      return {
        status: true,
        service: services.length > 0 ? services[0] : null
      }
    } catch (error) {
      console.error('Error fetching service detail:', error)
      throw error
    }
  }

  const getSubscriptionLink = async (username) => {
    try {
      // This might need custom implementation
      return {
        success: true,
        link: `https://netpalpro.fastslow.eu.org/sub/${username}`
      }
    } catch (error) {
      console.error('Error getting subscription link:', error)
      throw error
    }
  }

  // Function to set user token (call this after user logs in)
  const setToken = (token) => {
    setUserToken(token)
    localStorage.setItem('user_token', token)
  }

  return (
    <ApiContext.Provider
      value={{
        getUserInfo,
        getServices,
        getServiceDetail,
        getProducts,
        getCategories,
        buyService,
        renewService,
        getSubscriptionLink,
        setToken,
        userToken
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
