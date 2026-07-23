import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, Check, Truck } from 'lucide-react'
import { useCart } from '../lib/cart'
import { supabase } from '../lib/supabase'

export default function Panier() {
  const cart = useCart()
  const [civility, setCivility] = useState('Mr')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('livraison')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deliveryFee = cart.count >= 65 ? 0 : 2000
  const grandTotal = cart.total + deliveryFee

  const handleSubmit = async () => {
    setError(null)
    if (!clientName.trim()) { setError('Veuillez entrer votre nom.'); return }
    if (!deliveryAddress.trim()) { setError('Veuillez entrer votre adresse de livraison.'); return }
    if (cart.items.length === 0) { setError('Votre panier est vide.'); return }

    const orderNumber = `CMD-${Date.now().toString().slice(-6)}`
    const { error: err } = await supabase.from('orders').insert({
      order_number: orderNumber,
      civility,
      client_name: clientName,
      client_phone: clientPhone || null,
      delivery_address: deliveryAddress,
      items: cart.items.map(i => ({ id: i.id, name: i.name, unit: i.unit, price: i.qty >= 10 ? i.price_gros_fcfa : i.price_fcfa, qty: i.qty })),
      total_fcfa: cart.total,
      delivery_fee_fcfa: deliveryFee,
      payment_method: paymentMethod,
      status: 'pending',
    })

    if (err) { setError('Erreur lors de la création de la commande.'); return }
    setSubmitted(orderNumber)
    cart.clear()
  }

  if (submitted) {
    return (
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48, maxWidth: 600 }}>
        <div className="card fade-up" style={{ textAlign: 'center' }}>
          <div className="center" style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--green-light)', color: 'var(--green)', margin: '0 auto 16px' }}>
            <Check size={32} />
          </div>
          <h1 className="h2">Commande passée !</h1>
          <p className="lead mt-8">Votre numéro de commande : <strong>{submitted}</strong></p>
          <p className="muted mt-8">Nous vous contacterons pour confirmer la livraison.</p>
          <a href="/" className="btn btn-primary mt-24">Retour à l'accueil</a>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48, maxWidth: 600, textAlign: 'center' }}>
        <div className="center" style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-400)', margin: '0 auto 16px' }}>
          <ShoppingCart size={32} />
        </div>
        <h1 className="h2">Votre panier est vide</h1>
        <p className="lead mt-8">Ajoutez des produits depuis le catalogue.</p>
        <a href="/catalogue" className="btn btn-primary mt-24">Voir le catalogue</a>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 800 }}>
      <h1 className="h1">Votre panier</h1>

      <div className="col gap-12 mt-24">
        {cart.items.map(i => {
          const unitPrice = i.qty >= 10 ? i.price_gros_fcfa : i.price_fcfa
          return (
            <div key={i.id} className="card flex gap-12" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <strong>{i.name}</strong>
                <div className="muted" style={{ fontSize: 13 }}>
                  {unitPrice.toLocaleString('fr-FR')} FCFA / {i.unit}
                  {i.qty >= 10 && <span style={{ color: 'var(--yellow-dark)', marginLeft: 8 }}>Prix de gros</span>}
                </div>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => cart.setQty(i.id, i.qty - 1)}><Minus size={16} /></button>
                <span className="qty-val">{i.qty}</span>
                <button className="qty-btn" onClick={() => cart.setQty(i.id, i.qty + 1)}><Plus size={16} /></button>
              </div>
              <strong style={{ minWidth: 110, textAlign: 'right' }}>{(unitPrice * i.qty).toLocaleString('fr-FR')} FCFA</strong>
              <button className="btn btn-ghost btn-sm" onClick={() => cart.remove(i.id)}><Trash2 size={16} /></button>
            </div>
          )
        })}
      </div>

      <div className="card mt-16">
        <h3 className="h3">Informations de livraison</h3>
        <div className="grid grid-2 mt-16">
          <div className="form-group">
            <label className="form-label">Civilité</label>
            <select className="form-select" value={civility} onChange={e => setCivility(e.target.value)}>
              <option value="Mr">Monsieur</option>
              <option value="Mme">Madame</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nom complet *</label>
            <input className="form-input" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input className="form-input" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="074 XX XX XX" />
          </div>
          <div className="form-group">
            <label className="form-label">Adresse de livraison *</label>
            <input className="form-input" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Quartier, ville" />
          </div>
          <div className="form-group">
            <label className="form-label">Mode de paiement</label>
            <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="livraison">Paiement à la livraison</option>
              <option value="airtel">Airtel Money</option>
              <option value="moov">Moov Money</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card mt-16">
        <div className="flex between" style={{ padding: '4px 0' }}>
          <span>Sous-total</span>
          <strong>{cart.total.toLocaleString('fr-FR')} FCFA</strong>
        </div>
        <div className="flex between" style={{ padding: '4px 0', marginTop: 8 }}>
          <span className="flex gap-8" style={{ alignItems: 'center' }}><Truck size={16} /> Livraison {cart.count >= 65 && <span className="badge badge-confirmed">Gratuite</span>}</span>
          <strong>{deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}</strong>
        </div>
        <div className="flex between" style={{ padding: '12px 0 0', borderTop: '2px solid var(--border)', marginTop: 12 }}>
          <span className="h3">Total</span>
          <span className="h3" style={{ color: 'var(--green)' }}>{grandTotal.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {error && <p style={{ color: 'var(--red)', marginTop: 12, fontWeight: 600 }}>{error}</p>}

      <div className="flex gap-12 mt-24" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit}><Check size={20} /> Valider la commande</button>
      </div>
    </div>
  )
}
