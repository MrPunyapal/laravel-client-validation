/**
 * Simple Event Emitter for validation hooks.
 */
export default class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(event, callback) {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event).push(callback);
        return () => this.off(event, callback);
    }

    once(event, callback) {
        const wrapper = (...args) => {
            this.off(event, wrapper);
            callback(...args);
        };
        this.on(event, wrapper);
    }

    off(event, callback) {
        if (!this.events.has(event)) return;
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
    }

    async emit(event, data) {
        if (!this.events.has(event)) return;
        for (const callback of this.events.get(event)) {
            await callback(data);
        }
    }

    removeAll() {
        this.events.clear();
    }
}
