/**
 * Event Manager for handling validation hooks and events
 */
class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    async emit(event, data) {
        if (!this.listeners.has(event)) return;

        const listeners = this.listeners.get(event);
        const promises = listeners.map(callback => {
            try {
                return Promise.resolve(callback(data));
            } catch (error) {
                console.error(`Error in event listener for '${event}':`, error);
                return Promise.resolve();
            }
        });

        await Promise.all(promises);
    }

    removeAllListeners(event = null) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    hasListeners(event) {
        return this.listeners.has(event) && this.listeners.get(event).length > 0;
    }
}

export default EventManager;
