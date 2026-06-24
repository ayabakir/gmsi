// gmsi-mono/frontend/src/modules/connaissances/pages/BaseConnaissances.jsx
import { useEffect, useReducer, useState } from 'react'
import { Search, BookOpen } from 'lucide-react'
import { connaissancesApi } from '../api/connaissances.api.js'
import api from '../../../api/axiosConfig.js'
import FicheCard from '../components/FicheCard.jsx'
import FicheDetailModal from '../components/FicheDetailModal.jsx'

function reducer(state, action) {
    switch (action.type) {
        case 'LOADING':   return { ...state, loading: true }
        case 'SUCCESS':   return { loading: false, fiches: action.data }
        case 'ERROR':     return { loading: false, fiches: [] }
        default:          return state
    }
}

export default function BaseConnaissances() {
    const [state, dispatch]              = useReducer(reducer, { loading: false, fiches: [] })
    const [categories,  setCategories]   = useState([])
    const [motCle,      setMotCle]       = useState('')
    const [categorieId, setCategorieId]  = useState('')
    const [ficheDetail, setFicheDetail]  = useState(null)

    useEffect(() => {
        api.get('/api/admin/categories')
            .then(r => setCategories(r.data))
            .catch(() => {})
    }, [])

    useEffect(() => {
        dispatch({ type: 'LOADING' })
        connaissancesApi.listerToutes()
            .then(r => dispatch({ type: 'SUCCESS', data: r.data }))
            .catch(() => dispatch({ type: 'ERROR' }))
    }, [])

    const rechercher = () => {
        dispatch({ type: 'LOADING' })
        connaissancesApi.rechercher(categorieId || null, motCle || null)
            .then(r => dispatch({ type: 'SUCCESS', data: r.data }))
            .catch(() => dispatch({ type: 'ERROR' }))
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* En-tête */}
                <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-1">
                        <BookOpen size={22} className="text-[#1B7A5A]" />
                        <h1 className="text-slate-900 font-semibold text-xl">Base de connaissances</h1>
                    </div>
                    <p className="text-slate-500 text-sm pl-9">
                        Consultez les fiches de pannes résolues et leurs solutions.
                    </p>
                </div>

                {/* Barre de recherche */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Mot-clé, type de panne…"
                            value={motCle}
                            onChange={e => setMotCle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && rechercher()}
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                        />
                    </div>
                    <select
                        value={categorieId}
                        onChange={e => setCategorieId(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent bg-white min-w-[160px]"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.libelle}</option>
                        ))}
                    </select>
                    <button
                        onClick={rechercher}
                        className="bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2.5 px-5 rounded-lg transition-colors text-sm"
                    >
                        Rechercher
                    </button>
                </div>

                {/* Résultats */}
                {state.loading ? (
                    <div className="text-center py-16 text-slate-400 text-sm">Chargement…</div>
                ) : state.fiches.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-sm">Aucune fiche trouvée.</div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-slate-500 text-sm">
                            {state.fiches.length} fiche{state.fiches.length > 1 ? 's' : ''} trouvée{state.fiches.length > 1 ? 's' : ''}
                        </p>
                        {state.fiches.map(f => (
                            <FicheCard
                                key={f.id}
                                fiche={f}
                                motCle={motCle}
                                onClick={() => setFicheDetail(f)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <FicheDetailModal fiche={ficheDetail} onClose={() => setFicheDetail(null)} />
        </div>
    )
}