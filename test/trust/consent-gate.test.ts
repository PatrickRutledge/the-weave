import { describe, it, expect } from 'vitest';
import { ConsentGate } from '../../src/trust/consent-gate.js';

describe('ConsentGate', () => {
  it('starts in pending state', () => {
    const gate = new ConsentGate();
    expect(gate.isActive()).toBe(false);
    expect(gate.getState()).toBe('pending');
  });

  it('grants consent', () => {
    const gate = new ConsentGate();
    gate.grant('user');
    expect(gate.isActive()).toBe(true);
    expect(gate.getState()).toBe('granted');
  });

  it('revokes consent', () => {
    const gate = new ConsentGate();
    gate.grant('user');
    gate.revoke('user', 'done');
    expect(gate.isActive()).toBe(false);
    expect(gate.getState()).toBe('revoked');
  });

  it('blocks input when no consent', () => {
    const gate = new ConsentGate();
    const result = gate.interceptInput('hello', 'user');
    expect(result.proceed).toBe(false);
    expect(result.reason).toContain('No active consent');
  });

  it('allows input when consent granted', () => {
    const gate = new ConsentGate();
    gate.grant('user');
    const result = gate.interceptInput('hello world', 'user');
    expect(result.proceed).toBe(true);
  });

  describe('safe word detection', () => {
    it('detects STOP', () => {
      const gate = new ConsentGate();
      gate.grant('user');
      const result = gate.interceptInput('STOP', 'user');
      expect(result.proceed).toBe(false);
      expect(result.reason).toContain('STOP');
      expect(gate.isActive()).toBe(false);
    });

    it('detects PAUSE', () => {
      const gate = new ConsentGate();
      gate.grant('user');
      const result = gate.interceptInput('PAUSE please', 'user');
      expect(result.proceed).toBe(false);
      expect(result.reason).toContain('PAUSE');
    });

    it('detects BREAK', () => {
      const gate = new ConsentGate();
      gate.grant('user');
      const result = gate.interceptInput('BREAK!', 'user');
      expect(result.proceed).toBe(false);
    });

    it('detects EXIT', () => {
      const gate = new ConsentGate();
      gate.grant('user');
      const result = gate.interceptInput('EXIT.', 'user');
      expect(result.proceed).toBe(false);
    });

    it('does not trigger on partial matches', () => {
      const gate = new ConsentGate();
      gate.grant('user');
      // "stopping" contains "stop" but shouldn't trigger
      const result = gate.interceptInput('I was stopping by the store', 'user');
      expect(result.proceed).toBe(true);
    });

    it('is case insensitive', () => {
      const gate = new ConsentGate();
      gate.grant('user');
      const result = gate.interceptInput('stop', 'user');
      expect(result.proceed).toBe(false);
    });
  });

  it('resets to pending', () => {
    const gate = new ConsentGate();
    gate.grant('user');
    gate.reset();
    expect(gate.getState()).toBe('pending');
    expect(gate.isActive()).toBe(false);
  });

  it('emits consent events', () => {
    const gate = new ConsentGate();
    const events: any[] = [];
    gate.on('consent', (e) => events.push(e));

    gate.grant('user');
    gate.revoke('user', 'test');

    expect(events.length).toBe(2);
    expect(events[0].type).toBe('grant');
    expect(events[1].type).toBe('revoke');
    expect(events[1].reason).toBe('test');
  });
});
