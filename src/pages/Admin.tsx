import { useState, useEffect } from 'react'
import { Trash2, Bell, ImagePlus, Plus, Package, FileText, ShoppingCart, Users, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCategories, useProducts, uploadSiteImage, type Product, type Category } from '../lib/hooks'

type Tab = 'orders' | 'quotes' | 'products' | 'announcements' | 'images' | 'subscribers'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('orders')

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="h1">Espace gestionnaire</h1>
      <p className="lead mt-8">Gérez vos commandes, devis, produits, annonces et images.</p>

      <div className="admin-tabs mt-24">
        <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}><ShoppingCart size={16} style={{ display: 'inline', marginRight: 6 }} /> Commandes</button>
        <button className={`admin-tab ${tab === 'quotes' ? 'active' : ''}`} onClick={() => setTab('quotes')}><FileText size={16} style={{ display: 'inline', marginRight: 6 }} /> Devis</button>
        <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}><Package size={16} style={{ display: 'inline', marginRight: 6 }} /> Produits</button>
        <button className={`admin-tab ${tab === 'announcements' ? 'active' : ''}`} onClick={() => setTab('announcements')}><Bell size={16} style={{ display: 'inline', marginRight: 6 }} /> Annonces</button>
        <button className={`admin-tab ${tab === 'images' ? 'active' : ''}`} onClick={() => setTab('images')}><ImagePlus size={16} style={{ display: 'inline', marginRight: 6 }} /> Images</button>
        <button className={`admin-tab ${tab === 'subscribers' ? 'active' : ''}`} onClick={() => setTab('subscribers')}><Users size={16} style={{ display: 'inline', marginRight: 6 }} /> Abonnés</button>
      </div>

      {tab === 'orders' && <OrdersTab />}
      {tab === 'quotes' && <QuotesTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'announcements' && <AnnouncementsTab />}
      {tab === 'images' && <ImagesTab />}
      {tab === 'subscribers' && <SubscribersTab />}
    </div>
  )
}

interface Order {
  id: string
  order_number: string
  civility: string
  client_name: string
  client_phone: string | null
  delivery_address: string | null
  items: { name: string; unit: string; price: number; qty: number }[]
  total_fcfa: number
  delivery_fee_fcfa: number
  payment_method: string
  status: string
  created_at: string
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setOrders(data as Order[])
      setLoading(false)
    })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  if (loading) return <p className="muted">Chargement...</p>
  if (orders.length === 0) return <div className="card"><p className="muted">Aucune commande pour le moment.</p></div>

  return (
    <div className="col gap-16">
      {orders.map(o => (
        <div key={o.id} className="card">
          <div className="flex between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong>{o.order_number}</strong>
              <div className="muted" style={{ fontSize: 13 }}>{new Date(o.created_at).toLocaleString('fr-FR')}</div>
            </div>
            <span className={`badge badge-${o.status}`}>{o.status}</span>
          </div>
          <div className="mt-16" style={{ fontSize: 14 }}>
            <div><strong>{o.civility === 'Mr' ? 'M.' : 'Mme'} {o.client_name}</strong></div>
            {o.client_phone && <div className="muted">{o.client_phone}</div>}
            {o.delivery_address && <div className="muted">{o.delivery_address}</div>}
            <div className="muted mt-8">Paiement : {o.payment_method}</div>
          </div>
          <div className="mt-16" style={{ fontSize: 14 }}>
            {o.items.map((i, idx) => (
              <div key={idx} className="flex between" style={{ padding: '4px 0' }}>
                <span>{i.name} ×{i.qty}</span>
                <span>{(i.price * i.qty).toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
          </div>
          <div className="flex between mt-16" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <strong>Total : {(o.total_fcfa + o.delivery_fee_fcfa).toLocaleString('fr-FR')} FCFA</strong>
            <select className="form-select" style={{ width: 'auto' }} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}

interface Quote {
  id: string
  quote_number: string
  civility: string
  client_name: string
  client_phone: string | null
  items: { name: string; unit: string; price: number; qty: number }[]
  total_fcfa: number
  status: string
  created_at: string
}

function QuotesTab() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('quotes').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setQuotes(data as Quote[])
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="muted">Chargement...</p>
  if (quotes.length === 0) return <div className="card"><p className="muted">Aucun devis pour le moment.</p></div>

  return (
    <div className="col gap-16">
      {quotes.map(q => (
        <div key={q.id} className="card">
          <div className="flex between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong>{q.quote_number}</strong>
              <div className="muted" style={{ fontSize: 13 }}>{new Date(q.created_at).toLocaleString('fr-FR')}</div>
            </div>
            <span className={`badge badge-${q.status}`}>{q.status}</span>
          </div>
          <div className="mt-16" style={{ fontSize: 14 }}>
            <div><strong>{q.civility === 'Mr' ? 'M.' : 'Mme'} {q.client_name}</strong></div>
            {q.client_phone && <div className="muted">{q.client_phone}</div>}
          </div>
          <div className="mt-16" style={{ fontSize: 14 }}>
            {q.items.map((i, idx) => (
              <div key={idx} className="flex between" style={{ padding: '4px 0' }}>
                <span>{i.name} ×{i.qty}</span>
                <span>{(i.price * i.qty).toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
          </div>
          <div className="flex between mt-16" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <strong>Total : {q.total_fcfa.toLocaleString('fr-FR')} FCFA</strong>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductsTab() {
  const categories = useCategories()
  const products = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unit, setUnit] = useState('pièce')
  const [price, setPrice] = useState('')
  const [priceGros, setPriceGros] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!name.trim() || !categoryId || !price) return
    const { error } = await supabase.from('products').insert({
      name,
      category_id: categoryId,
      unit,
      price_fcfa: parseInt(price),
      price_gros_fcfa: parseInt(priceGros) || 0,
    })
    if (!error) {
      setToast('Produit ajouté')
      setTimeout(() => setToast(null), 2000)
      setName(''); setPrice(''); setPriceGros('')
      setShowForm(false)
      setTimeout(() => window.location.reload(), 500)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setTimeout(() => window.location.reload(), 300)
  }

  return (
    <div>
      <div className="flex between" style={{ marginBottom: 16 }}>
        <h3 className="h3">{products.length} produits</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Ajouter</button>
      </div>

      {showForm && (
        <div className="card mb-16" style={{ marginBottom: 16 }}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Choisir...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unité</label>
              <input className="form-input" value={unit} onChange={e => setUnit(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Prix FCFA</label>
              <input className="form-input" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Prix de gros FCFA</label>
              <input className="form-input" type="number" value={priceGros} onChange={e => setPriceGros(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>Enregistrer</button>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Gros</th><th></th></tr>
        </thead>
        <tbody>
          {products.map(p => {
            const cat = categories.find(c => c.id === p.category_id)
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="muted">{cat?.name || '—'}</td>
                <td>{p.price_fcfa.toLocaleString('fr-FR')}</td>
                <td>{p.price_gros_fcfa.toLocaleString('fr-FR')}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

interface Announcement {
  id: string
  title: string
  message: string
}

function AnnouncementsTab() {
  const [items, setItems] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setItems(data as Announcement[])
    })
  }, [])

  const handleAdd = async () => {
    if (!title.trim() || !message.trim()) return
    const { data } = await supabase.from('announcements').insert({ title, message }).select().single()
    if (data) {
      setItems(prev => [data as Announcement, ...prev])
      setTitle(''); setMessage('')
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setItems(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="card mb-16" style={{ marginBottom: 16 }}>
        <h3 className="h3">Nouvelle annonce</h3>
        <div className="form-group mt-16">
          <label className="form-label">Titre</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleAdd}><Plus size={18} /> Publier</button>
      </div>

      <div className="col gap-12">
        {items.map(a => (
          <div key={a.id} className="card flex between" style={{ alignItems: 'flex-start' }}>
            <div>
              <strong>{a.title}</strong>
              <p className="muted mt-8" style={{ fontSize: 14 }}>{a.message}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(a.id)}><Trash2 size={16} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="muted">Aucune annonce.</p>}
      </div>
    </div>
  )
}

function ImagesTab() {
  const [url, setUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('site_images').select('url').eq('location', 'home').order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data) setUrl((data as { url: string }).url)
    })
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const publicUrl = await uploadSiteImage('home', file)
    if (publicUrl) {
      await supabase.from('site_images').insert({ location: 'home', url: publicUrl })
      setUrl(publicUrl)
      setToast('Image mise à jour')
      setTimeout(() => setToast(null), 2000)
    }
    setUploading(false)
  }

  return (
    <div className="card">
      <h3 className="h3">Image de la page d'accueil</h3>
      <p className="muted mt-8" style={{ fontSize: 14 }}>Téléversez l'image qui apparaît dans la section hero de la page d'accueil.</p>
      <div className="mt-16">
        {url ? (
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
            <img src={url} alt="Accueil" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
          </div>
        ) : (
          <div className="hero-img-placeholder" style={{ marginBottom: 16, aspectRatio: '4/3' }}>
            <ImagePlus size={36} />
            <p style={{ fontSize: 14 }}>Aucune image</p>
          </div>
        )}
        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          <ImagePlus size={18} /> {uploading ? 'Téléversement...' : 'Téléverser une image'}
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function SubscribersTab() {
  const [subs, setSubs] = useState<{ id: string; name: string | null; phone: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('subscribers').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setSubs(data as { id: string; name: string | null; phone: string }[])
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="muted">Chargement...</p>

  return (
    <div>
      <h3 className="h3" style={{ marginBottom: 16 }}>{subs.length} abonnés</h3>
      <table className="data-table">
        <thead><tr><th>Nom</th><th>Téléphone</th></tr></thead>
        <tbody>
          {subs.map(s => (
            <tr key={s.id}>
              <td>{s.name || '—'}</td>
              <td>{s.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {subs.length === 0 && <p className="muted mt-16">Aucun abonné.</p>}
    </div>
  )
}
