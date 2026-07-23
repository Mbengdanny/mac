import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, MessageCircle, Phone, Check, ShoppingCart, Loader2 } from 'lucide-react'
import { useCart } from '../lib/cart'
import { supabase } from '../lib/supabase'
import { fcfa, greeting, nextQuoteNumber, paymentLabel } from '../lib/format'
import { generateQuotePDF } from '../lib/pdf'
import { useToast } from '../lib/toast'

const WHATSAPP_NUMBER = '242066819615' // Moov number for WhatsApp notifications / fee
const NOTIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-notify`

async function notifyAdmin(event: string, ref: string, name: string, phone: string) {
  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ event, ref, name, phone }),
    })
  } catch { /* non-blocking */ }
}

export default function Quote() {
  const cart = useCart()
  const nav = useNavigate()
  const toast = useToast()
  const [civility, setCivility] = useState<'Mr' | 'Mme'>('Mr')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [quoteNumber, setQuoteNumber] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('quotes').select('quote_number').then(({ data }) => {
      setQuoteNumber(nextQuoteNumber((data || []).map(r => r.quote_number)))
    })
  }, [])

  const total = cart.total

  const buildWhatsAppMessage = (qNum: string): string => {
    const lines = [
      `${greeting()} ${civility} ${name},`,
      `Voici votre devis pro forma N°${qNum}`,
      '',
      ...cart.items.map(i => `• ${i.name} — ${i.qty} ${i.unit} × ${fcfa(i.price)} = ${fcfa(i.price * i.qty)}`),
      '',
      `TOTAL : ${fcfa(total)}`,
      '',
      'Bloqué 30 jours.',
      'Livraison sous 24h.',
      'Service client 7j/7 : 076452070.',
      'Version certifiée avec tampon et RCCM, disponible bientôt.',
    ]
    return encodeURIComponent(lines.join('\n'))
  }

  const saveQuote = async (): Promise<string> => {
    const num = quoteNumber
    await supabase.from('quotes').insert({
      quote_number: num,
      civility,
      client_name: name,
      client_phone: phone,
      items: cart.items.map(({ name, unit, price, qty }) => ({ name, unit, price, qty })),
      total_fcfa: total,
      status: 'created',
    })
    setSaved(true)
    return num
  }

  const handleDownloadPDF = async () => {
    if (!name.trim()) { toast.show('Veuillez saisir votre nom'); return }
    setBusy(true)
    try {
      const num = await saveQuote()
      const doc = generateQuotePDF({ quoteNumber: num, civility, clientName: name, items: cart.items, total })
      doc.save(`Devis_${num}.pdf`)
      notifyAdmin('new_quote', num, name, phone)
      toast.show('Devis PDF téléchargé')
    } catch { toast.show('Erreur lors de la génération du PDF') }
    finally { setBusy(false) }
  }

  const handleWhatsApp = async () => {
    if (!name.trim()) { toast.show('Veuillez saisir votre nom'); return }
    setBusy(true)
    try {
      const num = await saveQuote()
      const msg = buildWhatsAppMessage(num)
      const feeNote = encodeURIComponent('\n\n_Frais de sauvegarde/téléchargement du devis PDF via WhatsApp : 50 FCFA._')
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}${feeNote}`, '_blank')
      notifyAdmin('new_quote', num, name, phone)
      toast.show('Devis envoyé sur WhatsApp — frais 50 FCFA')
    } catch { toast.show('Erreur') }
    finally { setBusy(false) }
  }

  const handleOrder = () => {
    if (!name.trim()) { toast.show('Veuillez saisir votre nom'); return }
    nav('/commander')
  }

  if (cart.items.length === 0) {
    return (
      <div className="container section">
        <div className="card text-center" style={{ padding: 48 }}>
          <FileText size={48} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <h2 className="h3">Aucun article pour un devis</h2>
          <p className="muted mt-8">Ajoutez d'abord des produits depuis le catalogue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h1 className="h2">Devis pro forma</h1>
      <p className="muted mt-8">N° {quoteNumber} — bloqué 30 jours — livraison sous 24h.</p>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 820 ? '1.3fr 0.7fr' : '1fr', gap: 24 }} className="mt-24">
        <div className="card">
          <h3 className="h3 mb-16">Vos informations</h3>
          <div className="field">
            <label className="label">Civilité</label>
            <div className="flex gap-8">
              {(['Mr', 'Mme'] as const).map(c => (
                <button key={c} className={`pill ${civility === c ? 'pill-green' : 'pill-muted'}`} style={{ cursor: 'pointer', border: 'none', padding: '10px 20px' }} onClick={() => setCivility(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="label">Nom complet</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Jean Mukendi" />
          </div>
          <div className="field">
            <label className="label">Téléphone (facultatif)</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex : 06XXXXXXXX" />
          </div>

          <h3 className="h3 mt-24 mb-16">Détail du devis</h3>
          <div className="col gap-8">
            {cart.items.map(it => (
              <div key={it.productId} className="between" style={{ fontSize: 14, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                <span>{it.name} <span className="muted">× {it.qty} {it.unit}</span></span>
                <span style={{ fontWeight: 600 }}>{fcfa(it.price * it.qty)}</span>
              </div>
            ))}
            <div className="between mt-8" style={{ fontWeight: 800, fontSize: 18 }}>
              <span>TOTAL</span><span style={{ color: 'var(--green)' }}>{fcfa(total)}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="h3">Actions</h3>
          <p className="muted mt-8" style={{ fontSize: 13.5 }}>Choisissez comment recevoir votre devis.</p>

          <div className="col gap-12 mt-24">
            <button className="btn btn-blue btn-block btn-lg" onClick={handleDownloadPDF} disabled={busy}>
              {busy ? <Loader2 className="spinner" /> : <><Download size={18} /> Télécharger le PDF</>}
            </button>
            <button className="btn btn-block btn-lg" style={{ background: '#25D366', color: '#fff' }} onClick={handleWhatsApp} disabled={busy}>
              <MessageCircle size={18} /> Envoyer sur WhatsApp
            </button>
            <button className="btn btn-yellow btn-block" onClick={handleOrder} disabled={busy}>
              <ShoppingCart size={18} /> Commander ces articles
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', margin: '20px 0' }} />
          <div className="col gap-8" style={{ fontSize: 13 }}>
            <p className="flex gap-8"><Check size={16} color="var(--green)" /> Devis bloqué 30 jours</p>
            <p className="flex gap-8"><Check size={16} color="var(--green)" /> Livraison sous 24h</p>
            <p className="flex gap-8"><Check size={16} color="var(--green)" /> Service client 7j/7 — 076452070</p>
            <p className="flex gap-8"><Check size={16} color="var(--green)" /> Version certifiée tampon/RCCM bientôt</p>
            <p className="muted" style={{ fontSize: 12.5 }}>Sauvegarde/téléchargement du devis PDF via WhatsApp : <strong>50 FCFA</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
