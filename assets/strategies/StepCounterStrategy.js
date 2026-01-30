import { CounterStrategy } from './CounterStrategy.js';

/**
 * Stratégie de comptage par pas personnalisé
 * Respect du principe ouvert/fermé (OCP) - extensible sans modification
 */
export class StepCounterStrategy extends CounterStrategy {
    constructor(step = 1) {
        super();
        this.step = step;
    }

    increment(currentValue) {
        return currentValue + this.step;
    }

    decrement(currentValue) {
        return currentValue - this.step;
    }
}
