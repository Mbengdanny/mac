import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Truck, MapPin, ChevronRight, Eye, Users, ImagePlus, Upload, Check, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSiteImage, uploadSiteImage } from '../lib/hooks'

export default function Estuaire() {
  const [visitors, setVisitors] = useState(0)
  const [subs, setSubs] = useState(0)
  const estuaireImg = useSiteImage('estuaire')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    supabase.from('app_stats').select('value').eq('key', 'visitors').maybeSingle().then(({ data }) => {
      if (data) setVisitors((data as { value: number }).value)
    })
    supabase.from('subscribers').select('*', { count: 'exact', head: true }).then(({ count }) => {
      setSubs(count || 0)
    })
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadSiteImage('estuaire', file)
    if (url) {
      await supabase.from('site_images').insert({ location: 'estuaire', url })
      setToast(true)
      setTimeout(() => setToast(false), 3000)
      window.location.reload()
    }
    setUploading(false)
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="fade-up">
        <span className="pill pill-green"><MapPin size={14} /> Province de l'Estuaire</span>
        <h1 className="h1 mt-16" style={{ fontFamily: 'var(--font-arial)' }}>Services VLDMAC dans l'Estuaire</h1>
        <p className="lead mt-16" style={{ maxWidth: 640, fontFamily: 'var(--font-arial)' }}>
          La province de l'Estuaire permet actuellement de faire des devis et de lancer des commandes de matériaux de construction. Devis, commandes et livraison — tout en quelques clics.
        </p>
      </div>

      <div className="flex gap-24 mt-24" style={{ flexWrap: 'wrap' }}>
        <Stat icon={<Eye size={18} />} value={visitors} label="Visiteurs" color="var(--blue)" />
        <Stat icon={<Users size={18} />} value={subs} label="Abonnés" color="var(--green)" />
      </div>

      <div className="mt-24 fade-up" style={{ animationDelay: '.1s' }}>
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', aspectRatio: '21/9' }}>
          {estuaireImg ? (
            <img src={estuaireImg} alt="Province de l'Estuaire" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="hero-img-placeholder">
              <ImagePlus size={40} />
              <p style={{ fontSize: 14, textAlign: 'center' }}>Image de l'espace Estuaire<br />(téléversée depuis l'admin)</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-3 mt-32">
        <div className="card fade-up" style={{ textAlign: 'center' }}>
          <div className="center" style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--blue-light)', color: 'var(--blue)', margin: '0 auto 16px' }}><Truck size={24} /></div>
          <h3 className="h3" style={{ fontSize: 18 }}>Livraison 24h</h3>
          <p className="muted mt-8" style={{ fontSize: 14 }}>Livraison gratuite dès 65 pièces commandées dans l'Estuaire.</p>
        </div>
        <div className="card fade-up" style={{ textAlign: 'center', animationDelay: '.05s' }}>
          <div className="center" style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--green-light)', color: 'var(--green)', margin: '0 auto 16px' }}><FileText size={24} /></div>
          <h3 className="h3" style={{ fontSize: 18 }}>Devis & commandes</h3>
          <p className="muted mt-8" style={{ fontSize: 14 }}>Faites votre devis ou passez commande depuis l'Estuaire ou l'étranger.</p>
        </div>
        <div className="card fade-up" style={{ textAlign: 'center', animationDelay: '.1s' }}>
          <div className="center" style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--yellow-light)', color: 'var(--yellow-dark)', margin: '0 auto 16px' }}><MapPin size={24} /></div>
          <h3 className="h3" style={{ fontSize: 18 }}>Chef-lieu</h3>
          <p className="muted mt-8" style={{ fontSize: 14 }}>Prix et conditions de livraison valables pour le chef-lieu de l'Estuaire.</p>
        </div>
      </div>

      <div className="card mt-24" style={{ borderLeft: '4px solid var(--green)' }}>
        <h3 className="flex gap-8" style={{ alignItems: 'center', marginBottom: 12 }}><Info size={18} color="var(--green)" /> Règles de livraison</h3>
        <ul className="col gap-8" style={{ fontSize: 15, paddingLeft: 0, listStyle: 'none' }}>
          <li className="flex gap-8"><Check size={18} color="var(--green)" /> Livraison <strong>offerte</strong> à partir de <strong>65 pièces</strong> commandées.</li>
          <li className="flex gap-8"><Check size={18} color="var(--green)" /> En dessous de 65 pièces : frais de transport de <strong>10 000 FCFA</strong>.</li>
          <li className="flex gap-8"><Check size={18} color="var(--green)" /> Prix et conditions valables uniquement pour le <strong>chef-lieu de l'Estuaire</strong>.</li>
        </ul>
      </div>

      <div className="grid grid-2 mt-32">
        <Link to="/devis" className="card-soft quick-action">
          <div className="flex between">
            <div>
              <h3 className="h3">Faire un devis</h3>
              <p className="muted mt-8">Générez un pro forma pour vos matériaux.</p>
            </div>
            <ChevronRight size={24} color="var(--blue)" />
          </div>
        </Link>
        <Link to="/catalogue" className="card-soft quick-action">
          <div className="flex between">
            <div>
              <h3 className="h3">Commander</h3>
              <p className="muted mt-8">Parcourez le catalogue et passez commande.</p>
            </div>
            <ChevronRight size={24} color="var(--green)" />
          </div>
        </Link>
      </div>

      <div className="card mt-24" style={{ textAlign: 'center' }}>
        <h3 className="h3">Téléverser une image pour l'Estuaire</h3>
        <p className="muted mt-8" style={{ fontSize: 14 }}>Embellissez cet espace avec une image de votre choix.</p>
        <label className="btn btn-primary mt-16" style={{ cursor: 'pointer' }}>
          {uploading ? 'Téléversement...' : <><Upload size={18} /> Choisir une image</>}
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
        {toast && <p style={{ color: 'var(--green)', marginTop: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><Check size={16} /> Image téléversée !</p>}
      </div>
    </div>
  )
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className="flex gap-8" style={{ alignItems: 'center' }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{value.toLocaleString('fr-FR')}</div>
        <div className="muted" style={{ fontSize: 12.5 }}>{label}</div>
      </div>
    </div>
  )
}
