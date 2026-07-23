import { Link } from 'react-router-dom'
import { FileText, ShoppingCart, Truck, MapPin, ChevronRight, Building2 } from 'lucide-react'

export default function Estuaire() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="fade-up">
        <span className="pill pill-green"><MapPin size={14} /> Province de l'Estuaire</span>
        <h1 className="h1 mt-16">Services VLDMAC dans l'Estuaire</h1>
        <p className="lead mt-16" style={{ maxWidth: 640 }}>
          Devis, commandes et livraison de matériaux de construction dans toute la province de l'Estuaire : Owendo, Akanda, Libreville et au-delà.
        </p>
      </div>

      <div className="grid grid-3 mt-32">
        <div className="card fade-up" style={{ textAlign: 'center' }}>
          <div className="center" style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(37,99,235,.1)', color: 'var(--blue)', margin: '0 auto 16px' }}><Building2 size={24} /></div>
          <h3 className="h3" style={{ fontSize: 18 }}>Zones desservies</h3>
          <p className="muted mt-8" style={{ fontSize: 14 }}>Owendo, Akanda, Libreville et toute la province de l'Estuaire.</p>
        </div>
        <div className="card fade-up" style={{ textAlign: 'center', animationDelay: '.05s' }}>
          <div className="center" style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(22,163,74,.1)', color: 'var(--green)', margin: '0 auto 16px' }}><Truck size={24} /></div>
          <h3 className="h3" style={{ fontSize: 18 }}>Livraison 24h</h3>
          <p className="muted mt-8" style={{ fontSize: 14 }}>Livraison gratuite dès 65 pièces commandées dans l'Estuaire.</p>
        </div>
        <div className="card fade-up" style={{ textAlign: 'center', animationDelay: '.1s' }}>
          <div className="center" style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(202,138,4,.1)', color: 'var(--yellow-dark)', margin: '0 auto 16px' }}><FileText size={24} /></div>
          <h3 className="h3" style={{ fontSize: 18 }}>Devis local</h3>
          <p className="muted mt-8" style={{ fontSize: 14 }}>Obtenez un devis adapté à votre zone de livraison dans l'Estuaire.</p>
        </div>
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
    </div>
  )
}
