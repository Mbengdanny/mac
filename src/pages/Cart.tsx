import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, FileText, ShoppingCart } from 'lucide-react'
import { useCart } from '../lib/cart'
import { fcfa } from '../lib/format'

export default function Cart() {
  const cart = useCart()
  const nav = useNavigate()

  if (cart.items.length === 0) {
    return (
      <div className="container section">
        <div className="card text-center" style={{ padding: 48 }}>
          <ShoppingCart size={48} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <h2 className="h3">Votre panier est vide</h2>
          <p className="muted mt-8">Parcourez le catalogue et ajoutez des matériaux.</p>
          <Link to="/catalogue" className="btn btn-primary mt-24"><ShoppingCart size={18} /> Voir le catalogue</Link>
        </div>
      </div>
    )
  }

  const deliveryFree = cart.count >= 65
  const deliveryFee = deliveryFree ? 0 : 10000
  const grandTotal = cart.total + deliveryFee

  return (
    <div className="container section">
      <h1 className="h2">Mon panier</h1>
      <p className="muted mt-8">{cart.count} article(s) — province de l'Estuaire.</p>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 820 ? '1.4fr 0.6fr' : '1fr', gap: 24 }} className="mt-24">
        <div className="col gap-12">
          {cart.items.map(it => (
            <div key={it.productId} className="card-soft flex between" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{it.name}</div>
                <div className="muted" style={{ fontSize: 13.5 }}>{fcfa(it.price)} / {it.unit}</div>
              </div>
              <div className="qty-row">
                <button className="qty-btn" onClick={() => cart.setQty(it.productId, it.qty - 1)}><Minus size={16} /></button>
                <span className="qty-val">{it.qty}</span>
                <button className="qty-btn" onClick={() => cart.setQty(it.productId, it.qty + 1)}><Plus size={16} /></button>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--green)', minWidth: 110, textAlign: 'right' }}>{fcfa(it.price * it.qty)}</div>
              <button className="qty-btn" onClick={() => cart.remove(it.productId)} style={{ color: '#ef4444', borderColor: '#fecaca' }}><Trash2 size={16} /></button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={cart.clear} style={{ alignSelf: 'flex-start' }}>Vider le panier</button>
        </div>

        <div className="card" style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
          <h3 className="h3">Récapitulatif</h3>
          <div className="between mt-16" style={{ fontSize: 14 }}><span className="muted">Sous-total</span><span>{fcfa(cart.total)}</span></div>
          <div className="between mt-8" style={{ fontSize: 14 }}>
            <span className="muted">Livraison</span>
            <span style={{ fontWeight: 700, color: deliveryFree ? 'var(--green)' : 'var(--ink)' }}>{deliveryFree ? 'Offerte' : fcfa(deliveryFee)}</span>
          </div>
          {!deliveryFree && <p className="muted mt-8" style={{ fontSize: 12.5 }}>Livraison offerte à partir de 65 pièces. Plus que {65 - cart.count} pièce(s) !</p>}
          <div style={{ borderTop: '1px solid var(--line)', margin: '16px 0' }} />
          <div className="between"><span style={{ fontWeight: 700 }}>Total</span><span style={{ fontWeight: 800, fontSize: 20, color: 'var(--green)' }}>{fcfa(grandTotal)}</span></div>

          <div className="col gap-12 mt-24">
            <button className="btn btn-blue btn-block btn-lg" onClick={() => nav('/devis')}><FileText size={18} /> Faire un devis</button>
            <Link to="/catalogue" className="btn btn-ghost btn-block">Continuer mes achats</Link>
          </div>
          <p className="muted mt-16" style={{ fontSize: 12 }}>Prix valables pour Owendo, Akanda et Libreville.</p>
        </div>
      </div>
    </div>
  )
}
