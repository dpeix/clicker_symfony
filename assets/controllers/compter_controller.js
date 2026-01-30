import { Controller } from '@hotwired/stimulus';
import { SimpleCounterStrategy } from '../strategies/SimpleCounterStrategy.js';
import { StepCounterStrategy } from '../strategies/StepCounterStrategy.js';
import { DisplayManager } from '../services/DisplayManager.js';
import { CounterState } from '../services/CounterState.js';

/**
 * Contrôleur Stimulus pour le compteur
 * Implémentation des principes SOLID et du pattern Strategy
 * 
 * Utilisation: data-controller="compter"
 * Options:
 *   - data-compter-initial-value: Valeur initiale (défaut: 0)
 *   - data-compter-step-value: Pas d'incrémentation (défaut: 1, utilise SimpleCounterStrategy)
 *   - data-compter-strategy-value: Type de stratégie ("simple" ou "step")
 */
export default class extends Controller {
    static values = {
        initial: { type: Number, default: 0 },
        step: { type: Number, default: 1 },
        strategy: { type: String, default: 'simple' }
    }

    static targets = ['count']

    /**
     * Initialisation du contrôleur
     * Respect du principe d'inversion de dépendance (DIP)
     */
    connect() {        
        // Initialisation des dépendances (DIP)
        this.counterState = new CounterState(this.hasInitialValue ? this.initialValue : 0);
        this.displayManager = new DisplayManager(this.hasCountTarget ? this.countTarget : null);
        this.counterStrategy = this.createStrategy();
        
        this.updateDisplay();
    }

    /**
     * Crée la stratégie appropriée selon la configuration
     * Respect du principe ouvert/fermé (OCP)
     * @returns {CounterStrategy}
     */
    createStrategy() {
        const strategyType = this.hasStrategyValue ? this.strategyValue : 'simple';
        const step = this.hasStepValue ? this.stepValue : 1;

        switch (strategyType) {
            case 'step':
                return new StepCounterStrategy(step);
            case 'simple':
            default:
                return step === 1 
                    ? new SimpleCounterStrategy() 
                    : new StepCounterStrategy(step);
        }
    }

    /**
     * Incrémente la valeur selon la stratégie configurée
     * Respect du principe de substitution de Liskov (LSP)
     */
    increment() {
        const newValue = this.counterStrategy.increment(this.counterState.getValue());
        this.counterState.setValue(newValue);
        this.updateDisplay();
    }

    /**
     * Décrémente la valeur selon la stratégie configurée
     * Respect du principe de substitution de Liskov (LSP)
     */
    decrement() {
        const newValue = this.counterStrategy.decrement(this.counterState.getValue());
        this.counterState.setValue(newValue);
        this.updateDisplay();
    }

    /**
     * Réinitialise le compteur à sa valeur initiale
     */
    reset() {
        this.counterState.reset();
        this.updateDisplay();
    }

    /**
     * Met à jour l'affichage via le gestionnaire d'affichage
     * Respect du principe de responsabilité unique (SRP)
     */
    updateDisplay() {
        this.displayManager.update(this.counterState.getValue());
    }

    /**
     * Permet de changer la stratégie dynamiquement
     * Utile pour l'extension du comportement (OCP)
     * @param {CounterStrategy} newStrategy
     */
    setStrategy(newStrategy) {
        this.counterStrategy = newStrategy;
    }
}
