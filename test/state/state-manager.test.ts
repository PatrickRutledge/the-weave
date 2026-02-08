import { describe, it, expect } from 'vitest';
import { StateManager } from '../../src/state/state-manager.js';
import type { Finding, Lesson } from '../../src/engine/types.js';

function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: Math.random().toString(36).slice(2, 10),
    perspective: 'testing',
    title: 'Test finding',
    description: 'A test finding',
    evidence: ['evidence 1'],
    severity: 'medium',
    category: 'pattern',
    ...overrides,
  };
}

describe('StateManager', () => {
  it('creates fresh state on construction', () => {
    const mgr = new StateManager();
    const state = mgr.getState();
    expect(state.id).toBeTruthy();
    expect(state.status).toBe('initializing');
    expect(state.findings).toEqual([]);
    expect(state.lessons).toEqual([]);
  });

  it('initializes a session', () => {
    const mgr = new StateManager();
    mgr.initialize('/repo', 'retrospective');
    const state = mgr.getState();
    expect(state.repositoryPath).toBe('/repo');
    expect(state.mode).toBe('retrospective');
    expect(state.status).toBe('analyzing');
  });

  describe('findings management', () => {
    it('sets findings and resets index', () => {
      const mgr = new StateManager();
      const findings = [makeFinding({ id: 'a' }), makeFinding({ id: 'b' })];
      mgr.setFindings(findings);
      expect(mgr.getState().findings.length).toBe(2);
      expect(mgr.getState().currentFindingIndex).toBe(0);
    });

    it('gets current finding', () => {
      const mgr = new StateManager();
      const f1 = makeFinding({ id: 'first' });
      const f2 = makeFinding({ id: 'second' });
      mgr.setFindings([f1, f2]);
      expect(mgr.getCurrentFinding()?.id).toBe('first');
    });

    it('advances finding', () => {
      const mgr = new StateManager();
      mgr.setFindings([makeFinding({ id: 'a' }), makeFinding({ id: 'b' })]);
      const next = mgr.advanceFinding();
      expect(next?.id).toBe('b');
    });

    it('returns undefined when past end', () => {
      const mgr = new StateManager();
      mgr.setFindings([makeFinding()]);
      mgr.advanceFinding();
      expect(mgr.getCurrentFinding()).toBeUndefined();
    });

    it('jumps to specific index', () => {
      const mgr = new StateManager();
      const findings = [makeFinding({ id: 'a' }), makeFinding({ id: 'b' }), makeFinding({ id: 'c' })];
      mgr.setFindings(findings);
      mgr.moveFindingTo(2);
      expect(mgr.getCurrentFinding()?.id).toBe('c');
    });

    it('prioritizes a finding', () => {
      const mgr = new StateManager();
      const findings = [makeFinding({ id: 'a' }), makeFinding({ id: 'b' }), makeFinding({ id: 'target' })];
      mgr.setFindings(findings);
      mgr.prioritizeFinding('target');
      // target should now be at index 1 (next after current)
      expect(mgr.getState().findings[1].id).toBe('target');
    });
  });

  describe('lessons', () => {
    it('captures lessons', () => {
      const mgr = new StateManager();
      const lesson: Lesson = {
        id: 'l1',
        findingId: 'f1',
        title: 'Test lesson',
        insight: 'We learned something',
        actionItems: ['Do something'],
        perspective: 'testing',
        capturedAt: new Date().toISOString(),
      };
      mgr.captureLesson(lesson);
      expect(mgr.getState().lessons.length).toBe(1);
      expect(mgr.getState().lessons[0].title).toBe('Test lesson');
    });
  });

  describe('progress', () => {
    it('reports progress correctly', () => {
      const mgr = new StateManager();
      mgr.setFindings([makeFinding(), makeFinding(), makeFinding()]);
      mgr.advanceFinding();

      const progress = mgr.getProgress();
      expect(progress.current).toBe(2);
      expect(progress.total).toBe(3);
      expect(progress.percent).toBe(33);
    });

    it('detects completion', () => {
      const mgr = new StateManager();
      mgr.setFindings([makeFinding()]);
      expect(mgr.isComplete()).toBe(false);
      mgr.advanceFinding();
      expect(mgr.isComplete()).toBe(true);
    });
  });

  it('resets to fresh state', () => {
    const mgr = new StateManager();
    mgr.initialize('/repo', 'investigation');
    mgr.setFindings([makeFinding()]);
    mgr.captureLesson({
      id: 'l1', findingId: 'f1', title: 't', insight: 'i',
      actionItems: [], perspective: 'p', capturedAt: '',
    });

    const oldId = mgr.getState().id;
    mgr.reset();
    const state = mgr.getState();
    expect(state.id).not.toBe(oldId);
    expect(state.findings).toEqual([]);
    expect(state.lessons).toEqual([]);
    expect(state.status).toBe('initializing');
  });
});
