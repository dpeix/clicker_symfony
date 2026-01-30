import { CounterStrategy } from './CounterStrategy.js';

/**
 * Stratégie de comptage simple (incrément/décrément de 1)
 * Respect du principe de substitution de Liskov (LSP)
 */
export class SimpleCounterStrategy extends CounterStrategy {
    increment(currentValue) {
        return currentValue + 1;
    }

    decrement(currentValue) {
        return currentValue - 1;
    }
}
