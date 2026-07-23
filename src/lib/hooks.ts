import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export interface Announcement {
  id: string
  title: string
  message: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  sort_order: number
}

export interface Product {
  id: string
  category_id: string
  name: string
  unit: string
  price_fcfa: number
  price_gros_fcfa: number
  description: string | null
  sort_order: number
}

export interface SiteImage {
  id: string
  location: string
  url: string
}

export function useAnnouncements(): Announcement[] {
  const [items, setItems] = useState<Announcement[]>([])
  useEffect(() => {
    supabase
      .from('announcements')
      .select('id, title, message')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setItems(data as Announcement[]) })
  }, [])
  return items
}

export function useCategories(): Category[] {
  const [items, setItems] = useState<Category[]>([])
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug, icon, sort_order')
      .order('sort_order', { ascending: true })
      .then(({ data }) => { if (data) setItems(data as Category[]) })
  }, [])
  return items
}

export function useProducts(): Product[] {
  const [items, setItems] = useState<Product[]>([])
  useEffect(() => {
    supabase
      .from('products')
      .select('id, category_id, name, unit, price_fcfa, price_gros_fcfa, description, sort_order')
      .order('sort_order', { ascending: true })
      .then(({ data }) => { if (data) setItems(data as Product[]) })
  }, [])
  return items
}

export function useSiteImage(location: string): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    supabase
      .from('site_images')
      .select('id, location, url')
      .eq('location', location)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setUrl((data as SiteImage).url) })
  }, [location])
  return url
}

export async function getStat(key: string): Promise<number> {
  const { data } = await supabase
    .from('app_stats')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data ? (data as { value: number }).value : 0
}

export async function incrementStat(key: string): Promise<void> {
  const current = await getStat(key)
  await supabase.from('app_stats').upsert({ key, value: current + 1 })
}

export async function uploadSiteImage(location: string, file: File): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('site-images')
    .upload(`${location}/${Date.now()}-${file.name}`, file)
  if (error || !data) return null
  const { data: urlData } = supabase.storage
    .from('site-images')
    .getPublicUrl(data.path)
  return urlData.publicUrl
}
