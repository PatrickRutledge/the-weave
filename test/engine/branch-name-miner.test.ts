import { describe, it, expect } from 'vitest';
import { BranchNameMiner } from '../../src/engine/branch-name-miner.js';
import type { BranchInfo } from '../../src/engine/types.js';

function branch(name: string): BranchInfo {
  return {
    name,
    lastCommitDate: '2026-01-01T00:00:00Z',
    commitCount: 1,
    isMerged: false,
    daysSinceLastCommit: 0,
  };
}

describe('BranchNameMiner', () => {
  const miner = new BranchNameMiner();

  describe('deploy targets', () => {
    it('detects PWA, store, mobile, and deploy targets', () => {
      const insights = miner.mine([
        branch('add-pwa-support'),
        branch('azure-deployment'),
        branch('desktop-package'),
        branch('gh-pages'),
        branch('mobile-app'),
        branch('store-package'),
      ]);
      expect(insights.deployTargets).toContain('pwa');
      expect(insights.deployTargets).toContain('azure');
      expect(insights.deployTargets).toContain('desktop');
      expect(insights.deployTargets).toContain('gh-pages');
      expect(insights.deployTargets).toContain('mobile');
      expect(insights.deployTargets).toContain('microsoft-store');
    });

    it('returns empty list when no deploy keywords present', () => {
      const insights = miner.mine([
        branch('main'),
        branch('feature/login'),
      ]);
      expect(insights.deployTargets).toEqual([]);
    });

    it('strips remotes/origin/ prefix before matching', () => {
      const insights = miner.mine([branch('remotes/origin/azure-deployment')]);
      expect(insights.deployTargets).toContain('azure');
    });
  });

  describe('intent prefixes', () => {
    it('classifies archive branches', () => {
      const insights = miner.mine([branch('archive/microsoft-store-mcp-v3')]);
      expect(insights.intents['archive/microsoft-store-mcp-v3']).toBe('archive');
    });

    it('classifies feature and fix prefixes', () => {
      const insights = miner.mine([
        branch('feature/oauth'),
        branch('fix/crash-on-startup'),
      ]);
      expect(insights.intents['feature/oauth']).toBe('feature');
      expect(insights.intents['fix/crash-on-startup']).toBe('fix');
    });

    it('leaves unclassified when no prefix matches', () => {
      const insights = miner.mine([branch('add-pwa-support')]);
      expect(insights.intents['add-pwa-support']).toBe('unclassified');
    });
  });
});
