// frontend/src/modules/administration/pages/Parametres.jsx
import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { listerParametres, modifierParametre } from '../api/parametres.api'
import ParametreRow from '../components/ParametreRow'

export default function Parametres() {
    const [parametres, setParametres] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState(null)

    const charger = async () => {
        setChargement(true)
        setErreur(null)
        try {
            const data = await listerParametres()
            setParametres(data)
        } catch (err) {
            console.error('Erreur lors du chargement des paramètres :', err)
            setErreur('Impossible de charger les paramètres système.')
        } finally {
            setChargement(false)
        }
    }

    useEffect(() => {
        charger()
    }, [])

    const sauvegarder = async (cle, valeur) => {
        const parametreActuel = parametres.find((p) => p.cle === cle)
        const miseAJour = await modifierParametre(cle, {
            valeur,
            description: parametreActuel?.description,
        })
        setParametres((prev) =>
            prev.map((p) => (p.cle === cle ? miseAJour : p))
        )
    }

    return (
        <div className="bg-gradient-to-b from-[#E8F5EE] via-[#F2F9F5] to-white min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-green-50 text-[#1B7A5A] rounded-lg p-2">
                        <Settings size={16} />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">Paramètres</h1>
                        <p className="text-xs text-slate-500">Coefficients de scoring et réglages globaux</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {chargement ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            Chargement…
                        </div>
                    ) : erreur ? (
                        <div className="p-8 text-center text-sm text-red-700">{erreur}</div>
                    ) : parametres.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            Aucun paramètre trouvé.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Paramètre</th>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Valeur</th>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Modifié le</th>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Par</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {parametres.map((parametre) => (
                                <ParametreRow
                                    key={parametre.cle}
                                    parametre={parametre}
                                    onSauvegarder={sauvegarder}
                                />
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}