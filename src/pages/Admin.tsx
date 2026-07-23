import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Package, Bell, Image as ImageIcon, ShoppingCart, FileText, LogOut, Lock, Users, Plus, Trash2, Send, Edit3, X, Check, Upload } from 'lucide-react'
import { useCatalog } from '../lib/hooks'
import { fcfa } from '../lib/format'
import { useToast } from '../lib/toast'
import type { Order, Quote } from '../lib/types'

const ADMIN_EMAIL = 'admin@vldmac.cd'

export default function Admin() {
  const [session, setSession] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [tab, setTab] = useState<'products' | 'announcements' | 'images' | 'orders' | 'quotes' | 'subs'>('orders')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const login = async () => {
    setLoginErr('')
    const { error } = await supabase.auth.signInWithPassword({ email: email || ADMIN_EMAIL, password: pwd })
    if (error) setLoginErr(error.message)
  }

  const logout = () => supabase.auth.signOut().then(() => setSession(false))

  if (session === null) return <div className="container section"><div className="card text-center muted">Vérification…</div></div>

  if (!session) {
    return (
      <div className="container section">
        <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
          <div className="center" style={{ width: 56, height: 56, borderRadius: 16, background: '#dbeafe', color: 'var(--blue)', margin: '0 auto 16px' }}><Lock size={26} /></div>
          <h2 className="h3 text-center">Espace gestionnaire</h2>
          <p className="muted text-center mt-8" style={{ fontSize: 13.5 }}>Pilotez l'application depuis votre téléphone.</p>
          <div className="field mt-24">
            <label className="label">Email</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder={ADMIN_EMAIL} />
          </div>
          <div className="field">
            <label className="label">Mot de passe</label>
            <input className="input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="••••••••" />
          </div>
          {loginErr && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{loginErr}</p>}
          <button className="btn btn-primary btn-block btn-lg" onClick={login}>Se connecter</button>
          <p className="muted mt-16" style={{ fontSize: 12 }}>Créez votre compte depuis Supabase avec l'email {ADMIN_EMAIL} pour piloter l'application.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'orders' as const, label: 'Commandes', icon: ShoppingCart },
    { id: 'quotes' as const, label: 'Devis', icon: FileText },
    { id: 'products' as const, label: 'Produits', icon: Package },
    { id: 'announcements' as const, label: 'Annonces', icon: Bell },
    { id: 'images' as const, label: 'Images', icon: ImageIcon },
    { id: 'subs' as const, label: 'Abonnés', icon: Users },
  ]

  return (
    <div className="container section">
      <div className="between mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 className="h2">Gestion</h1>
        <button className="btn btn-ghost btn-sm" onClick={logout}><LogOut size={16} /> Déconnexion</button>
      </div>

      <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} className={`pill ${tab === t.id ? 'pill-green' : 'pill-muted'}`} style={{ cursor: 'pointer', border: 'none', padding: '10px 16px' }} onClick={() => setTab(t.id)}>
            <t.icon size={15} style={{ display: 'inline', marginRight: 4 }} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersPanel />}
      {tab === 'quotes' && <QuotesPanel />}
      {tab === 'products' && <ProductsPanel />}
      {tab === 'announcements' && <AnnouncementsPanel />}
      {tab === 'images' && <ImagesPanel />}
      {tab === 'subs' && <SubscribersPanel />}
    </div>
  )
}

/* ---------- Orders ---------- */
function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const load = () => {
    setLoading(true)
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders(data || []); setLoading(false)
    })
  }
  useEffect(load, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    toast.show('Statut mis à jour')
    load()
  }

  const notifyWhatsApp = (o: Order) => {
    const msg = encodeURIComponent(`Bonjour ${o.civility} ${o.client_name}, votre commande ${o.order_number} est en cours de traitement. Service client 076452070.`)
    const phone = (o.client_phone || '').replace(/[^0-9]/g, '')
    const num = phone.length >= 9 ? '242' + phone.slice(-9) : '242076452070'
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
  }

  if (loading) return <p className="muted">Chargement…</p>
  if (orders.length === 0) return <p className="muted">Aucune commande pour l'instant.</p>

  return (
    <div className="col gap-12">
      {orders.map(o => (
        <div key={o.id} className="card-soft">
          <div className="between" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div>
              <strong>{o.order_number}</strong> — {o.civility} {o.client_name}
              <p className="muted" style={{ fontSize: 13 }}>{o.client_phone} · {o.delivery_address}</p>
            </div>
            <span className={`pill ${o.status === 'pending' ? 'pill-yellow' : 'pill-green'}`}>{o.status}</span>
          </div>
          <div className="col gap-8 mt-16" style={{ fontSize: 13.5 }}>
            {o.items.map((it, i) => <div key={i} className="between"><span>{it.name} × {it.qty}</span><span>{fcfa(it.price * it.qty)}</span></div>)}
          </div>
          <div className="between mt-16" style={{ fontSize: 13.5 }}>
            <span>Livraison : {o.delivery_fee_fcfa === 0 ? 'Offerte' : fcfa(o.delivery_fee_fcfa)}</span>
            <span>Paiement : {o.payment_method}</span>
          </div>
          <div className="between mt-8" style={{ fontWeight: 800, fontSize: 16 }}>
            <span>Total</span><span style={{ color: 'var(--green)' }}>{fcfa(o.total_fcfa + o.delivery_fee_fcfa)}</span>
          </div>
          <div className="flex gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(o.id, 'confirmed')}><Check size={15} /> Confirmer</button>
            <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(o.id, 'delivered')}><Check size={15} /> Livrée</button>
            <button className="btn btn-sm" style={{ background: '#25D366', color: '#fff' }} onClick={() => notifyWhatsApp(o)}><Send size={15} /> Notifier WhatsApp</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Quotes ---------- */
function QuotesPanel() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  useEffect(() => {
    supabase.from('quotes').select('*').order('created_at', { ascending: false }).then(({ data }) => setQuotes(data || []))
  }, [])
  if (quotes.length === 0) return <p className="muted">Aucun devis pour l'instant.</p>
  return (
    <div className="col gap-12">
      {quotes.map(q => (
        <div key={q.id} className="card-soft">
          <div className="between" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div><strong>{q.quote_number}</strong> — {q.civility} {q.client_name}<p className="muted" style={{ fontSize: 13 }}>{q.client_phone}</p></div>
            <span className="pill pill-blue">{fcfa(q.total_fcfa)}</span>
          </div>
          <div className="col gap-8 mt-16" style={{ fontSize: 13.5 }}>
            {q.items.map((it, i) => <div key={i} className="between"><span>{it.name} × {it.qty}</span><span>{fcfa(it.price * it.qty)}</span></div>)}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Products ---------- */
function ProductsPanel() {
  const { categories, products, loading } = useCatalog()
  const toast = useToast()
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCat, setNewCat] = useState('')

  const savePrice = async (id: string) => {
    const detail = editing[id + '_detail']
    const gros = editing[id + '_gros']
    const updates: Record<string, number> = {}
    if (detail && !isNaN(parseInt(detail))) updates.price_fcfa = parseInt(detail)
    if (gros && !isNaN(parseInt(gros))) updates.price_gros_fcfa = parseInt(gros)
    if (Object.keys(updates).length === 0) return
    await supabase.from('products').update(updates).eq('id', id)
    toast.show('Prix mis à jour')
    setEditing({})
    window.location.reload()
  }

  const addProduct = async () => {
    if (!newName || !newCat || !newPrice) { toast.show('Remplissez tous les champs'); return }
    await supabase.from('products').insert({ category_id: newCat, name: newName, price_fcfa: parseInt(newPrice), unit: 'pièce' })
    setNewName(''); setNewPrice(''); setNewCat('')
    toast.show('Produit ajouté')
    window.location.reload()
  }

  const del = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.show('Produit supprimé')
    window.location.reload()
  }

  if (loading) return <p className="muted">Chargement…</p>

  return (
    <div className="col gap-24">
      <div className="card-soft">
        <h3 className="flex gap-8 mb-16" style={{ alignItems: 'center' }}><Plus size={18} /> Ajouter un produit</h3>
        <div className="grid grid-3" style={{ gap: 12 }}>
          <select className="select" value={newCat} onChange={e => setNewCat(e.target.value)}>
            <option value="">Catégorie…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input" placeholder="Nom du produit" value={newName} onChange={e => setNewName(e.target.value)} />
          <input className="input" placeholder="Prix FCFA" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm mt-16" onClick={addProduct}><Plus size={16} /> Ajouter</button>
      </div>

      <div className="col gap-8">
        {products.map(p => (
          <div key={p.id} className="card-soft between" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{categories.find(c => c.id === p.category_id)?.name} · {p.unit}</div>
            </div>
            <div className="flex gap-8" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="col" style={{ gap: 2 }}>
                <span className="muted" style={{ fontSize: 11 }}>Détail</span>
                <input className="input" style={{ width: 110, textAlign: 'right' }} type="number" defaultValue={p.price_fcfa}
                  onChange={e => setEditing(s => ({ ...s, [p.id + '_detail']: e.target.value }))} />
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span className="muted" style={{ fontSize: 11 }}>Gros</span>
                <input className="input" style={{ width: 110, textAlign: 'right' }} type="number" defaultValue={p.price_gros_fcfa}
                  onChange={e => setEditing(s => ({ ...s, [p.id + '_gros']: e.target.value }))} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>FCFA</span>
              {(editing[p.id + '_detail'] || editing[p.id + '_gros']) && <button className="btn btn-primary btn-sm" onClick={() => savePrice(p.id)}><Check size={15} /></button>}
              <button className="qty-btn" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={() => del(p.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Announcements ---------- */
function AnnouncementsPanel() {
  const [items, setItems] = useState<{ id: string; title: string; message: string }[]>([])
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState('')
  const toast = useToast()

  const load = () => { supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || [])) }
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!title || !msg) { toast.show('Remplissez titre et message'); return }
    await supabase.from('announcements').insert({ title, message: msg })
    setTitle(''); setMsg(''); toast.show('Annonce publiée'); load()
  }

  const del = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id); toast.show('Supprimée'); load()
  }

  return (
    <div className="col gap-24">
      <div className="card-soft">
        <h3 className="flex gap-8 mb-16" style={{ alignItems: 'center' }}><Bell size={18} /> Nouvelle annonce</h3>
        <div className="field"><input className="input" placeholder="Titre (ex : Nouveau prix du ciment)" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div className="field"><textarea className="textarea" placeholder="Message…" value={msg} onChange={e => setMsg(e.target.value)} /></div>
        <button className="btn btn-primary btn-sm" onClick={add}><Plus size={16} /> Publier</button>
      </div>
      <div className="col gap-8">
        {items.map(a => (
          <div key={a.id} className="card-soft between" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div><strong style={{ fontSize: 15 }}>{a.title}</strong><p className="muted" style={{ fontSize: 13.5 }}>{a.message}</p></div>
            <button className="qty-btn" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={() => del(a.id)}><Trash2 size={15} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="muted">Aucune annonce.</p>}
      </div>
    </div>
  )
}

/* ---------- Images ---------- */
function ImagesPanel() {
  const toast = useToast()
  const [homePreview, setHomePreview] = useState<string | null>(null)
  const [estPreview, setEstPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const uploadFile = async (location: 'home' | 'estuaire', file: File) => {
    if (!file) return
    if (file.size > 4 * 1024 * 1024) { toast.show('Image trop lourde (max 4 Mo)'); return }
    setBusy(location)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${location}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('site-images').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('site-images').getPublicUrl(path)
      const url = pub.publicUrl
      await supabase.from('site_images').insert({ location, url })
      if (location === 'home') setHomePreview(url)
      else setEstPreview(url)
      toast.show('Image enregistrée — visible sur la page')
    } catch { toast.show('Erreur lors du téléversement') }
    finally { setBusy(null) }
  }

  const ImageUploadCard = ({ location, label, preview }: { location: 'home' | 'estuaire'; label: string; preview: string | null }) => (
    <div className="card-soft">
      <h3 className="flex gap-8 mb-16" style={{ alignItems: 'center' }}><ImageIcon size={18} /> {label}</h3>
      {preview && (
        <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 12 }}>
          <img src={preview} alt={label} style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
        </div>
      )}
      <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
        <Upload size={16} /> {busy === location ? 'Téléversement…' : 'Choisir une image'}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(location, f) }} />
      </label>
      <p className="muted mt-12" style={{ fontSize: 12.5 }}>Sélectionnez une image depuis votre appareil (JPG, PNG — max 4 Mo).</p>
    </div>
  )

  return (
    <div className="col gap-24">
      <ImageUploadCard location="home" label="Image page d'accueil" preview={homePreview} />
      <ImageUploadCard location="estuaire" label="Image espace Estuaire" preview={estPreview} />
    </div>
  )
}

/* ---------- Subscribers ---------- */
function SubscribersPanel() {
  const [subs, setSubs] = useState<{ id: string; name: string | null; phone: string | null }[]>([])
  useEffect(() => {
    supabase.from('subscribers').select('*').order('created_at', { ascending: false }).then(({ data }) => setSubs(data || []))
  }, [])
  return (
    <div>
      <p className="muted mb-16">{subs.length} abonné(s)</p>
      <div className="col gap-8">
        {subs.map(s => (
          <div key={s.id} className="card-soft between">
            <div><strong>{s.name || 'Anonyme'}</strong><p className="muted" style={{ fontSize: 13 }}>{s.phone}</p></div>
            {s.phone && <a href={`https://wa.me/242${(s.phone || '').replace(/[^0-9]/g, '').slice(-9)}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#25D366', color: '#fff' }}><Send size={15} /> WhatsApp</a>}
          </div>
        ))}
        {subs.length === 0 && <p className="muted">Aucun abonné.</p>}
      </div>
    </div>
  )
}
