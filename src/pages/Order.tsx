import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Check, Loader2, Truck, Phone } from 'lucide-react'
import { useCart } from '../lib/cart'
import { supabase } from '../lib/supabase'
import { fcfa, nextOrderNumber } from '../lib/format'
import { useToast } from '../lib/toast'

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

export default function Order() {
  const cart = useCart()
  const nav = useNavigate()
  const toast = useToast()
  const [civility, setCivility] = useState<'Mr' | 'Mme'>('Mr')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState<'airtel' | 'moov' | 'livraison'>('livraison')
  const [orderNumber, setOrderNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.from('orders').select('order_number').then(({ data }) => {
      setOrderNumber(nextOrderNumber((data || []).map(r => r.order_number)))
    })
  }, [])

  const deliveryFree = cart.count >= 65
  const deliveryFee = deliveryFree ? 0 : 10000
  const grandTotal = cart.total + deliveryFee

  const submit = async () => {
    if (!name.trim()) { toast.show('Veuillez saisir votre nom'); return }
    if (!phone.trim()) { toast.show('Veuillez saisir votre téléphone'); return }
    if (!address.trim()) { toast.show('Veuillez saisir l\'adresse de livraison'); return }
    setBusy(true)
    try {
      const num = orderNumber
      await supabase.from('orders').insert({
        order_number: num,
        civility,
        client_name: name,
        client_phone: phone,
        delivery_address: address,
        items: cart.items.map(({ name, unit, price, qty }) => ({ name, unit, price, qty })),
        total_fcfa: cart.total,
        delivery_fee_fcfa: deliveryFee,
        payment_method: payment,
        status: 'pending',
      })
      cart.clear()
      setDone(true)
      notifyAdmin('new_order', num, name, phone)
      toast.show('Commande enregistrée !')
    } catch { toast.show('Erreur lors de l\'enregistrement') }
    finally { setBusy(false) }
  }

  if (cart.items.length === 0 && !done) {
    return (
      <div className="container section">
        <div className="card text-center" style={{ padding: 48 }}>
          <ShoppingCart size={48} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <h2 className="h3">Panier vide</h2>
          <p className="muted mt-8">Ajoutez des produits avant de commander.</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="container section">
        <div className="card text-center" style={{ padding: 48, maxWidth: 500, margin: '0 auto' }}>
          <div className="center" style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: 'var(--green)', margin: '0 auto 16px' }}><Check size={32} /></div>
          <h2 className="h2">Commande confirmée !</h2>
          <p className="muted mt-8">Votre commande <strong>{orderNumber}</strong> a été enregistrée. Notre service client vous contactera sous 24h.</p>
          <div className="col gap-12 mt-24" style={{ maxWidth: 320, margin: '24px auto 0' }}>
            <a href="tel:076452070" className="btn btn-primary btn-block"><Phone size={18} /> Appeler le service client</a>
            <button className="btn btn-ghost btn-block" onClick={() => nav('/')}>Retour à l'accueil</button>
          </div>
        </div>
      </div>
    )
  }

  const payments: { id: 'airtel' | 'moov' | 'livraison'; label: string; detail: string }[] = [
    { id: 'airtel', label: 'Airtel Money', detail: '076452070' },
    { id: 'moov', label: 'Moov Money', detail: '066819615' },
    { id: 'livraison', label: 'Paiement à la livraison', detail: 'Payez à réception' },
  ]

  return (
    <div className="container section">
      <h1 className="h2">Passer commande</h1>
      <p className="muted mt-8">N° {orderNumber} — livraison dans la province de l'Estuaire.</p>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 820 ? '1.3fr 0.7fr' : '1fr', gap: 24 }} className="mt-24">
        <div className="card">
          <h3 className="h3 mb-16">Informations de livraison</h3>
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
            <label className="label">Téléphone</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex : 06XXXXXXXX" />
          </div>
          <div className="field">
            <label className="label">Adresse de livraison</label>
            <textarea className="textarea" value={address} onChange={e => setAddress(e.target.value)} placeholder="Quartier, repère, ville (Owendo, Akanda ou Libreville)" />
          </div>

          <h3 className="h3 mt-24 mb-16">Mode de paiement</h3>
          <div className="col gap-12">
            {payments.map(p => (
              <button key={p.id} className="card-soft" style={{ textAlign: 'left', cursor: 'pointer', border: payment === p.id ? '2px solid var(--green)' : '1px solid var(--line)' }} onClick={() => setPayment(p.id)}>
                <div className="between">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.label}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{p.detail}</div>
                  </div>
                  {payment === p.id && <Check size={20} color="var(--green)" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 80 }}>
          <h3 className="h3">Récapitulatif</h3>
          <div className="col gap-8 mt-16">
            {cart.items.map(it => (
              <div key={it.productId} className="between" style={{ fontSize: 13.5 }}>
                <span>{it.name} <span className="muted">× {it.qty}</span></span>
                <span>{fcfa(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--line)', margin: '16px 0' }} />
          <div className="between" style={{ fontSize: 14 }}><span className="muted">Sous-total</span><span>{fcfa(cart.total)}</span></div>
          <div className="between mt-8" style={{ fontSize: 14 }}>
            <span className="muted flex gap-8"><Truck size={15} /> Livraison</span>
            <span style={{ fontWeight: 700, color: deliveryFree ? 'var(--green)' : 'var(--ink)' }}>{deliveryFree ? 'Offerte' : fcfa(deliveryFee)}</span>
          </div>
          {!deliveryFree && <p className="muted mt-8" style={{ fontSize: 12 }}>Offerte dès 65 pièces. Encours : {cart.count}/65.</p>}
          <div style={{ borderTop: '1px solid var(--line)', margin: '16px 0' }} />
          <div className="between"><span style={{ fontWeight: 700 }}>Total</span><span style={{ fontWeight: 800, fontSize: 20, color: 'var(--green)' }}>{fcfa(grandTotal)}</span></div>

          <button className="btn btn-primary btn-block btn-lg mt-24" onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="spinner" /> : <><Check size={18} /> Confirmer la commande</>}
          </button>
          <p className="muted mt-16" style={{ fontSize: 12 }}>Livraison sous 24h — prix valables pour Owendo, Akanda et Libreville.</p>
        </div>
      </div>
    </div>
  )
}
