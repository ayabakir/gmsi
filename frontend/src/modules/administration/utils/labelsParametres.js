// frontend/src/modules/administration/utils/labelsParametres.js

/**
 * Traduit les clés techniques des paramètres système en libellés lisibles.
 * Si une clé n'est pas dans cette table (ex: nouveau paramètre ajouté
 * plus tard par Aya), on retombe sur la clé brute en sous-titre — rien
 * ne casse, l'affichage reste juste moins joli.
 */
const LIBELLES = {
    COEFF_FACILE: { titre: 'Facile', sousTitre: 'Scoring · coefficient' },
    COEFF_MOYEN: { titre: 'Moyen', sousTitre: 'Scoring · coefficient' },
    COEFF_DIFFICILE: { titre: 'Difficile', sousTitre: 'Scoring · coefficient' },
    COEFF_CRITIQUE: { titre: 'Critique', sousTitre: 'Scoring · coefficient' },
    ANONYMAT_EVALUATION: { titre: 'Anonymat des évaluations', sousTitre: 'Confidentialité' },
}

export const libelleParametre = (cle) => {
    return LIBELLES[cle] || { titre: cle, sousTitre: 'Paramètre système' }
}

export const estCoefficient = (cle) => cle.startsWith('COEFF_')