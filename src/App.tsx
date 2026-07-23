import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, TreePine } from 'lucide-react'
import { CartProvider, useCart } from './lib/cart'
import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import Devis from './pages/Devis'
import Panier from './pages/Panier'
import Contact from './pages/Contact'
import Estuaire from './pages/Estuaire'
import Admin from './pages/Admin'

function Header() {
  const cart = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const loc = useLocation()

  const links = [
    { to: '/', label: 'Accueil', end: true },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/devis', label: 'Devis' },
    { to: '/estuaire', label: 'Estuaire' },
    { to: '/contact', label: 'Contact' },
    { to: '/admin', label: 'Gestion' },
  ]

  const cartLink = { to: '/panier', label: 'Panier' }

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <TreePine size={24} color="var(--green)" /> VLDMAC
        </Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={`nav-link ${loc.pathname === l.to ? 'active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to={cartLink.to} className="nav-link" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="cart-badge">
              <ShoppingCart size={18} />
              {cartLink.label}
              {cart.count > 0 && <span className="cart-count">{cart.count}</span>}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ color: '#fff' }}>
              <TreePine size={24} color="var(--green)" /> VLDMAC
            </div>
            <p style={{ fontSize: 14, marginTop: 12, color: 'var(--gray-400)' }}>
              Services VLDMAC — Devis et commandes de matériaux de construction. Simple, rapide, fiable.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Navigation</h4>
            <div className="col gap-8" style={{ fontSize: 14 }}>
              <Link to="/">Accueil</Link>
              <Link to="/catalogue">Catalogue</Link>
              <Link to="/devis">Devis</Link>
              <Link to="/estuaire">Estuaire</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Contact</h4>
            <div className="col gap-8" style={{ fontSize: 14 }}>
              <span>Owendo, Akanda, Libreville</span>
              <span>Estuaire, Gabon</span>
              <Link to="/contact">Nous contacter</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Services VLDMAC — Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/devis" element={<Devis />} />
              <Route path="/panier" element={<Panier />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/estuaire" element={<Estuaire />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}
