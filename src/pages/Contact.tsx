import { useState } from 'react'
import { Phone, Mail, MapPin, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setError(null)
    if (!phone.trim()) { setError('Veuillez entrer votre numéro.'); return }
    const { error: err } = await supabase.from('subscribers').upsert({ name: name || null, phone })
    if (err) { setError("Erreur lors de l'inscription."); return }
    setSent(true)
    setName('')
    setPhone('')
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 720 }}>
      <h1 className="h1">Contactez-nous</h1>
      <p className="lead mt-8">Une question ? Inscrivez-vous pour recevoir nos offres et actualités.</p>

      <div className="grid grid-2 mt-24">
        <div className="card">
          <h3 className="h3">S'abonner aux offres</h3>
          <p className="muted mt-8" style={{ fontSize: 14 }}>Recevez nos nouveautés et promotions par téléphone.</p>
          <div className="form-group mt-16">
            <label className="form-label">Votre nom</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone *</label>
            <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="074 XX XX XX" />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600 }}>{error}</p>}
          {sent && <p style={{ color: 'var(--green)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={16} /> Inscription réussie !</p>}
          <button className="btn btn-primary mt-16" onClick={handleSubscribe}>S'abonner</button>
        </div>

        <div className="card">
          <h3 className="h3">Nos coordonnées</h3>
          <div className="col gap-16 mt-16">
            <div className="flex gap-12" style={{ alignItems: 'center' }}>
              <div className="center" style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-light)', color: 'var(--green)', flexShrink: 0 }}>
                <Phone size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Téléphone</div>
                <div className="muted" style={{ fontSize: 14 }}>074 XX XX XX</div>
              </div>
            </div>
            <div className="flex gap-12" style={{ alignItems: 'center' }}>
              <div className="center" style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--blue-light)', color: 'var(--blue)', flexShrink: 0 }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Email</div>
                <div className="muted" style={{ fontSize: 14 }}>contact@vldmac.ga</div>
              </div>
            </div>
            <div className="flex gap-12" style={{ alignItems: 'center' }}>
              <div className="center" style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--yellow-light)', color: 'var(--yellow-dark)', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Adresse</div>
                <div className="muted" style={{ fontSize: 14 }}>Owendo, Akanda, Libreville — Estuaire, Gabon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
