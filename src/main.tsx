import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { CartProvider } from './lib/cart'
import { ToastProvider } from './lib/toast'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ToastProvider>
  </StrictMode>,
)
