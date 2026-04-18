import type { BranchInfo, BranchInsights } from './types.js';

/**
 * Mines branch *names* for intent and deployment-target pivots.
 *
 * Branch names carry free metadata about what work was being tried —
 * "azure-deployment" vs "gh-pages" vs "store-package" collectively tell a
 * story that the branch-count alone misses entirely.
 */
export class BranchNameMiner {
  private static readonly DEPLOY_TARGETS: Record<string, RegExp> = {
    netlify: /\bnetlify\b/i,
    azure: /\bazure\b/i,
    'gh-pages': /\bgh[-_]?pages\b/i,
    vercel: /\bvercel\b/i,
    'microsoft-store': /\b(ms|microsoft)[-_]?store|store[-_]?package\b/i,
    'play-store': /\bplay[-_]?store\b/i,
    pwa: /\bpwa\b/i,
    desktop: /\bdesktop|electron\b/i,
    mobile: /\bmobile|ios|android|capacitor\b/i,
    heroku: /\bheroku\b/i,
    aws: /\baws|lambda|amplify\b/i,
    'static-site': /\bstatic|netlify|gh[-_]?pages|vercel\b/i,
  };

  private static readonly INTENT_PREFIXES: { label: string; regex: RegExp }[] = [
    { label: 'archive', regex: /^(archive|old|legacy)\// },
    { label: 'feature', regex: /^(feat|feature)\// },
    { label: 'fix', regex: /^(fix|hotfix|bugfix)\// },
    { label: 'rewrite', regex: /^(rewrite|v\d+)\// },
    { label: 'experiment', regex: /^(experiment|spike|try|test)\// },
    { label: 'deploy', regex: /^(deploy|release)\// },
  ];

  mine(branches: BranchInfo[]): BranchInsights {
    const deployTargets = new Set<string>();
    const intents: Record<string, string> = {};

    for (const b of branches) {
      const name = b.name.replace(/^remotes\/[^/]+\//, '');

      // Deploy target detection — a branch can match multiple (pwa + store-package)
      for (const [target, regex] of Object.entries(BranchNameMiner.DEPLOY_TARGETS)) {
        if (regex.test(name)) {
          deployTargets.add(target);
        }
      }

      // Intent prefix
      let intent = 'unclassified';
      for (const { label, regex } of BranchNameMiner.INTENT_PREFIXES) {
        if (regex.test(name)) {
          intent = label;
          break;
        }
      }
      intents[name] = intent;
    }

    // Filter out overlapping umbrella targets when specific ones matched
    if (deployTargets.has('netlify') || deployTargets.has('gh-pages') || deployTargets.has('vercel')) {
      deployTargets.delete('static-site');
    }

    return {
      deployTargets: [...deployTargets].sort(),
      intents,
    };
  }
}
