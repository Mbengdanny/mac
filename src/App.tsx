import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { CartProvider } from './lib/cart'
import { ToastProvider } from './lib/toast'
import { useInstallPrompt } from './lib/useInstallPrompt'
import { bumpVisitor } from './lib/hooks'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Quote from './pages/Quote'
import Contact from './pages/Contact'
import Estuaire from './pages/Estuaire'
import Admin from './pages/Admin'
import Order from './pages/Order'

export default function App() {
  const install = useInstallPrompt()

  useEffect(() => { bumpVisitor() }, [])

  return (
    <ToastProvider>
      <CartProvider>
        <div className="has-bottom-nav col" style={{ minHeight: '100vh' }}>
          <Header onInstall={install.canInstall ? install.prompt : undefined} />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalog />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/devis" element={<Quote />} />
              <Route path="/commander" element={<Order />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/estuaire" element={<Estuaire />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  )
}
