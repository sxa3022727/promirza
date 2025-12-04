import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeUserToken } from './utils/auth'

const tg = window.Telegram?.WebApp

if (tg) {
  tg.ready()
  tg.expand()
  tg.enableClosingConfirmation()
  
  tg.setHeaderColor('#0f172a')
  tg.setBackgroundColor('#0f172a')
}

// Initialize user token
initializeUserToken()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
