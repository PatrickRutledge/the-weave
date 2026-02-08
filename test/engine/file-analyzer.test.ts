import { describe, it, expect } from 'vitest';
import { FileAnalyzer } from '../../src/engine/file-analyzer.js';
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

describe('FileAnalyzer', () => {
  const analyzer = new FileAnalyzer();

  describe('analyzeHotspots', () => {
    it('identifies frequently changed files', () => {
      const commits = [
        makeCommit({ files: ['src/index.ts', 'src/utils.ts'] }),
        makeCommit({ files: ['src/index.ts'] }),
        makeCommit({ files: ['src/index.ts', 'src/config.ts'] }),
        makeCommit({ files: ['src/index.ts'] }),
      ];

      const hotspots = analyzer.analyzeHotspots(commits);
      expect(hotspots.length).toBeGreaterThanOrEqual(1);
      expect(hotspots[0].path).toBe('src/index.ts');
      expect(hotspots[0].changeCount).toBe(4);
    });

    it('respects minChanges threshold', () => {
      const commits = [
        makeCommit({ files: ['src/a.ts'] }),
        makeCommit({ files: ['src/a.ts'] }),
      ];

      const hotspots = analyzer.analyzeHotspots(commits, 3);
      expect(hotspots.length).toBe(0);
    });

    it('tracks unique authors', () => {
      const commits = [
        makeCommit({ files: ['src/shared.ts'], author: 'Alice' }),
        makeCommit({ files: ['src/shared.ts'], author: 'Bob' }),
        makeCommit({ files: ['src/shared.ts'], author: 'Alice' }),
      ];

      const hotspots = analyzer.analyzeHotspots(commits);
      expect(hotspots[0].uniqueAuthors).toBe(2);
    });
  });

  describe('analyzeCoupledFiles', () => {
    it('finds files that change together', () => {
      const commits = [
        makeCommit({ files: ['src/model.ts', 'src/schema.ts'] }),
        makeCommit({ files: ['src/model.ts', 'src/schema.ts'] }),
        makeCommit({ files: ['src/model.ts', 'src/schema.ts'] }),
      ];

      const coupled = analyzer.analyzeCoupledFiles(commits);
      expect(coupled.length).toBeGreaterThanOrEqual(1);
      expect(coupled[0].coChangeCount).toBe(3);
    });

    it('does not flag loosely coupled files', () => {
      const commits = [
        makeCommit({ files: ['src/a.ts', 'src/b.ts'] }),
        makeCommit({ files: ['src/a.ts', 'src/c.ts'] }),
      ];

      const coupled = analyzer.analyzeCoupledFiles(commits);
      expect(coupled.length).toBe(0);
    });
  });

  describe('analyzeChurn', () => {
    it('returns files sorted by churn', () => {
      const commits = [
        makeCommit({ files: ['src/stable.ts'] }),
        makeCommit({ files: ['src/volatile.ts'] }),
        makeCommit({ files: ['src/volatile.ts'] }),
        makeCommit({ files: ['src/volatile.ts'] }),
      ];

      const churn = analyzer.analyzeChurn(commits);
      expect(churn[0].file).toBe('src/volatile.ts');
      expect(churn[0].churn).toBe(3);
    });
  });
});
