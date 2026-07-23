import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Category, Product, Announcement, SiteImage } from './types'

export function useCatalog() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*').order('sort_order'),
      ])
      setCategories(c.data || [])
      setProducts(p.data || [])
      setLoading(false)
    })()
  }, [])

  return { categories, products, loading }
}

export function useAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])
  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setItems(data || []))
  }, [])
  return items
}

export function useSiteImage(location: string) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    supabase.from('site_images').select('url').eq('location', location).order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => setUrl(data && data[0] ? data[0].url : null))
  }, [location])
  return url
}

export async function bumpVisitor() {
  await supabase.rpc('bump_stat', { stat_key: 'visitors' })
}

export async function getStat(key: string): Promise<number> {
  const { data } = await supabase.from('app_stats').select('value').eq('key', key).maybeSingle()
  return data?.value || 0
}
