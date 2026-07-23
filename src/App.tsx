import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, TreePine, GraduationCap } from 'lucide-react'
import Eleves from './pages/Eleves'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const loc = useLocation()

  const links = [
    { to: '/eleves', label: 'Eleves', end: false },
  ]

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <Link to="/eleves" className="logo" onClick={() => setMenuOpen(false)}>
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
              <GraduationCap size={16} style={{ display: 'inline', marginRight: 6 }} />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-bottom">
          <p>Services VLDMAC — Tous droits reserves.</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Eleves />} />
            <Route path="/eleves" element={<Eleves />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
