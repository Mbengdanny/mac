import { Phone, MessageCircle, Clock, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../lib/toast'

const NOTIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-notify`

export default function Contact() {
  const toast = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const subscribe = async () => {
    if (!phone.trim()) { toast.show('Saisissez votre numéro'); return }
    setBusy(true)
    try {
      await supabase.from('subscribers').insert({ name: name || null, phone })
      try {
        await fetch(NOTIFY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ event: 'new_subscriber', ref: '-', name: name || 'Anonyme', phone }),
        })
      } catch { /* non-blocking */ }
      setName(''); setPhone(''); setMsg('')
      toast.show('Merci ! Vous êtes maintenant abonné aux notifications.')
    } catch { toast.show('Erreur, réessayez') }
    finally { setBusy(false) }
  }

  const waLink = `https://wa.me/242076452070?text=${encodeURIComponent('Bonjour Services VLDMAC, j\'ai besoin d\'assistance.')}`

  return (
    <div className="container section">
      <h1 className="h2">Service client</h1>
      <p className="muted mt-8">Disponible 7j/7 pour vous accompagner dans vos devis et commandes.</p>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 820 ? '1fr 1fr' : '1fr', gap: 24 }} className="mt-24">
        <div className="card">
          <h3 className="h3 mb-16">Nous contacter</h3>
          <div className="col gap-16">
            <a href="tel:076452070" className="card-soft flex gap-12" style={{ alignItems: 'center' }}>
              <span className="center" style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: 'var(--green)' }}><Phone size={20} /></span>
              <div><div style={{ fontWeight: 700 }}>Téléphone</div><div className="muted" style={{ fontSize: 13.5 }}>076452070 — 7j/7</div></div>
            </a>
            <a href={waLink} target="_blank" rel="noreferrer" className="card-soft flex gap-12" style={{ alignItems: 'center' }}>
              <span className="center" style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#25D366' }}><MessageCircle size={20} /></span>
              <div><div style={{ fontWeight: 700 }}>WhatsApp</div><div className="muted" style={{ fontSize: 13.5 }}>Discuter en direct</div></div>
            </a>
            <div className="card-soft flex gap-12" style={{ alignItems: 'center' }}>
              <span className="center" style={{ width: 44, height: 44, borderRadius: 12, background: '#dbeafe', color: 'var(--blue)' }}><Clock size={20} /></span>
              <div><div style={{ fontWeight: 700 }}>Horaires</div><div className="muted" style={{ fontSize: 13.5 }}>Tous les jours, 7j/7</div></div>
            </div>
            <div className="card-soft flex gap-12" style={{ alignItems: 'center' }}>
              <span className="center" style={{ width: 44, height: 44, borderRadius: 12, background: '#fef9c3', color: 'var(--yellow-dark)' }}><MapPin size={20} /></span>
              <div><div style={{ fontWeight: 700 }}>Zone</div><div className="muted" style={{ fontSize: 13.5 }}>Owendo, Akanda et Libreville</div></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="h3 mb-8">S'abonner aux notifications</h3>
          <p className="muted mb-16" style={{ fontSize: 13.5 }}>Recevez les changements de prix et mises à jour de l'application.</p>
          <div className="field">
            <label className="label">Votre nom (facultatif)</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Jean" />
          </div>
          <div className="field">
            <label className="label">Téléphone</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex : 06XXXXXXXX" />
          </div>
          <div className="field">
            <label className="label">Message (facultatif)</label>
            <textarea className="textarea" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Votre demande…" />
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={subscribe} disabled={busy}>
            <Send size={18} /> S'abonner
          </button>
        </div>
      </div>
    </div>
  )
}
