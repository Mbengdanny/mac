import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product, QuoteItem } from './types'

type CartItem = QuoteItem & { productId: string }

type CartCtx = {
  items: CartItem[]
  add: (p: Product, qty: number) => void
  setQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
  total: number
  count: number
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'vldmac_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)) }, [items])

  const add: CartCtx['add'] = (p, qty) => {
    if (qty <= 0) return
    setItems(prev => {
      const ex = prev.find(i => i.productId === p.id)
      if (ex) return prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { productId: p.id, name: p.name, unit: p.unit, price: p.price_fcfa, qty }]
    })
  }

  const setQty: CartCtx['setQty'] = (productId, qty) => {
    if (qty <= 0) { setItems(prev => prev.filter(i => i.productId !== productId)); return }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i))
  }

  const remove: CartCtx['remove'] = (productId) => setItems(prev => prev.filter(i => i.productId !== productId))
  const clear = () => setItems([])
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return <Ctx.Provider value={{ items, add, setQty, remove, clear, total, count }}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used within CartProvider')
  return c
}
