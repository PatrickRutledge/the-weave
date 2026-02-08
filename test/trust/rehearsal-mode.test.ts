import { describe, it, expect, afterEach } from 'vitest';
import { RehearsalMode } from '../../src/trust/rehearsal-mode.js';

describe('RehearsalMode', () => {
  let rehearsal: RehearsalMode;

  afterEach(() => {
    rehearsal?.dispose();
  });

  it('starts inactive', () => {
    rehearsal = new RehearsalMode();
    expect(rehearsal.isActive()).toBe(false);
  });

  it('can be started', () => {
    rehearsal = new RehearsalMode();
    rehearsal.start();
    expect(rehearsal.isActive()).toBe(true);
  });

  it('blocks save operations when active', () => {
    rehearsal = new RehearsalMode();
    rehearsal.start();
    expect(() => rehearsal.assertNotRehearsal('save lessons')).toThrow('rehearsal mode');
  });

  it('allows operations when inactive', () => {
    rehearsal = new RehearsalMode();
    expect(() => rehearsal.assertNotRehearsal('save lessons')).not.toThrow();
  });

  it('purges everything on end', () => {
    rehearsal = new RehearsalMode();
    rehearsal.start();
    rehearsal.create({ data: 'test' });
    rehearsal.create({ data: 'test2' });
    expect(rehearsal.size).toBe(2);

    const message = rehearsal.end();
    expect(rehearsal.isActive()).toBe(false);
    expect(rehearsal.size).toBe(0);
    expect(message).toContain('forgotten');
  });
});
