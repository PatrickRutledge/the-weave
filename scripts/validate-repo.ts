#!/usr/bin/env tsx
/**
 * Validation harness — exercises The Weaver against a target repo and writes a report.
 *
 * Usage:
 *   npx tsx scripts/validate-repo.ts <repo-path> [output-path]
 *
 * Example:
 *   npx tsx scripts/validate-repo.ts D:\the-weave D:\weaver\validation\the-weave.md
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import { SessionOrchestrator } from '../src/orchestrator/session-orchestrator.js';
import { ReviewOrchestrator } from '../src/orchestrator/review-orchestrator.js';
import type { Finding, RepositoryAnalysis } from '../src/engine/types.js';

async function main() {
  const repoPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!repoPath) {
    console.error('Usage: validate-repo.ts <repo-path> [output-path]');
    process.exit(1);
  }

  const absRepo = path.resolve(repoPath);
  if (!fs.existsSync(path.join(absRepo, '.git'))) {
    console.error(`Not a git repository: ${absRepo}`);
    process.exit(1);
  }

  const started = Date.now();
  console.error(`[validate] analyzing ${absRepo}`);

  const orchestrator = new SessionOrchestrator();

  const analysis = await orchestrator.analyzeRepository(absRepo);
  console.error(`[validate] analyzed ${analysis.totalCommits} commits in ${Date.now() - started}ms`);

  orchestrator.startSession(absRepo, 'retrospective');
  const findings = await orchestrator.identifyFindings(analysis);
  console.error(`[validate] identified ${findings.length} findings`);

  const reviewOrch = new ReviewOrchestrator(
    orchestrator.getStateManager(),
    orchestrator.getLessonManager()
  );
  const quickScan = reviewOrch.generateQuickScan(analysis, findings);
  const evolutionLog = reviewOrch.generateEvolutionLog(analysis, []);

  const report = buildReport(absRepo, analysis, findings, quickScan, evolutionLog);

  if (outputPath) {
    const absOut = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(absOut), { recursive: true });
    fs.writeFileSync(absOut, report, 'utf-8');
    console.error(`[validate] report written to ${absOut}`);
  } else {
    process.stdout.write(report);
  }
}

function buildReport(
  repoPath: string,
  analysis: RepositoryAnalysis,
  findings: Finding[],
  quickScan: string,
  evolutionLog: string
): string {
  const lines: string[] = [];

  lines.push(`# Weaver Validation Report`);
  lines.push('');
  lines.push(`**Repository**: \`${repoPath}\``);
  lines.push(`**Run at**: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`---`);
  lines.push('');

  // ── Section 1: Raw analysis summary ─────────────────
  lines.push(`## 1. Raw Analysis`);
  lines.push('');
  lines.push(`- Total commits: **${analysis.totalCommits}**`);
  lines.push(`- Date range: ${analysis.dateRange.first} → ${analysis.dateRange.last}`);
  lines.push(`- Authors: ${analysis.authors.length} (${analysis.authors.slice(0, 5).join(', ')}${analysis.authors.length > 5 ? '…' : ''})`);
  lines.push(`- Branches: ${analysis.activeBranches.length}`);
  lines.push(`- Reverts: ${analysis.reverts.length}`);
  lines.push(`- Circular patterns: ${analysis.circularPatterns.length}`);
  lines.push(`- Time sinks: ${analysis.timeSinks.length}`);
  lines.push(`- Hotspots: ${analysis.hotspots.length}`);
  lines.push(`- Coupled-file pairs: ${analysis.coupledFiles.length}`);
  lines.push(`- Commit clusters: ${analysis.clusters.length}`);
  lines.push(`- Burst periods: ${analysis.burstPeriods.length}`);
  lines.push('');

  // Branches
  if (analysis.activeBranches.length > 0) {
    lines.push(`### Branches`);
    lines.push('');
    lines.push(`| Name | Commits | Days since last | Merged |`);
    lines.push(`|------|---------|-----------------|--------|`);
    for (const b of analysis.activeBranches) {
      lines.push(`| ${b.name} | ${b.commitCount} | ${b.daysSinceLastCommit} | ${b.isMerged ? 'yes' : 'no'} |`);
    }
    lines.push('');
  }

  // Reverts
  if (analysis.reverts.length > 0) {
    lines.push(`### Reverts`);
    lines.push('');
    for (const r of analysis.reverts) {
      lines.push(`- **${r.originalCommit.hash.slice(0, 7)}** "${r.originalCommit.message.trim()}" → reverted after ${Math.round(r.daysBetween)} days`);
    }
    lines.push('');
  }

  // Hotspots
  if (analysis.hotspots.length > 0) {
    lines.push(`### Top Hotspots`);
    lines.push('');
    for (const h of analysis.hotspots.slice(0, 10)) {
      lines.push(`- \`${h.path}\` — ${h.changeCount} changes, ${h.uniqueAuthors} author(s), last ${h.lastChanged}`);
    }
    lines.push('');
  }

  // Time sinks
  if (analysis.timeSinks.length > 0) {
    lines.push(`### Time Sinks`);
    lines.push('');
    for (const t of analysis.timeSinks) {
      lines.push(`- **${t.topic}** — ${t.commitCount} commits over ${t.spanDays} days (${t.files.length} files)`);
    }
    lines.push('');
  }

  // Circular
  if (analysis.circularPatterns.length > 0) {
    lines.push(`### Circular Development`);
    lines.push('');
    for (const c of analysis.circularPatterns) {
      lines.push(`- ${c.description}`);
    }
    lines.push('');
  }

  // Dependencies
  if (analysis.dependencies) {
    const d = analysis.dependencies;
    lines.push(`### Dependencies`);
    lines.push('');
    lines.push(`- Production deps: ${d.dependencies.filter(x => x.type === 'production').length}`);
    lines.push(`- Dev deps: ${d.dependencies.filter(x => x.type === 'development').length}`);
    if (d.frameworks.length > 0) {
      lines.push(`- Frameworks detected: ${d.frameworks.map(f => `${f.name} (${f.confidence})`).join(', ')}`);
    }
    if (d.testFrameworks.length > 0) {
      lines.push(`- Test frameworks: ${d.testFrameworks.join(', ')}`);
    }
    if (d.linters.length > 0) {
      lines.push(`- Linters: ${d.linters.join(', ')}`);
    }
    lines.push('');
  }

  lines.push(`---`);
  lines.push('');

  // ── Section 2: Findings by perspective ──────────────
  lines.push(`## 2. Findings (${findings.length})`);
  lines.push('');

  const byPerspective = new Map<string, Finding[]>();
  for (const f of findings) {
    const key = f.perspectives.join(', ');
    const arr = byPerspective.get(key) ?? [];
    arr.push(f);
    byPerspective.set(key, arr);
  }

  lines.push(`### Distribution across perspectives`);
  lines.push('');
  lines.push(`| Perspective | Count | Severities |`);
  lines.push(`|-------------|-------|------------|`);
  for (const [persp, list] of byPerspective) {
    const sevs = list.reduce<Record<string, number>>((acc, f) => {
      acc[f.severity] = (acc[f.severity] ?? 0) + 1;
      return acc;
    }, {});
    const sevStr = Object.entries(sevs).map(([s, n]) => `${s}:${n}`).join(', ');
    lines.push(`| ${persp} | ${list.length} | ${sevStr} |`);
  }
  lines.push('');

  lines.push(`### All findings`);
  lines.push('');
  for (const [persp, list] of byPerspective) {
    lines.push(`#### ${persp}`);
    lines.push('');
    for (const f of list) {
      lines.push(`##### [${f.severity}] [${f.category}] ${f.title}`);
      lines.push('');
      lines.push(f.description);
      lines.push('');
      if (f.evidence.length > 0) {
        lines.push(`**Evidence:**`);
        for (const e of f.evidence) {
          lines.push(`- ${e}`);
        }
        lines.push('');
      }
    }
  }

  lines.push(`---`);
  lines.push('');

  // ── Section 3: Quick Scan output ────────────────────
  lines.push(`## 3. Quick Scan Output`);
  lines.push('');
  lines.push('```markdown');
  lines.push(quickScan);
  lines.push('```');
  lines.push('');
  lines.push(`---`);
  lines.push('');

  // ── Section 4: Evolution Log (no lessons) ───────────
  lines.push(`## 4. Evolution Log (no dialogue, no lessons)`);
  lines.push('');
  lines.push('```markdown');
  lines.push(evolutionLog);
  lines.push('```');
  lines.push('');
  lines.push(`---`);
  lines.push('');

  // ── Section 5: Quality scoring template ─────────────
  lines.push(`## 5. Quality Scoring`);
  lines.push('');
  lines.push(`Score against \`docs/QUALITY-METRICS.md\`. Fill in manually after reviewing output above.`);
  lines.push('');
  lines.push(`| Goal | Pass bar | Good bar | Score / 10 | Notes |`);
  lines.push(`|------|----------|----------|------------|-------|`);
  lines.push(`| 1. Analyzes | | | | |`);
  lines.push(`| 2. Identifies | | | | |`);
  lines.push(`| 3. Facilitates | | | | |`);
  lines.push(`| 4. Captures | | | | |`);
  lines.push(`| 5. Generates | | | | |`);
  lines.push('');
  lines.push(`**Total**: __ / 50`);
  lines.push('');
  lines.push(`**Philosophy tenets**:`);
  lines.push(`- [ ] No blame`);
  lines.push(`- [ ] Facts first`);
  lines.push(`- [ ] Safety first (safe words)`);
  lines.push(`- [ ] Privacy by default`);
  lines.push(`- [ ] Anti-performance theater`);
  lines.push('');

  return lines.join('\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
