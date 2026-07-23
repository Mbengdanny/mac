import { Link, NavLink } from 'react-router-dom'
import { Home, Package, FileText, Phone, ShoppingCart, Menu, X, Download, MapPin } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'
import { useCart } from '../lib/cart'

const navItems = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/catalogue', label: 'Produits', icon: Package },
  { to: '/devis', label: 'Devis', icon: FileText },
  { to: '/estuaire', label: 'Estuaire', icon: MapPin },
  { to: '/contact', label: 'Service client', icon: Phone },
]

export default function Header({ onInstall }: { onInstall?: () => void }) {
  const [open, setOpen] = useState(false)
  const cart = useCart()

  return (
    <>
      <header className="site-header">
        <div className="container between" style={{ height: 64 }}>
          <Link to="/" onClick={() => setOpen(false)}><Logo size={22} tagline /></Link>

          <nav className="nav-desktop">
            {navItems.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex gap-12" style={{ alignItems: 'center' }}>
            {onInstall && <button className="btn btn-ghost btn-sm nav-desktop" onClick={onInstall}><Download size={16} /> Installer</button>}
            <Link to="/panier" className="center cart-icon">
              <ShoppingCart size={20} />
              {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
            </Link>
            <button onClick={() => setOpen(!open)} className="btn btn-ghost btn-sm menu-btn">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div style={{ borderTop: '1px solid var(--line)', padding: '12px 20px' }} className="col gap-8 mobile-only">
            {navItems.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setOpen(false)}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, color: isActive ? 'var(--green)' : 'var(--ink-soft)', padding: '4px 0' })}>
                <n.icon size={18} /> {n.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <nav className="bottom-nav" style={{ justifyContent: 'space-around' }}>
        {navItems.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <n.icon size={20} /> {n.label}
          </NavLink>
        ))}
        <NavLink to="/panier" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingCart size={20} /> Panier
        </NavLink>
      </nav>
    </>
  )
}
