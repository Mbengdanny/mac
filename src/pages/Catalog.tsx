import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Search, Plus, Minus, Check } from 'lucide-react'
import { useCatalog } from '../lib/hooks'
import { iconFor } from '../lib/icons'
import { useCart } from '../lib/cart'
import { fcfa } from '../lib/format'
import { useToast } from '../lib/toast'

export default function Catalog() {
  const { categories, products, loading } = useCatalog()
  const cart = useCart()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [active, setActive] = useState<string | null>(null)
  const [added, setAdded] = useState<Record<string, number>>({})

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (active && p.category_id !== active) return false
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [products, active, q])

  const catName = (id: string) => categories.find(c => c.id === id)?.name || ''

  const addOne = (productId: string) => {
    const p = products.find(x => x.id === productId)
    if (!p) return
    cart.add(p, 1)
    setAdded(a => ({ ...a, [productId]: 1 }))
    toast.show(`${p.name} ajouté au panier`)
    setTimeout(() => setAdded(a => { const n = { ...a }; delete n[productId]; return n }), 1200)
  }

  if (loading) return <div className="container section"><div className="card text-center muted">Chargement du catalogue…</div></div>

  return (
    <div className="container section">
      <h1 className="h2">Catalogue des produits</h1>
      <p className="muted mt-8">Toutes les rubriques disponibles. Les devis et commandes ne sont valables que pour Owendo, Akanda et Libreville. Les prix peuvent varier d'une province à une autre.</p>

      <div className="field mt-24" style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--muted)' }} />
        <input className="input" style={{ paddingLeft: 42 }} placeholder="Rechercher un produit…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="flex gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
        <button className={`pill ${active === null ? 'pill-green' : 'pill-muted'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => setActive(null)}>Tous</button>
        {categories.map(c => (
          <button key={c.id} className={`pill ${active === c.id ? 'pill-green' : 'pill-muted'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => setActive(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-3 mt-24">
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="pill pill-blue" style={{ alignSelf: 'flex-start' }}>{catName(p.category_id)}</span>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>{p.name}</h3>
            {p.description && <p className="muted" style={{ fontSize: 13.5 }}>{p.description}</p>}
            <div className="between" style={{ marginTop: 'auto', paddingTop: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>{fcfa(p.price_fcfa)}</div>
                <div className="muted" style={{ fontSize: 12 }}>par {p.unit}</div>
                {p.price_gros_fcfa > 0 && (
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--yellow-dark)', marginTop: 4 }}>
                    Gros : {fcfa(p.price_gros_fcfa)}
                  </div>
                )}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => addOne(p.id)}>
                {added[p.id] ? <><Check size={16} /> Ajouté</> : <><Plus size={16} /> Ajouter</>}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="muted">Aucun produit trouvé.</p>}
      </div>

      {/* Category overview */}
      <h2 className="h3 mt-32 mb-16">Rubriques</h2>
      <div className="grid grid-4">
        {categories.map(c => {
          const Icon = iconFor(c.icon)
          const count = products.filter(p => p.category_id === c.id).length
          return (
            <Link key={c.id} to="/catalogue" onClick={() => setActive(c.id)} className="cat-card">
              <div className="cat-icon"><Icon size={26} /></div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c.name}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{count} produit(s)</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
