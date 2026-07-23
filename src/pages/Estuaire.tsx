import { useEffect, useState } from 'react'
import { Eye, Users, Truck, MapPin, FileText, ShoppingCart, Check, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteImage, getStat, useAnnouncements } from '../lib/hooks'
import { supabase } from '../lib/supabase'

export default function Estuaire() {
  const img = useSiteImage('estuaire')
  const ann = useAnnouncements()
  const [visitors, setVisitors] = useState(0)
  const [subs, setSubs] = useState(0)

  useEffect(() => {
    getStat('visitors').then(setVisitors)
    supabase.from('subscribers').select('*', { count: 'exact', head: true }).then(({ count }) => setSubs(count || 0))
  }, [])

  return (
    <div>
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container" style={{ paddingTop: 48, display: 'grid', gridTemplateColumns: window.innerWidth > 820 ? '1fr 1fr' : '1fr', gap: 32, alignItems: 'center' }}>
          <div className="fade-up">
            <span className="pill pill-blue"><MapPin size={14} /> Province de l'Estuaire</span>
            <h1 className="h1 mt-16" style={{ fontFamily: 'var(--font-arial)' }}>
              Votre espace <span style={{ color: 'var(--green)' }}>Estuaire</span>
            </h1>
            <p className="lead mt-16" style={{ fontFamily: 'var(--font-arial)' }}>
              Devis et commandes de matériaux de construction, livraison rapide dans toute la province de l'Estuaire.
            </p>
            <div className="flex gap-12 mt-24" style={{ flexWrap: 'wrap' }}>
              <Link to="/devis" className="btn btn-primary btn-lg"><FileText size={18} /> Faire un devis</Link>
              <Link to="/catalogue" className="btn btn-blue btn-lg"><ShoppingCart size={18} /> Commander</Link>
            </div>
            <div className="flex gap-24 mt-24">
              <CountBox icon={<Eye size={18} />} value={visitors} label="Visiteurs" color="var(--blue)" />
              <CountBox icon={<Users size={18} />} value={subs} label="Abonnés" color="var(--green)" />
            </div>
          </div>
          <div className="fade-up" style={{ animationDelay: '.1s' }}>
            <div className="hero-img-wrap">
              {img
                ? <img src={img} alt="Province de l'Estuaire" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                : <div className="hero-img-placeholder"><MapPin size={40} /><p style={{ fontSize: 14, textAlign: 'center' }}>Image de l'espace Estuaire<br />(téléversée depuis l'admin)</p></div>}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery rules — Estuaire only */}
      <section className="container section-tight">
        <div className="card" style={{ borderLeft: '4px solid var(--green)' }}>
          <h3 className="flex gap-8" style={{ alignItems: 'center', marginBottom: 12 }}><Truck size={18} color="var(--green)" /> Règles de livraison — Province de l'Estuaire</h3>
          <div className="col gap-8" style={{ fontSize: 14.5 }}>
            <p className="flex gap-8"><Check size={16} color="var(--green)" /> Livraison <strong>offerte à partir de 65 pièces</strong> commandées.</p>
            <p className="flex gap-8"><Check size={16} color="var(--green)" /> En dessous de 65 pièces : frais de transport de <strong>10 000 FCFA</strong>.</p>
            <p className="flex gap-8"><Check size={16} color="var(--green)" /> Livraison sous <strong>24h</strong>.</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Les prix et conditions de livraison ne sont valables que pour le chef-lieu de la province de l'Estuaire.</p>
          </div>
        </div>
      </section>

      {ann.length > 0 && (
        <section className="container section-tight">
          <div className="card" style={{ borderLeft: '4px solid var(--yellow)' }}>
            <h3 className="flex gap-8" style={{ alignItems: 'center', marginBottom: 14 }}><Bell size={18} color="var(--yellow-dark)" /> Annonces de l'Estuaire</h3>
            <div className="col gap-12">
              {ann.map(a => (
                <div key={a.id}>
                  <strong style={{ fontSize: 15 }}>{a.title}</strong>
                  <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container section">
        <div className="grid grid-2">
          <Link to="/devis" className="card-soft quick-action">
            <div className="flex between"><div><h3 className="h3">Faire un devis</h3><p className="muted mt-8">Pro forma en quelques clics.</p></div><FileText size={24} color="var(--blue)" /></div>
          </Link>
          <Link to="/catalogue" className="card-soft quick-action">
            <div className="flex between"><div><h3 className="h3">Lancer une commande</h3><p className="muted mt-8">Matériaux livrés dans l'Estuaire.</p></div><ShoppingCart size={24} color="var(--green)" /></div>
          </Link>
        </div>
      </section>
    </div>
  )
}

function CountBox({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className="flex gap-8" style={{ alignItems: 'center' }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{value.toLocaleString('fr-FR')}</div>
        <div className="muted" style={{ fontSize: 12.5 }}>{label}</div>
      </div>
    </div>
  )
}
