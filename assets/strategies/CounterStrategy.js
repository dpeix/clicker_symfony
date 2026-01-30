/**
 * Interface abstraite pour les stratégies de comptage
 * Respect du principe d'inversion de dépendance (DIP)
 */
export class CounterStrategy {
    /**
     * Calcule la nouvelle valeur après incrémentation
     * @param {number} currentValue - Valeur actuelle
     * @returns {number} Nouvelle valeur
     */
    increment(currentValue) {
        throw new Error('Méthode increment() doit être implémentée');
    }

    /**
     * Calcule la nouvelle valeur après décrémentation
     * @param {number} currentValue - Valeur actuelle
     * @returns {number} Nouvelle valeur
     */
    decrement(currentValue) {
        throw new Error('Méthode decrement() doit être implémentée');
    }
}
