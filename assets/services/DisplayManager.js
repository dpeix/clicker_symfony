/**
 * Gestionnaire d'affichage - Responsabilité unique (SRP)
 * S'occupe uniquement de la mise à jour de l'affichage
 */
export class DisplayManager {
    constructor(displayElement) {
        this.displayElement = displayElement;
    }

    /**
     * Met à jour l'affichage avec la nouvelle valeur
     * @param {number} value - Valeur à afficher
     */
    update(value) {
        if (!this.displayElement) {
            console.error('Élément d\'affichage non trouvé!');
            return;
        }
        
        this.displayElement.textContent = value;
        console.log('Affichage mis à jour à:', value);
    }

    /**
     * Vérifie si l'élément d'affichage est disponible
     * @returns {boolean}
     */
    isAvailable() {
        return this.displayElement !== null && this.displayElement !== undefined;
    }
}
