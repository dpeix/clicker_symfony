/**
 * Gestionnaire d'état du compteur - Responsabilité unique (SRP)
 * S'occupe uniquement de la gestion de l'état
 */
export class CounterState {
    constructor(initialValue = 0) {
        this.value = initialValue;
        this.initialValue = initialValue;
    }

    /**
     * Obtient la valeur actuelle
     * @returns {number}
     */
    getValue() {
        return this.value;
    }

    /**
     * Définit une nouvelle valeur
     * @param {number} newValue
     */
    setValue(newValue) {
        this.value = newValue;
    }

    /**
     * Réinitialise à la valeur initiale
     */
    reset() {
        this.value = this.initialValue;
    }

    /**
     * Met à jour la valeur initiale
     * @param {number} newInitialValue
     */
    setInitialValue(newInitialValue) {
        this.initialValue = newInitialValue;
        this.value = newInitialValue;
    }
}
