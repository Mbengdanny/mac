export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  sort_order: number
}

export type Product = {
  id: string
  category_id: string
  name: string
  unit: string
  price_fcfa: number
  price_gros_fcfa: number
  description: string | null
  sort_order: number
}

export type QuoteItem = {
  name: string
  unit: string
  price: number
  qty: number
}

export type Quote = {
  id: string
  quote_number: string
  civility: 'Mr' | 'Mme'
  client_name: string
  client_phone: string | null
  items: QuoteItem[]
  total_fcfa: number
  status: string
  created_at: string
}

export type Order = {
  id: string
  order_number: string
  civility: 'Mr' | 'Mme'
  client_name: string
  client_phone: string | null
  delivery_address: string | null
  items: QuoteItem[]
  total_fcfa: number
  delivery_fee_fcfa: number
  payment_method: 'airtel' | 'moov' | 'livraison'
  status: string
  created_at: string
}

export type Announcement = {
  id: string
  title: string
  message: string
  created_at: string
}

export type SiteImage = {
  id: string
  location: string
  url: string
}
