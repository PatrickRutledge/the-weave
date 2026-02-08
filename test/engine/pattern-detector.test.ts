import { describe, it, expect } from 'vitest';
import { PatternDetector } from '../../src/engine/pattern-detector.js';
import type { CommitInfo } from '../../src/engine/types.js';

function makeCommit(overrides: Partial<CommitInfo> = {}): CommitInfo {
  return {
    hash: Math.random().toString(36).slice(2, 10),
    date: new Date().toISOString(),
    message: 'test commit',
    author: 'Test User',
    files: [],
    ...overrides,
  };
}

describe('PatternDetector', () => {
  const detector = new PatternDetector();

  describe('analyzeSentiment', () => {
    it('detects frustration patterns', () => {
      const commits = [
        makeCommit({ message: 'still broken after third attempt' }),
        makeCommit({ message: 'trying again with different approach' }),
        makeCommit({ message: 'hotfix for broken build' }),
      ];

      const results = detector.detectPatterns(commits);
      const frustrations = results.sentimentIndicators.filter(s => s.type === 'frustration');
      expect(frustrations.length).toBeGreaterThanOrEqual(2);
    });

    it('detects breakthrough patterns', () => {
      const commits = [
        makeCommit({ message: 'finally fixed the auth flow properly' }),
        makeCommit({ message: 'refactor: clean up payment module' }),
      ];

      const results = detector.detectPatterns(commits);
      const breakthroughs = results.sentimentIndicators.filter(s => s.type === 'breakthrough');
      expect(breakthroughs.length).toBeGreaterThanOrEqual(1);
    });

    it('detects urgency patterns', () => {
      const commits = [
        makeCommit({ message: 'ASAP: fix production crash' }),
        makeCommit({ message: 'critical security patch' }),
      ];

      const results = detector.detectPatterns(commits);
      const urgencies = results.sentimentIndicators.filter(s => s.type === 'urgency');
      expect(urgencies.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty for neutral commits', () => {
      const commits = [
        makeCommit({ message: 'add user model' }),
        makeCommit({ message: 'update README' }),
      ];

      const results = detector.detectPatterns(commits);
      expect(results.sentimentIndicators.length).toBe(0);
    });
  });

  describe('findTimeSinks', () => {
    it('detects topics with many commits', () => {
      const commits = Array.from({ length: 12 }, (_, i) =>
        makeCommit({ message: `[auth] iteration ${i + 1}`, files: ['src/auth.ts'] })
      );

      const results = detector.detectPatterns(commits);
      expect(results.timeSinks.length).toBeGreaterThanOrEqual(1);
      expect(results.timeSinks[0].topic).toBe('auth');
    });

    it('does not flag topics with few commits', () => {
      const commits = [
        makeCommit({ message: '[ui] add button' }),
        makeCommit({ message: '[ui] style button' }),
      ];

      const results = detector.detectPatterns(commits);
      expect(results.timeSinks.length).toBe(0);
    });
  });

  describe('findCircularDevelopment', () => {
    it('detects files with repeated fix patterns', () => {
      const commits = [
        makeCommit({ message: 'fix auth logic', files: ['src/auth.ts'] }),
        makeCommit({ message: 'fix auth edge case', files: ['src/auth.ts'] }),
        makeCommit({ message: 'fix auth again', files: ['src/auth.ts'] }),
        makeCommit({ message: 'another fix for auth', files: ['src/auth.ts'] }),
        makeCommit({ message: 'update auth handler', files: ['src/auth.ts'] }),
      ];

      const results = detector.detectPatterns(commits);
      const circular = results.circularDevelopment.filter(c =>
        c.description.includes('auth.ts')
      );
      expect(circular.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('analyzeMessagePatterns', () => {
    it('extracts common prefixes', () => {
      const commits = [
        makeCommit({ message: 'fix: broken login' }),
        makeCommit({ message: 'fix: null pointer' }),
        makeCommit({ message: 'fix: missing import' }),
        makeCommit({ message: 'feat: add dashboard' }),
        makeCommit({ message: 'feat: add settings' }),
      ];

      const results = detector.detectPatterns(commits);
      expect(results.commitMessagePatterns.length).toBeGreaterThanOrEqual(1);

      const fixPattern = results.commitMessagePatterns.find(p => p.pattern.includes('fix'));
      expect(fixPattern).toBeDefined();
      expect(fixPattern!.count).toBe(3);
    });
  });
});
