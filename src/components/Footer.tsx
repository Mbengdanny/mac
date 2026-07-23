import { Link } from 'react-router-dom'
import { Phone, MessageCircle, MapPin } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: '#cbd5e1', padding: '48px 0 32px', marginTop: 40 }} className="has-bottom-nav">
      <div className="container">
        <div className="grid grid-4" style={{ gap: 32 }}>
          <div>
            <Logo size={22} />
            <p className="mt-16" style={{ fontSize: 14, lineHeight: 1.6, color: '#94a3b8' }}>
              Devis et commandes de matériaux de construction en quelques clics. Livraison dans la province de l'Estuaire.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 12 }}>Navigation</h4>
            <ul className="col gap-8" style={{ listStyle: 'none', fontSize: 14 }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Accueil</Link></li>
              <li><Link to="/catalogue" style={{ color: '#94a3b8' }}>Produits</Link></li>
              <li><Link to="/devis" style={{ color: '#94a3b8' }}>Devis</Link></li>
              <li><Link to="/estuaire" style={{ color: '#94a3b8' }}>Province de l'Estuaire</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 12 }}>Paiement</h4>
            <ul className="col gap-8" style={{ listStyle: 'none', fontSize: 14, color: '#94a3b8' }}>
              <li>Airtel Money — 076452070</li>
              <li>Moov Money — 066819615</li>
              <li>Paiement à la livraison</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 12 }}>Contact</h4>
            <ul className="col gap-8" style={{ listStyle: 'none', fontSize: 14, color: '#94a3b8' }}>
              <li className="flex gap-8"><Phone size={15} /> 076452070</li>
              <li className="flex gap-8"><MapPin size={15} /> Province de l'Estuaire</li>
              <li><Link to="/contact" style={{ color: '#94a3b8' }}>Service client 7j/7</Link></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', marginTop: 32, paddingTop: 20, fontSize: 13, color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>© {new Date().getFullYear()} Services VLDMAC — Tous droits réservés.</span>
          <span>Version certifiée avec tampon et RCCM, disponible bientôt.</span>
        </div>
      </div>
    </footer>
  )
}
