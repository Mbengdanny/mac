import { useState } from 'react'
import { FileText, Plus, Minus, Trash2, Check } from 'lucide-react'
import { useProducts, useCategories } from '../lib/hooks'
import { supabase } from '../lib/supabase'

interface QuoteItem {
  productId: string
  name: string
  unit: string
  price: number
  qty: number
}

export default function Devis() {
  const products = useProducts()
  const categories = useCategories()
  const [items, setItems] = useState<QuoteItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [civility, setCivility] = useState('Mr')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddProduct = () => {
    const p = products.find(pr => pr.id === selectedProduct)
    if (!p) return
    const existing = items.find(i => i.productId === p.id)
    if (existing) {
      setItems(prev => prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setItems(prev => [...prev, { productId: p.id, name: p.name, unit: p.unit, price: p.price_fcfa, qty: 1 }])
    }
    setSelectedProduct('')
  }

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.productId !== id) return i
      const newQty = i.qty + delta
      return newQty <= 0 ? null as unknown as QuoteItem : { ...i, qty: newQty }
    }).filter(Boolean))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.productId !== id))
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  const handleSubmit = async () => {
    setError(null)
    if (!clientName.trim()) { setError('Veuillez entrer votre nom.'); return }
    if (items.length === 0) { setError('Veuillez ajouter au moins un produit.'); return }

    const quoteNumber = `DEV-${Date.now().toString().slice(-6)}`
    const { error: err } = await supabase.from('quotes').insert({
      quote_number: quoteNumber,
      civility,
      client_name: clientName,
      client_phone: clientPhone || null,
      items: items.map(i => ({ name: i.name, unit: i.unit, price: i.price, qty: i.qty })),
      total_fcfa: total,
      status: 'created',
    })

    if (err) { setError('Erreur lors de la création du devis.'); return }
    setSubmitted(quoteNumber)
  }

  if (submitted) {
    return (
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48, maxWidth: 600 }}>
        <div className="card fade-up" style={{ textAlign: 'center' }}>
          <div className="center" style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--green-light)', color: 'var(--green)', margin: '0 auto 16px' }}>
            <Check size={32} />
          </div>
          <h1 className="h2">Devis créé !</h1>
          <p className="lead mt-8">Votre numéro de devis : <strong>{submitted}</strong></p>
          <p className="muted mt-8">Montant total : {total.toLocaleString('fr-FR')} FCFA</p>
          <div className="flex gap-12 mt-24" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/?text=Devis%20${submitted}%20-%20${total}%20FCFA`} target="_blank" rel="noopener" className="btn btn-primary">Partager sur WhatsApp</a>
            <button className="btn btn-ghost" onClick={() => { setSubmitted(null); setItems([]); setClientName(''); setClientPhone('') }}>Nouveau devis</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 720 }}>
      <h1 className="h1">Demander un devis</h1>
      <p className="lead mt-8">Ajoutez les produits dont vous avez besoin et recevez un devis pro forma.</p>

      <div className="card mt-24">
        <h3 className="h3">Vos informations</h3>
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
            <input className="form-input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Votre nom" />
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input className="form-input" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="074 XX XX XX" />
          </div>
        </div>
      </div>

      <div className="card mt-16">
        <h3 className="h3">Produits du devis</h3>
        <div className="flex gap-12 mt-16" style={{ flexWrap: 'wrap' }}>
          <select className="form-select" style={{ flex: 1, minWidth: 260 }} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
            <option value="">Sélectionner un produit...</option>
            {categories.map(c => (
              <optgroup key={c.id} label={c.name}>
                {products.filter(p => p.category_id === c.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.price_fcfa.toLocaleString('fr-FR')} FCFA</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleAddProduct} disabled={!selectedProduct}><Plus size={18} /> Ajouter</button>
        </div>

        {items.length > 0 && (
          <div className="col gap-12 mt-24">
            {items.map(i => (
              <div key={i.productId} className="flex gap-12" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <strong>{i.name}</strong>
                  <div className="muted" style={{ fontSize: 13 }}>{i.price.toLocaleString('fr-FR')} FCFA / {i.unit}</div>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(i.productId, -1)}><Minus size={16} /></button>
                  <span className="qty-val">{i.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(i.productId, 1)}><Plus size={16} /></button>
                </div>
                <strong style={{ minWidth: 100, textAlign: 'right' }}>{(i.price * i.qty).toLocaleString('fr-FR')} FCFA</strong>
                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(i.productId)}><Trash2 size={16} /></button>
              </div>
            ))}
            <div className="flex between" style={{ paddingTop: 12 }}>
              <span className="h3">Total</span>
              <span className="h3" style={{ color: 'var(--green)' }}>{total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        )}
      </div>

      {error && <p style={{ color: 'var(--red)', marginTop: 12, fontWeight: 600 }}>{error}</p>}

      <div className="flex gap-12 mt-24" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit}><FileText size={20} /> Créer le devis</button>
      </div>
    </div>
  )
}
