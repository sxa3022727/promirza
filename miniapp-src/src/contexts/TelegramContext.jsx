import { createContext, useContext, useEffect, useState } from 'react'

const TelegramContext = createContext(null)

export const TelegramProvider = ({ children }) => {
  const [webApp, setWebApp] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    
    if (tg) {
      setWebApp(tg)
      setUser(tg.initDataUnsafe?.user || null)
      
      tg.ready()
      tg.expand()
    }
  }, [])

  const showAlert = (message) => {
    if (webApp) {
      webApp.showAlert(message)
    } else {
      alert(message)
    }
  }

  const showConfirm = (message, callback) => {
    if (webApp) {
      webApp.showConfirm(message, callback)
    } else {
      const result = window.confirm(message)
      callback(result)
    }
  }

  const hapticFeedback = (type = 'medium') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(type)
    }
  }

  const showMainButton = (text, onClick) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text)
      webApp.MainButton.show()
      webApp.MainButton.onClick(onClick)
      webApp.MainButton.enable()
    }
  }

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide()
    }
  }

  const showBackButton = (onClick) => {
    if (webApp?.BackButton) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(onClick)
    }
  }

  const hideBackButton = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide()
    }
  }

  const close = () => {
    if (webApp) {
      webApp.close()
    }
  }

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user,
        showAlert,
        showConfirm,
        hapticFeedback,
        showMainButton,
        hideMainButton,
        showBackButton,
        hideBackButton,
        close
      }}
    >
      {children}
    </TelegramContext.Provider>
  )
}

export const useTelegram = () => {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}
