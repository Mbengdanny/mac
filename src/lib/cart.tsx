import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  unit: string
  price_fcfa: number
  price_gros_fcfa: number
  qty: number
}

interface CartState {
  items: CartItem[]
  count: number
  total: number
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartState | null>(null)

const STORAGE_KEY = 'vldmac_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const add: CartState['add'] = (item, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { ...item, qty }]
    })
  }

  const remove: CartState['remove'] = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const setQty: CartState['setQty'] = (id, qty) => {
    if (qty <= 0) { remove(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const clear = () => setItems([])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => {
    const price = i.qty >= 10 ? i.price_gros_fcfa : i.price_fcfa
    return s + price * i.qty
  }, 0)

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
