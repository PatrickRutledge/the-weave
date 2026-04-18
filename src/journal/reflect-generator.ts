import type { JournalManager } from './journal-manager.js';
import type { Intention } from './types.js';

/**
 * Produces a quarterly-review-style report from the journal. Not committed
 * to disk by default — the report is returned to the caller (the AI agent)
 * to render in the conversation. The user decides whether any of it is
 * worth capturing as a new session or insight.
 */
export class ReflectGenerator {
  constructor(private readonly journal: JournalManager) {}

  generate(): string {
    const summary = this.journal.summarize();
    const allIntentions = this.journal.readIntentions().intentions;
    const lines: string[] = [];

    lines.push('# Reflection');
    lines.push('');
    lines.push(`*Generated ${new Date().toISOString().slice(0, 10)}*`);
    lines.push('');

    // Scope of history
    lines.push(`You have ${summary.totalSessions} session(s) in this journal across ${summary.projects.length} project(s). Active intentions: ${summary.activeIntentions.length}. Resolved: ${summary.resolvedIntentions.length}.`);
    lines.push('');

    // Intentions audit
    lines.push('## Intentions audit');
    lines.push('');

    const kept = allIntentions.filter((i) => i.status === 'kept');
    const abandoned = allIntentions.filter((i) => i.status === 'abandoned');
    const active = allIntentions.filter((i) => i.status === 'active');

    if (allIntentions.length === 0) {
      lines.push('_No intentions recorded yet. Set one at the end of your next session._');
    } else {
      if (kept.length > 0) {
        lines.push('### Kept');
        for (const i of kept) {
          lines.push(`- **${i.text}** _(set ${i.createdAt.slice(0, 10)}, kept ${(i.resolvedAt ?? '').slice(0, 10)})_`);
        }
        lines.push('');
      }
      if (active.length > 0) {
        lines.push('### Still active');
        for (const i of active) {
          const age = this.daysSince(i.createdAt);
          const lastChecked = i.lastCheckedAt ? `last reviewed ${i.lastCheckedAt.slice(0, 10)}` : 'never reviewed';
          lines.push(`- **${i.text}** _(${age} day${age === 1 ? '' : 's'} old, ${lastChecked})_`);
        }
        lines.push('');
      }
      if (abandoned.length > 0) {
        lines.push('### Abandoned');
        for (const i of abandoned) {
          lines.push(`- ${i.text}`);
        }
        lines.push('');
      }
    }

    // Recurring intention detection
    const recurring = this.detectRecurring(allIntentions);
    if (recurring.length > 0) {
      lines.push('## Recurring intentions');
      lines.push('');
      lines.push('Intentions with similar language that appear more than once. A repeated intention that keeps needing to be set is either a real skill gap or a comfortable thing to *say* you want.');
      lines.push('');
      for (const group of recurring) {
        lines.push(`**"${group.canonical}"** — set ${group.count} time(s)`);
        for (const i of group.items) {
          lines.push(`  - ${i.createdAt.slice(0, 10)} — ${i.status}: "${i.text}"`);
        }
        lines.push('');
      }
    }

    // Stale active intentions
    const stale = active.filter((i) => this.daysSince(i.createdAt) > 90);
    if (stale.length > 0) {
      lines.push('## Stale intentions');
      lines.push('');
      lines.push(`${stale.length} intention(s) set more than 90 days ago are still marked active. Time to decide: kept, abandoned, or still genuinely open?`);
      lines.push('');
      for (const i of stale) {
        lines.push(`- (${this.daysSince(i.createdAt)}d) ${i.text}`);
      }
      lines.push('');
    }

    // Questions
    lines.push('## Questions worth sitting with');
    lines.push('');
    if (recurring.length > 0) {
      lines.push('- You have set the same intention more than once. What is stopping it from sticking?');
    }
    if (stale.length > 0) {
      lines.push('- Your oldest unresolved intentions are 90+ days old. Are they still true?');
    }
    if (summary.projects.length >= 3) {
      lines.push('- Look at the last ${summary.projects.length} projects in this journal. What pattern are you tired of seeing?');
    }
    if (kept.length > 0 && active.length === 0) {
      lines.push('- You have closed out intentions but not opened new ones. What are you currently working on improving?');
    }
    if (lines[lines.length - 1] === '## Questions worth sitting with' || lines[lines.length - 1] === '') {
      lines.push('- What is one thing this journal is missing that a mentor would notice immediately?');
    }
    lines.push('');

    return lines.join('\n');
  }

  private daysSince(iso: string): number {
    const ms = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }

  private detectRecurring(intentions: Intention[]): { canonical: string; count: number; items: Intention[] }[] {
    // Group by a normalized key of the first 4 meaningful words.
    const stop = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'at',
      'for', 'with', 'from', 'is', 'it', 'i', 'my', 'me',
    ]);
    const key = (text: string) =>
      text
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2 && !stop.has(w))
        .slice(0, 4)
        .join(' ');

    const groups = new Map<string, Intention[]>();
    for (const i of intentions) {
      const k = key(i.text);
      if (!k) continue;
      const arr = groups.get(k) ?? [];
      arr.push(i);
      groups.set(k, arr);
    }

    return [...groups.entries()]
      .filter(([, items]) => items.length > 1)
      .map(([canonical, items]) => ({ canonical, count: items.length, items }))
      .sort((a, b) => b.count - a.count);
  }
}
