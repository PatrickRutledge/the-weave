import type { Finding, Lesson, RepositoryAnalysis, SessionState } from '../engine/types.js';
import { StateManager } from '../state/state-manager.js';
import { LessonManager } from './lesson-manager.js';

export class ReviewOrchestrator {
  private stateManager: StateManager;
  private lessonManager: LessonManager;

  constructor(stateManager: StateManager, lessonManager: LessonManager) {
    this.stateManager = stateManager;
    this.lessonManager = lessonManager;
  }

  formatFindingAsQuestion(finding: Finding, progress: { current: number; total: number }): string {
    const lines: string[] = [];

    lines.push(`### Finding ${progress.current} of ${progress.total}`);
    lines.push(`**Perspective**: ${finding.perspectives.join(', ')}`);
    lines.push(`**Severity**: ${finding.severity}`);
    lines.push('');
    lines.push(finding.description);
    lines.push('');

    if (finding.evidence.length > 0) {
      lines.push('**Evidence:**');
      for (const e of finding.evidence.slice(0, 5)) {
        lines.push(`- ${e}`);
      }
      lines.push('');
    }

    // Generate appropriate question based on category
    switch (finding.category) {
      case 'antipattern':
        lines.push(`What was the root cause that led to this "${finding.title}" pattern?`);
        break;
      case 'pattern':
        lines.push(`What context or constraints drove this pattern?`);
        break;
      case 'insight':
        lines.push(`What insight or realization made the difference here?`);
        break;
      case 'question':
        lines.push(`What was your experience with this? What would you do differently?`);
        break;
    }

    return lines.join('\n');
  }

  processResponse(finding: Finding, response: string): Lesson {
    return this.lessonManager.captureFromDialogue(finding, response);
  }

  generateEvolutionLog(analysis: RepositoryAnalysis, lessons: Lesson[]): string {
    const lines: string[] = [];
    const state = this.stateManager.getState();

    lines.push('# Evolution Log');
    lines.push('');
    lines.push(`*${analysis.path} · ${analysis.dateRange.first.slice(0, 10)} → ${analysis.dateRange.last.slice(0, 10)} · ${analysis.totalCommits} commits · ${analysis.authors.length} author(s)*`);
    lines.push('');

    // ── The arc ──────────────────────────────────────────
    lines.push('## The arc');
    lines.push('');
    lines.push(this.writeArcParagraph(analysis));
    lines.push('');

    // ── Pivot section (if any) ───────────────────────────
    const pivots = analysis.messageSignals?.pivots ?? [];
    if (pivots.length > 0) {
      lines.push('## Pivots');
      lines.push('');
      for (const p of pivots) {
        const kindLabel = { rewrite: 'Rewrite', migrate: 'Migration', switch: 'Technology switch', overhaul: 'Overhaul' }[p.kind];
        lines.push(`**${p.date.slice(0, 10)} — ${kindLabel}**: "${p.message}"`);
        lines.push('');
      }
    }

    // ── Deploy target pivots (branches) ──────────────────
    const targets = analysis.branchInsights?.deployTargets ?? [];
    if (targets.length >= 2) {
      lines.push('## Deployment targets attempted');
      lines.push('');
      lines.push(
        `Branch names reveal ${targets.length} distinct distribution channels: ${targets.join(', ')}. ` +
        `Each represents a bet on how this project would reach users.`
      );
      lines.push('');
    }

    // ── Phase markers (if any) ───────────────────────────
    const phases = analysis.messageSignals?.phaseMarkers ?? [];
    if (phases.length >= 2) {
      lines.push('## Phased execution');
      lines.push('');
      lines.push(
        `${phases.length} commit(s) label their own phase or milestone — the team was tracking its progress in-band:`
      );
      for (const m of phases.slice(0, 8)) {
        lines.push(`- ${m.date.slice(0, 10)}: "${m.message}"`);
      }
      lines.push('');
    }

    // ── Real findings ────────────────────────────────────
    const findings = state.findings;
    const antiPatterns = findings.filter((f) => f.category === 'antipattern');
    const patterns = findings.filter((f) => f.category === 'pattern');
    const insights = findings.filter((f) => f.category === 'insight');

    if (antiPatterns.length + patterns.length + insights.length > 0) {
      lines.push('## What emerged');
      lines.push('');
    }

    if (antiPatterns.length > 0) {
      lines.push('### Anti-patterns');
      lines.push('');
      for (const f of antiPatterns) {
        lines.push(this.renderFindingBlock(f));
      }
    }

    if (patterns.length > 0) {
      lines.push('### Patterns');
      lines.push('');
      for (const f of patterns) {
        lines.push(this.renderFindingBlock(f));
      }
    }

    if (insights.length > 0) {
      lines.push('### Observations');
      lines.push('');
      for (const f of insights) {
        lines.push(this.renderFindingBlock(f));
      }
    }

    // ── Dialogue-captured lessons ────────────────────────
    if (lessons.length > 0) {
      lines.push('## Lessons captured in dialogue');
      lines.push('');
      for (const lesson of lessons) {
        lines.push(`### ${lesson.title}`);
        lines.push(`*Perspective: ${lesson.perspectives.join(', ')}*`);
        lines.push('');
        lines.push(lesson.insight);
        lines.push('');

        if (lesson.actionItems.length > 0) {
          lines.push('**Action items:**');
          for (const item of lesson.actionItems) {
            lines.push(`- [ ] ${item}`);
          }
          lines.push('');
        }
      }
    }

    // ── Recommended improvements (only if lessons exist) ─
    const allActions = lessons.flatMap((l) => l.actionItems);
    const uniqueActions = [...new Set(allActions)];
    if (uniqueActions.length > 0) {
      lines.push('## Recommended next steps');
      lines.push('');
      for (const a of uniqueActions) {
        lines.push(`- [ ] ${a}`);
      }
      lines.push('');
    }

    // ── Raw facts (at the bottom, not the top) ───────────
    lines.push('## Raw facts');
    lines.push('');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total commits | ${analysis.totalCommits} |`);
    lines.push(`| Active branches | ${analysis.activeBranches.length} |`);
    lines.push(`| Authors | ${analysis.authors.length} |`);
    lines.push(`| Findings reviewed | ${state.findings.length} |`);
    lines.push(`| Lessons captured | ${lessons.length} |`);
    if (analysis.dependencies) {
      lines.push(`| Production deps | ${analysis.dependencies.dependencies.filter((d) => d.type === 'production').length} |`);
      lines.push(`| Frameworks | ${analysis.dependencies.frameworks.map((f) => f.name).join(', ') || 'none detected'} |`);
    }

    return lines.join('\n');
  }

  private writeArcParagraph(analysis: RepositoryAnalysis): string {
    const first = analysis.firstCommit;
    const last = analysis.lastCommit;

    if (!first || !last) {
      return `Repository spans ${analysis.totalCommits} commit(s) — too little history to narrate.`;
    }

    const days = Math.round(
      (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const parts: string[] = [];

    parts.push(
      `From ${first.date.slice(0, 10)} ("${first.message.trim()}") to ${last.date.slice(0, 10)} ("${last.message.trim()}"), ${days} day(s) elapsed across ${analysis.totalCommits} commit(s).`
    );

    const rewrites = (analysis.messageSignals?.pivots ?? []).filter((p) => p.kind === 'rewrite' || p.kind === 'overhaul');
    if (rewrites.length > 0) {
      const r = rewrites[0];
      parts.push(
        `The project was ${r.kind === 'rewrite' ? 'rewritten' : 'overhauled'} on ${r.date.slice(0, 10)} — "${r.message}" — suggesting the team decided the existing code wasn't worth evolving.`
      );
    }

    const switches = (analysis.messageSignals?.pivots ?? []).filter((p) => p.kind === 'switch' || p.kind === 'migrate');
    if (switches.length > 0) {
      parts.push(
        `${switches.length} commit(s) describe a technology switch or migration — the team moved off something they had already invested in.`
      );
    }

    const targets = analysis.branchInsights?.deployTargets ?? [];
    if (targets.length >= 3) {
      parts.push(
        `Branch names reveal ${targets.length} distinct deployment targets attempted (${targets.slice(0, 4).join(', ')}${targets.length > 4 ? ', …' : ''}).`
      );
    }

    return parts.join(' ');
  }

  private renderFindingBlock(f: Finding): string {
    const lines: string[] = [];
    lines.push(`**${f.title}** _(severity: ${f.severity})_`);
    lines.push('');
    lines.push(f.description);
    if (f.evidence.length > 0) {
      lines.push('');
      for (const e of f.evidence.slice(0, 8)) {
        lines.push(`- ${e}`);
      }
    }
    lines.push('');
    return lines.join('\n');
  }

  generateQuickScan(analysis: RepositoryAnalysis, findings: Finding[]): string {
    const lines: string[] = [];

    lines.push('# Quick Scan');
    lines.push('');
    lines.push(`*${analysis.path} · ${analysis.totalCommits} commits · ${analysis.dateRange.first.slice(0, 10)} → ${analysis.dateRange.last.slice(0, 10)}*`);
    lines.push('');

    // Paragraph 1 — headline
    lines.push('## Headline');
    lines.push('');
    lines.push(this.writeHeadlineParagraph(analysis));
    lines.push('');

    // Paragraph 2 — arc
    lines.push('## Arc');
    lines.push('');
    lines.push(this.writeArcParagraph(analysis));
    lines.push('');

    // Paragraph 3 — signals standing out
    lines.push('## What stands out');
    lines.push('');
    lines.push(this.writeSignalsParagraph(findings));
    lines.push('');

    lines.push('*Run a full retrospective for interactive dialogue about these findings.*');

    return lines.join('\n');
  }

  private writeHeadlineParagraph(analysis: RepositoryAnalysis): string {
    const framework = analysis.dependencies?.frameworks[0]?.name;
    const depCount = analysis.dependencies?.dependencies.filter((d) => d.type === 'production').length ?? 0;
    const testFw = analysis.dependencies?.testFrameworks[0];

    let subject: string;
    if (framework) {
      subject = `A ${framework} project`;
    } else if (depCount > 0) {
      subject = `A project with ${depCount} production dep${depCount === 1 ? '' : 's'}`;
    } else {
      subject = 'A codebase';
    }

    const qualifiers: string[] = [];
    if (framework && depCount > 0) qualifiers.push(`${depCount} production dep${depCount === 1 ? '' : 's'}`);
    if (testFw) qualifiers.push(`tested with ${testFw}`);

    const qualifierText = qualifiers.length > 0 ? `, ${qualifiers.join(', ')}` : '';

    return (
      `${subject}${qualifierText}. ${analysis.totalCommits} commit${analysis.totalCommits === 1 ? '' : 's'} ` +
      `from ${analysis.authors.length} author${analysis.authors.length === 1 ? '' : 's'} across ` +
      `${analysis.activeBranches.length} branch${analysis.activeBranches.length === 1 ? '' : 'es'}.`
    );
  }

  private writeSignalsParagraph(findings: Finding[]): string {
    if (findings.length === 0) {
      return 'No findings surfaced at this scan depth. Run a full retrospective if you want to explore questions that do not have mechanical evidence.';
    }

    const ordered = [...findings].sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    });

    const top = ordered.slice(0, 3);
    const named = top.map((f) => `**${f.title}** (${f.severity})`).join(', ');
    const rest = ordered.length > 3 ? ` Plus ${ordered.length - 3} other finding(s).` : '';

    return `${named}.${rest} Each finding cites specific commits, files, or branches — see the full retrospective for the evidence and the questions each one raises.`;
  }
}
