import { describe, it, expect } from 'vitest';
import { MessageMiner } from '../../src/engine/message-miner.js';
import type { CommitInfo } from '../../src/engine/types.js';

function commit(overrides: Partial<CommitInfo> = {}): CommitInfo {
  return {
    hash: 'abc1234',
    date: '2026-01-01T00:00:00Z',
    message: 'commit',
    author: 'test',
    files: [],
    ...overrides,
  };
}

describe('MessageMiner', () => {
  const miner = new MessageMiner();

  describe('pivots', () => {
    it('detects rewrite language', () => {
      const signals = miner.mine([
        commit({ message: 'Rewrite as The Weaver — full MCP server implementation' }),
      ]);
      expect(signals.pivots).toHaveLength(1);
      expect(signals.pivots[0].kind).toBe('rewrite');
    });

    it('detects migration language', () => {
      const signals = miner.mine([
        commit({ message: 'Migrate from Webpack to Vite' }),
      ]);
      expect(signals.pivots).toHaveLength(1);
      expect(signals.pivots[0].kind).toBe('migrate');
    });

    it('detects technology switches', () => {
      const signals = miner.mine([
        commit({ message: 'Switch to esbuild from webpack' }),
      ]);
      expect(signals.pivots).toHaveLength(1);
      expect(signals.pivots[0].kind).toBe('switch');
    });

    it('detects overhauls', () => {
      const signals = miner.mine([
        commit({ message: 'Major refactor of the orchestrator' }),
      ]);
      expect(signals.pivots).toHaveLength(1);
      expect(signals.pivots[0].kind).toBe('overhaul');
    });

    it('does not false-fire on neutral commits', () => {
      const signals = miner.mine([
        commit({ message: 'Add test for edge case' }),
        commit({ message: 'Update README' }),
      ]);
      expect(signals.pivots).toHaveLength(0);
    });
  });

  describe('phase markers', () => {
    it('detects Phase N style', () => {
      const signals = miner.mine([
        commit({ message: 'Phase 8 test suite — 81 tests, all passing' }),
      ]);
      expect(signals.phaseMarkers).toHaveLength(1);
      expect(signals.phaseMarkers[0].phase).toMatch(/phase\s+8/i);
    });

    it('detects Milestone N', () => {
      const signals = miner.mine([
        commit({ message: 'Milestone 3 complete — auth flow merged' }),
      ]);
      expect(signals.phaseMarkers).toHaveLength(1);
    });

    it('does not false-fire on "build steps"', () => {
      const signals = miner.mine([
        commit({ message: 'Add Node.js setup and build steps to workflow' }),
      ]);
      expect(signals.phaseMarkers).toHaveLength(0);
    });

    it('does not match single-letter suffixes', () => {
      const signals = miner.mine([
        commit({ message: 'phased rollout starts Tuesday' }),
        commit({ message: 'stepwise refactor' }),
      ]);
      expect(signals.phaseMarkers).toHaveLength(0);
    });
  });

  describe('fix sequences', () => {
    it('detects 3+ consecutive fix commits', () => {
      const signals = miner.mine([
        commit({ hash: 'a', date: '2026-01-01T00:00:00Z', message: 'Fix base path' }),
        commit({ hash: 'b', date: '2026-01-02T00:00:00Z', message: 'Fix base path again' }),
        commit({ hash: 'c', date: '2026-01-03T00:00:00Z', message: 'Fix base path for real' }),
      ]);
      expect(signals.fixSequences).toHaveLength(1);
      expect(signals.fixSequences[0].commitCount).toBe(3);
    });

    it('ignores fix commits broken by non-fix commits', () => {
      const signals = miner.mine([
        commit({ hash: 'a', date: '2026-01-01T00:00:00Z', message: 'Fix thing' }),
        commit({ hash: 'b', date: '2026-01-02T00:00:00Z', message: 'Add feature' }),
        commit({ hash: 'c', date: '2026-01-03T00:00:00Z', message: 'Fix other' }),
      ]);
      expect(signals.fixSequences).toHaveLength(0);
    });

    it('infers a topic from the fix messages', () => {
      const signals = miner.mine([
        commit({ hash: 'a', date: '2026-01-01T00:00:00Z', message: 'Fix manifest icons' }),
        commit({ hash: 'b', date: '2026-01-02T00:00:00Z', message: 'Fix manifest URL' }),
        commit({ hash: 'c', date: '2026-01-03T00:00:00Z', message: 'Fix manifest short_name' }),
      ]);
      expect(signals.fixSequences[0].topic).toBe('manifest');
    });
  });
});
