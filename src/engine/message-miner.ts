import type { CommitInfo, MessageSignals, PivotSignal, PhaseMarker, FixSequence } from './types.js';

/**
 * Mines commit messages for narrative signal: pivots, phase markers, fix sequences.
 *
 * These complement the threshold-based pattern detectors (reverts, hotspots, etc.)
 * by surfacing information carried only in the text of commit messages — the
 * richest and most under-used data source in a git history.
 */
export class MessageMiner {
  private static readonly PIVOT_PATTERNS: { kind: PivotSignal['kind']; regex: RegExp }[] = [
    { kind: 'rewrite', regex: /\b(rewrite|rewriting|rewritten|wrote from scratch|full rewrite|ground up)\b/i },
    { kind: 'migrate', regex: /\b(migrate|migrating|migration|move(d)? from|port(ed)? (to|from))\b/i },
    { kind: 'switch', regex: /\b(switch(ed|ing)? (to|from)|replace(d|ment) with|drop(ped)? .+ for|swap(ped)? (to|for))\b/i },
    { kind: 'overhaul', regex: /\b(overhaul|major refactor|complete refactor|restructure|redesign(ed)?)\b/i },
  ];

  // Match things like "Phase 8", "Step 3", "Milestone 1", "Sprint IV", "v2".
  // Require a digit or roman numeral after the keyword — single letters create too
  // many false positives (e.g. "build stepS" → "step s").
  private static readonly PHASE_REGEX = /\b(phase|step|milestone|sprint)[\s:]+(\d+|[ivx]{1,5})\b/i;

  private static readonly FIX_REGEX = /^(fix|hotfix|patch|bug|repair)\b/i;

  mine(commits: CommitInfo[]): MessageSignals {
    return {
      pivots: this.findPivots(commits),
      phaseMarkers: this.findPhaseMarkers(commits),
      fixSequences: this.findFixSequences(commits),
    };
  }

  private findPivots(commits: CommitInfo[]): PivotSignal[] {
    const pivots: PivotSignal[] = [];
    for (const c of commits) {
      for (const { kind, regex } of MessageMiner.PIVOT_PATTERNS) {
        if (regex.test(c.message)) {
          pivots.push({
            hash: c.hash,
            date: c.date,
            message: c.message.trim(),
            kind,
            filesChanged: c.files.length || undefined,
          });
          break;
        }
      }
    }
    return pivots;
  }

  private findPhaseMarkers(commits: CommitInfo[]): PhaseMarker[] {
    const markers: PhaseMarker[] = [];
    for (const c of commits) {
      const match = MessageMiner.PHASE_REGEX.exec(c.message);
      if (match) {
        markers.push({
          hash: c.hash,
          date: c.date,
          message: c.message.trim(),
          phase: `${match[1]} ${match[2]}`,
        });
      }
    }
    return markers;
  }

  /**
   * A fix sequence = 3+ consecutive commits (by date) whose messages start with
   * fix/hotfix/etc. These suggest something that needed repeated patching.
   */
  private findFixSequences(commits: CommitInfo[]): FixSequence[] {
    if (commits.length === 0) return [];

    const sorted = [...commits].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const sequences: FixSequence[] = [];
    let current: CommitInfo[] = [];

    const flush = () => {
      if (current.length >= 3) {
        sequences.push({
          startHash: current[0].hash,
          endHash: current[current.length - 1].hash,
          commitCount: current.length,
          topic: this.inferTopic(current),
          messages: current.map((c) => c.message.trim()),
        });
      }
      current = [];
    };

    for (const c of sorted) {
      if (MessageMiner.FIX_REGEX.test(c.message)) {
        current.push(c);
      } else {
        flush();
      }
    }
    flush();

    return sequences;
  }

  private inferTopic(commits: CommitInfo[]): string {
    const stop = new Set([
      'fix', 'fixes', 'fixed', 'the', 'and', 'or', 'for', 'with', 'to', 'from',
      'of', 'in', 'on', 'at', 'a', 'an', 'is', 'it', 'that', 'this', 'add', 'update',
    ]);
    const freq = new Map<string, number>();
    for (const c of commits) {
      for (const w of c.message.toLowerCase().split(/\W+/)) {
        if (w.length > 2 && !stop.has(w)) {
          freq.set(w, (freq.get(w) ?? 0) + 1);
        }
      }
    }
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0];
    return top?.[0] ?? 'general';
  }
}
