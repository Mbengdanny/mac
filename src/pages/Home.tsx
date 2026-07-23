import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { FileText, ShoppingCart, Phone, Users, Eye, Bell, ChevronRight, Truck, ShieldCheck, Clock, ImagePlus, Download, Check, AlertCircle } from 'lucide-react'
import { useAnnouncements, useSiteImage, getStat } from '../lib/hooks'
import { useCart } from '../lib/cart'
import { supabase } from '../lib/supabase'

export default function Home() {
  const announcements = useAnnouncements()
  const heroImg = useSiteImage('home')
  const [visitors, setVisitors] = useState(0)
  const [subs, setSubs] = useState(0)
  const [priceAlert, setPriceAlert] = useState(false)
  const cart = useCart()

  useEffect(() => {
    getStat('visitors').then(setVisitors)
    supabaseCount('subscribers').then(setSubs)
    supabase.rpc('bump_stat', { stat_key: 'visitors' })
    setPriceAlert(true)
  }, [])

  return (
    <div>
      <section className="hero">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 820 ? '1.1fr 0.9fr' : '1fr', gap: 40, alignItems: 'center', paddingTop: 56, paddingBottom: 56 }}>
          <div className="fade-up">
            <span className="pill pill-green"><Truck size={14} /> Livraison sous 24h · Owendo, Akanda, Libreville</span>
            <h1 className="h1 mt-16" style={{ fontFamily: 'var(--font-arial)' }}>
              Vos devis et commandes de matériaux en <span style={{ color: 'var(--green)' }}>quelques secondes</span> et en quelques clics.
            </h1>
            <p className="lead mt-16" style={{ fontFamily: 'var(--font-arial)' }}>
              Services VLDMAC vous accompagne pour chiffrer et commander vos matériaux de construction. Simple, rapide, fiable.
            </p>
            <div className="flex gap-12 mt-24" style={{ flexWrap: 'wrap' }}>
              <Link to="/catalogue" className="btn btn-primary btn-lg"><ShoppingCart size={20} /> Commander</Link>
              <Link to="/devis" className="btn btn-blue btn-lg"><FileText size={20} /> Faire un devis</Link>
              <Link to="/contact" className="btn btn-ghost btn-lg"><Phone size={20} /> Service client</Link>
            </div>
            <div className="flex gap-24 mt-24" style={{ flexWrap: 'wrap' }}>
              <Stat icon={<Eye size={18} />} value={visitors} label="Visiteurs" color="var(--blue)" />
              <Stat icon={<Users size={18} />} value={subs} label="Abonnés" color="var(--green)" />
              <Stat icon={<Clock size={18} />} value={null} label="Livraison 24h" color="var(--yellow-dark)" />
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: '.1s' }}>
            <div className="hero-img-wrap">
              {heroImg
                ? <img src={heroImg} alt="Services VLDMAC" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                : <div className="hero-img-placeholder">
                    <ImagePlus size={40} />
                    <p style={{ fontSize: 14, textAlign: 'center' }}>Image de la page d'accueil<br />(téléversée depuis l'admin)</p>
                  </div>}
            </div>
          </div>
        </div>
      </section>

      {priceAlert && (
        <div className="container" style={{ marginTop: 20 }}>
          <div className="price-notice">
            <AlertCircle size={16} /> Les prix des produits peuvent varier d'une province à une autre.
          </div>
        </div>
      )}

      <ImageDownloadSection />

      {announcements.length > 0 && (
        <section className="container section-tight">
          <div className="card" style={{ borderLeft: '4px solid var(--yellow)' }}>
            <h3 className="flex gap-8" style={{ alignItems: 'center', marginBottom: 14 }}><Bell size={18} color="var(--yellow-dark)" /> Annonces & mises à jour</h3>
            <div className="col gap-12">
              {announcements.map(a => (
                <div key={a.id}>
                  <strong style={{ fontSize: 15 }}>{a.title}</strong>
                  <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container section">
        <h2 className="h2 text-center">Pourquoi Services VLDMAC ?</h2>
        <p className="lead text-center mt-8" style={{ maxWidth: 640, margin: '8px auto 0' }}>Pensé pour les adultes comme pour les personnes âgées : gros boutons, texte clair, navigation simple.</p>
        <div className="grid grid-3 mt-32">
          <Feature icon={<FileText />} color="var(--blue)" title="Devis instantané" text="Générez un devis pro forma en quelques clics, prêt à partager sur WhatsApp." />
          <Feature icon={<Truck />} color="var(--green)" title="Livraison 24h" text="Livraison rapide dans la province de l'Estuaire. Offerte dès 65 pièces commandées." />
          <Feature icon={<ShieldCheck />} color="var(--yellow-dark)" title="Paiement flexible" text="Airtel Money, Moov Money ou paiement à la livraison. Choisissez ce qui vous convient." />
        </div>
      </section>

      <section className="container section-tight">
        <div className="grid grid-2">
          <Link to="/catalogue" className="card-soft quick-action">
            <div className="flex between">
              <div>
                <h3 className="h3">Voir le catalogue</h3>
                <p className="muted mt-8">Bois, tôle, ciment, sable, briques et plus encore.</p>
              </div>
              <ChevronRight size={24} color="var(--green)" />
            </div>
          </Link>
          <Link to="/estuaire" className="card-soft quick-action">
            <div className="flex between">
              <div>
                <h3 className="h3">Province de l'Estuaire</h3>
                <p className="muted mt-8">Devis, commandes et livraison dans l'Estuaire.</p>
              </div>
              <ChevronRight size={24} color="var(--blue)" />
            </div>
          </Link>
        </div>
      </section>

      {cart.count > 0 && (
        <div className="container section-tight">
          <div className="card flex between" style={{ background: 'linear-gradient(135deg,#dcfce7,#fef9c3)', border: 'none' }}>
            <span style={{ fontWeight: 600 }}><ShoppingCart size={18} style={{ display: 'inline', marginRight: 8 }} />{cart.count} article(s) dans votre panier — {cart.total.toLocaleString('fr-FR')} FCFA</span>
            <Link to="/panier" className="btn btn-primary btn-sm">Voir le panier</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ImageDownloadSection() {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('image')
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Veuillez choisir un fichier image.')
      return
    }
    setError(null)
    setDownloaded(false)
    setFileName(file.name.replace(/\.[^.]+$/, '') || 'image')
    const url = URL.createObjectURL(file)
    setSelectedUrl(url)
  }

  const handleDownload = () => {
    if (!selectedUrl) return
    setDownloading(true)
    const a = document.createElement('a')
    a.href = selectedUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setDownloading(false)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <section className="container section-tight">
      <div className="download-card fade-up">
        <div className="center" style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(22,163,74,.15)', color: 'var(--green)', margin: '0 auto 16px' }}>
          <Download size={28} />
        </div>
        <h2 className="h2">Télécharger une image</h2>
        <p className="lead mt-8" style={{ maxWidth: 480, margin: '8px auto 0' }}>
          Choisissez une image depuis votre appareil, prévisualisez-la, puis téléchargez-la en un clic.
        </p>

        <div style={{ marginTop: 24, maxWidth: 520, margin: '24px auto 0' }}>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

          {!selectedUrl ? (
            <div className="upload-zone" onClick={() => inputRef.current?.click()}>
              <ImagePlus size={36} color="var(--green)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontWeight: 600, fontSize: 16 }}>Cliquez pour choisir une image</p>
              <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>JPG, PNG, GIF, WebP — depuis votre appareil</p>
            </div>
          ) : (
            <div className="col gap-12" style={{ alignItems: 'center' }}>
              <div style={{ width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: '#fff' }}>
                <img src={selectedUrl} alt="Aperçu" style={{ width: '100%', maxHeight: 320, objectFit: 'contain' }} />
              </div>
              <div className="flex gap-12" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => inputRef.current?.click()}>
                  <ImagePlus size={18} /> Changer
                </button>
                <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
                  {downloaded ? <><Check size={18} /> Téléchargé !</> : <><Download size={18} /> Télécharger</>}
                </button>
              </div>
            </div>
          )}

          {error && <p style={{ color: 'var(--red)', fontSize: 14, marginTop: 12, fontWeight: 600 }}>{error}</p>}
        </div>
      </div>
    </section>
  )
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: number | null; label: string; color: string }) {
  return (
    <div className="flex gap-8" style={{ alignItems: 'center' }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{value !== null ? value.toLocaleString('fr-FR') : '2 min'}</div>
        <div className="muted" style={{ fontSize: 12.5 }}>{label}</div>
      </div>
    </div>
  )
}

function Feature({ icon, color, title, text }: { icon: React.ReactNode; color: string; title: string; text: string }) {
  return (
    <div className="card fade-up" style={{ textAlign: 'center' }}>
      <div className="center" style={{ width: 54, height: 54, borderRadius: 14, background: color + '15', color, margin: '0 auto 16px' }}>{icon}</div>
      <h3 className="h3" style={{ fontSize: 18 }}>{title}</h3>
      <p className="muted mt-8" style={{ fontSize: 14 }}>{text}</p>
    </div>
  )
}

async function supabaseCount(table: string): Promise<number> {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return count || 0
}
