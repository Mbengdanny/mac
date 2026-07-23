import { useState, useMemo } from 'react'
import { ShoppingCart, Search, Plus, Minus } from 'lucide-react'
import { useCategories, useProducts, type Product } from '../lib/hooks'
import { useCart } from '../lib/cart'

export default function Catalogue() {
  const categories = useCategories()
  const products = useProducts()
  const cart = useCart()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = products
    if (activeSlug) {
      const cat = categories.find(c => c.slug === activeSlug)
      if (cat) list = list.filter(p => p.category_id === cat.id)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    return list
  }, [products, categories, activeSlug, query])

  const handleAdd = (p: Product) => {
    cart.add({ id: p.id, name: p.name, unit: p.unit, price_fcfa: p.price_fcfa, price_gros_fcfa: p.price_gros_fcfa })
    setToast(`${p.name} ajouté au panier`)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="h1">Catalogue des produits</h1>
      <p className="lead mt-8">Sélectionnez vos matériaux et ajoutez-les au panier. Prix de gros dès 10 pièces.</p>

      <div className="flex gap-12 mt-24" style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex gap-12" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <button className={`cat-chip ${!activeSlug ? 'active' : ''}`} onClick={() => setActiveSlug(null)}>Tous</button>
          {categories.map(c => (
            <button key={c.id} className={`cat-chip ${activeSlug === c.slug ? 'active' : ''}`} onClick={() => setActiveSlug(c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input className="form-input" style={{ paddingLeft: 40, width: 240 }} placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-24" style={{ textAlign: 'center', padding: 48 }}>
          <p className="muted">Aucun produit trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-3 mt-24">
          {filtered.map(p => {
            const inCart = cart.items.find(i => i.id === p.id)
            return (
              <div key={p.id} className="product-card">
                <div className="product-name">{p.name}</div>
                <div className="product-unit">{p.unit}</div>
                <div className="product-price mt-8">{p.price_fcfa.toLocaleString('fr-FR')} FCFA</div>
                {p.price_gros_fcfa > 0 && (
                  <div className="product-price-gros">Gros : {p.price_gros_fcfa.toLocaleString('fr-FR')} FCFA / {p.unit}</div>
                )}
                <div className="flex gap-12 mt-16" style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  {inCart ? (
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => cart.setQty(p.id, inCart.qty - 1)}><Minus size={16} /></button>
                      <span className="qty-val">{inCart.qty}</span>
                      <button className="qty-btn" onClick={() => cart.setQty(p.id, inCart.qty + 1)}><Plus size={16} /></button>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleAdd(p)}><ShoppingCart size={16} /> Ajouter</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
