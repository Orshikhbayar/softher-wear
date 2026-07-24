import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { CartProvider } from './context/CartContext'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <App />
      </CartProvider>
    </MotionConfig>
  </React.StrictMode>,
)
