#!/usr/bin/env tsx
/**
 * End-to-end demo: create a journal with two fake sessions + intentions,
 * regenerate state/prompts, dump the result for inspection.
 *
 * Usage: npx tsx scripts/journal-demo.ts [output-dir]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { JournalManager } from '../src/journal/journal-manager.js';
import { StateWriter } from '../src/journal/state-writer.js';
import { PromptGenerator } from '../src/journal/prompt-generator.js';
import { ReflectGenerator } from '../src/journal/reflect-generator.js';

async function main() {
  const outDir = process.argv[2] ?? path.resolve('D:/weaver/validation/demo-journal');

  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  const journal = new JournalManager(outDir);
  journal.init();

  // Session 1: RunChart-Goal retrospective
  journal.writeSession({
    slug: '2025-09-30-runchart-goal',
    date: '2025-09-30T12:00:00Z',
    projectPath: 'D:/RunChart-Goal',
    projectName: 'runchart-goal',
    vault: false,
    content: `# RunChart-Goal — retrospective

*D:\\\\RunChart-Goal · 2025-06-22 → 2025-09-27 · 52 commits · 3 authors*

## The arc

From 2025-06-22 to 2025-09-27, 97 days elapsed across 52 commits. Branch names reveal 6 distinct deployment targets attempted (azure, desktop, gh-pages, microsoft-store, ...).

## What emerged

**Selective sweat on the wrong surface** — core component src/App.vue got 6 changes total; deployment config files (vite.config.js, netlify.toml, manifest.json) dominated hotspots.

**Deploy-target optionality as default** — 6 distribution channels attempted for a solo project.

**Concept gaps named**: SPA routing, PWA manifests, Microsoft Store Partner Center, Vite base path handling.
`,
  });

  // Session 2: the-weave retrospective
  journal.writeSession({
    slug: '2026-04-18-the-weave',
    date: '2026-04-18T16:00:00Z',
    projectPath: 'D:/the-weave',
    projectName: 'the-weave',
    vault: false,
    content: `# the-weave — retrospective

*D:\\\\the-weave · 2025-09-27 → 2026-02-08 · 8 commits · 1 author*

## The arc

From 2025-09-27 ("Initial commit") to 2026-02-08 ("Add Phase 8 test suite — 81 tests, all passing"), 134 days elapsed across 8 commits. The project was rewritten on 2026-02-08 — "Rewrite as The Weaver — full MCP server implementation (Phases 0-7)".

## What emerged

**Short-history pattern** — one author, small commit count, major pivot mid-way.

**Concept named**: MCP (Model Context Protocol) server architecture.
`,
  });

  // Intentions — mix of active, one that echoes across sessions
  journal.addIntention(
    'Pick one deployment target before writing code',
    'from RunChart-Goal: 6 targets attempted, only 1 shipped',
    '2025-09-30-runchart-goal'
  );
  journal.addIntention(
    'When a config file has been "fixed" 3+ times, stop and read the docs',
    'from RunChart-Goal: vite.config.js fixed 5 times, netlify.toml 4 times',
    '2025-09-30-runchart-goal'
  );
  journal.addIntention(
    'Validate the core tool works against a real messy repo before adding extension layers',
    'from the-weave Phase A retrospective',
    '2026-04-18-the-weave'
  );

  // Kept one to show history
  const resolveTarget = journal.readIntentions().intentions[0];
  journal.resolveIntention(resolveTarget.id, 'kept');

  // A recurring one
  journal.addIntention(
    'Commit to one distribution channel early',
    'echo of the deploy target intention',
    '2026-04-18-the-weave'
  );

  // Regenerate state + prompts
  new StateWriter(journal).regenerate();
  new PromptGenerator(journal).regenerate();

  // Dump summary for inspection
  console.error('');
  console.error(`Journal created at: ${journal.paths.root}`);
  console.error('');
  console.error('--- current-state.md ---');
  console.error(fs.readFileSync(journal.paths.stateFile, 'utf-8'));
  console.error('');
  console.error('--- prompts/ask-a-mentor.md ---');
  console.error(fs.readFileSync(path.join(journal.paths.promptsDir, 'ask-a-mentor.md'), 'utf-8'));
  console.error('');
  console.error('--- reflect output ---');
  console.error(new ReflectGenerator(journal).generate());
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
