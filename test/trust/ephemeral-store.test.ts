import { describe, it, expect, afterEach } from 'vitest';
import { EphemeralStore } from '../../src/trust/ephemeral-store.js';

describe('EphemeralStore', () => {
  let store: EphemeralStore<string>;

  afterEach(() => {
    store?.dispose();
  });

  it('creates and retrieves items', () => {
    store = new EphemeralStore<string>();
    const id = store.create('hello');
    expect(store.get(id)).toBe('hello');
  });

  it('returns undefined for missing items', () => {
    store = new EphemeralStore<string>();
    expect(store.get('nonexistent')).toBeUndefined();
  });

  it('expires items after TTL', async () => {
    store = new EphemeralStore<string>(100); // 100ms TTL
    const id = store.create('ephemeral');
    expect(store.get(id)).toBe('ephemeral');

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(store.get(id)).toBeUndefined();
  });

  it('purges all items', () => {
    store = new EphemeralStore<string>();
    store.create('a');
    store.create('b');
    store.create('c');
    expect(store.size).toBe(3);

    store.purgeAll();
    expect(store.size).toBe(0);
  });

  it('tracks size', () => {
    store = new EphemeralStore<string>();
    expect(store.size).toBe(0);
    store.create('x');
    expect(store.size).toBe(1);
    store.create('y');
    expect(store.size).toBe(2);
  });
});
