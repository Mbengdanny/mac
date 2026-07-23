import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Trash2, Search, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Eleve {
  id: string
  nom: string
  prenom: string
  classe: string
  matricule: string
  created_at: string
}

export default function Eleves() {
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [loading, setLoading] = useState(true)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [classe, setClasse] = useState('')
  const [matricule, setMatricule] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEleves = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('eleves')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError('Impossible de charger la liste des eleves.')
    } else {
      setEleves((data as Eleve[]) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEleves()
  }, [fetchEleves])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!nom.trim() || !prenom.trim() || !classe.trim() || !matricule.trim()) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    const { error: err } = await supabase
      .from('eleves')
      .insert({ nom: nom.trim(), prenom: prenom.trim(), classe: classe.trim(), matricule: matricule.trim() })

    if (err) {
      if (err.code === '23505') {
        setError('Ce matricule existe deja. Veuillez en choisir un autre.')
      } else {
        setError("Erreur lors de l'ajout de l'eleve.")
      }
      return
    }

    setSuccess('Eleve ajoute avec succes !')
    setNom(''); setPrenom(''); setClasse(''); setMatricule('')
    fetchEleves()
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error: err } = await supabase.from('eleves').delete().eq('id', id)
    if (err) {
      setError('Erreur lors de la suppression.')
    } else {
      setEleves(prev => prev.filter(e => e.id !== id))
      setSuccess('Eleve supprime.')
      setTimeout(() => setSuccess(null), 3000)
    }
    setDeletingId(null)
  }

  const filtered = eleves.filter(e => {
    const q = query.toLowerCase()
    return e.nom.toLowerCase().includes(q) || e.prenom.toLowerCase().includes(q) || e.matricule.toLowerCase().includes(q) || e.classe.toLowerCase().includes(q)
  })

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 960 }}>
      <div className="flex gap-12" style={{ alignItems: 'center', marginBottom: 8 }}>
        <div className="center" style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-light)', color: 'var(--green)', flexShrink: 0 }}>
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="h2">Gestion des eleves</h1>
          <p className="muted" style={{ fontSize: 14 }}>Ajoutez, consultez et supprimez les eleves.</p>
        </div>
      </div>

      <div className="card mt-24">
        <h3 className="h3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={20} color="var(--green)" /> Ajouter un eleve
        </h3>
        <form onSubmit={handleAdd} className="mt-16">
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input className="form-input" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Moundounga" />
            </div>
            <div className="form-group">
              <label className="form-label">Prenom *</label>
              <input className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ex: Jean" />
            </div>
            <div className="form-group">
              <label className="form-label">Classe *</label>
              <input className="form-input" value={classe} onChange={e => setClasse(e.target.value)} placeholder="Ex: Terminale D" />
            </div>
            <div className="form-group">
              <label className="form-label">Matricule * (unique)</label>
              <input className="form-input" value={matricule} onChange={e => setMatricule(e.target.value)} placeholder="Ex: 2026-001" />
            </div>
          </div>
          {error && (
            <p style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <AlertCircle size={16} /> {error}
            </p>
          )}
          {success && (
            <p style={{ color: 'var(--green)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <CheckCircle2 size={16} /> {success}
            </p>
          )}
          <button type="submit" className="btn btn-primary"><UserPlus size={18} /> Ajouter</button>
        </form>
      </div>

      <div className="flex between mt-24" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h3 className="h3" style={{ margin: 0 }}>Liste des eleves ({filtered.length})</h3>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input className="form-input" style={{ paddingLeft: 40, width: 240 }} placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="card"><p className="muted">Chargement...</p></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <GraduationCap size={36} color="var(--gray-300)" style={{ margin: '0 auto 12px' }} />
          <p className="muted">{query ? 'Aucun eleve trouve.' : 'Aucun eleve pour le moment. Ajoutez-en un ci-dessus.'}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prenom</th>
                <th>Classe</th>
                <th>Matricule</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.nom}</td>
                  <td>{e.prenom}</td>
                  <td>{e.classe}</td>
                  <td><span className="badge badge-created">{e.matricule}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                    >
                      <Trash2 size={16} /> {deletingId === e.id ? '...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
