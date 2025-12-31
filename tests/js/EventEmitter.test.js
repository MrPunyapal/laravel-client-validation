import { describe, it, expect, beforeEach } from 'vitest';
import EventEmitter from '../../resources/js/core/EventEmitter.js';

describe('EventEmitter', () => {
    let emitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('on', () => {
        it('registers event listener', async () => {
            let called = false;
            emitter.on('test', () => { called = true; });

            await emitter.emit('test');
            expect(called).toBe(true);
        });

        it('supports multiple listeners for same event', async () => {
            let count = 0;
            emitter.on('test', () => { count++; });
            emitter.on('test', () => { count++; });

            await emitter.emit('test');
            expect(count).toBe(2);
        });

        it('returns unsubscribe function', async () => {
            let called = false;
            const unsubscribe = emitter.on('test', () => { called = true; });

            unsubscribe();
            await emitter.emit('test');
            expect(called).toBe(false);
        });
    });

    describe('once', () => {
        it('listener fires only once', async () => {
            let count = 0;
            emitter.once('test', () => { count++; });

            await emitter.emit('test');
            await emitter.emit('test');
            expect(count).toBe(1);
        });
    });

    describe('off', () => {
        it('removes specific listener', async () => {
            let called = false;
            const callback = () => { called = true; };

            emitter.on('test', callback);
            emitter.off('test', callback);

            await emitter.emit('test');
            expect(called).toBe(false);
        });

        it('handles non-existent event gracefully', () => {
            expect(() => emitter.off('nonexistent', () => {})).not.toThrow();
        });
    });

    describe('emit', () => {
        it('passes data to listeners', async () => {
            let receivedData = null;
            emitter.on('test', (data) => { receivedData = data; });

            await emitter.emit('test', { message: 'hello' });
            expect(receivedData).toEqual({ message: 'hello' });
        });

        it('handles non-existent event gracefully', async () => {
            await expect(emitter.emit('nonexistent')).resolves.toBeUndefined();
        });

        it('awaits async listeners', async () => {
            const results = [];

            emitter.on('test', async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                results.push('first');
            });

            emitter.on('test', () => {
                results.push('second');
            });

            await emitter.emit('test');
            expect(results).toEqual(['first', 'second']);
        });
    });

    describe('removeAll', () => {
        it('removes all listeners', async () => {
            let called = false;
            emitter.on('test1', () => { called = true; });
            emitter.on('test2', () => { called = true; });

            emitter.removeAll();

            await emitter.emit('test1');
            await emitter.emit('test2');
            expect(called).toBe(false);
        });
    });
});
