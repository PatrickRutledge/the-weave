import * as fs from 'node:fs';
import type { JournalManager } from './journal-manager.js';

/**
 * Regenerates the rolling current-state.md — a single-page snapshot of
 * where this developer is right now in their learning. Read by the user,
 * a mentor, or an AI agent to get oriented without trawling the full journal.
 */
export class StateWriter {
  constructor(private readonly journal: JournalManager) {}

  regenerate(): string {
    const summary = this.journal.summarize();
    const lines: string[] = [];

    lines.push('# Current state');
    lines.push('');
    lines.push(`*Last updated: ${new Date().toISOString()}*`);
    lines.push('');

    // Active intentions — the most important block
    if (summary.activeIntentions.length > 0) {
      lines.push('## Active intentions');
      lines.push('');
      for (const i of summary.activeIntentions) {
        const age = this.daysSince(i.createdAt);
        lines.push(`- **${i.text}**`);
        lines.push(`  _Set ${i.createdAt.slice(0, 10)} (${age} day${age === 1 ? '' : 's'} ago)${i.context ? ` — ${i.context}` : ''}_`);
      }
      lines.push('');
    } else {
      lines.push('## Active intentions');
      lines.push('');
      lines.push('_None yet. Use `set_intention` at the end of a session to capture something you want to remember._');
      lines.push('');
    }

    // Recent sessions
    if (summary.recentSessions.length > 0) {
      lines.push('## Recent sessions');
      lines.push('');
      for (const s of summary.recentSessions.slice(0, 5)) {
        lines.push(`- ${s.date} — **${s.projectName}** → [\`sessions/${s.slug}.md\`](./sessions/${s.slug}.md)`);
      }
      lines.push('');
    }

    // Projects touched
    if (summary.projects.length > 1) {
      lines.push('## Projects in this journal');
      lines.push('');
      lines.push(summary.projects.join(', '));
      lines.push('');
    }

    // Resolved intentions (condensed)
    if (summary.resolvedIntentions.length > 0) {
      const kept = summary.resolvedIntentions.filter((i) => i.status === 'kept');
      const abandoned = summary.resolvedIntentions.filter((i) => i.status === 'abandoned');
      lines.push('## Intention history');
      lines.push('');
      lines.push(`${kept.length} kept · ${abandoned.length} abandoned · ${summary.activeIntentions.length} active`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push(`**Session count**: ${summary.totalSessions} across ${summary.projects.length} project(s)`);
    lines.push('');
    lines.push('Run `reflect` for a quarterly review of intention patterns and growth.');
    lines.push('');

    const content = lines.join('\n');
    fs.writeFileSync(this.journal.paths.stateFile, content, 'utf-8');
    return content;
  }

  private daysSince(iso: string): number {
    const ms = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }
}
