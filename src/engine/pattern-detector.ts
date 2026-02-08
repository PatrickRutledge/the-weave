import type { CommitInfo, TimeSink, CircularPattern, RevertPattern } from './types.js';

export interface PatternResults {
  circularDevelopment: CircularPattern[];
  timeSinks: TimeSink[];
  sentimentIndicators: SentimentIndicator[];
  commitMessagePatterns: MessagePattern[];
}

export interface SentimentIndicator {
  type: 'frustration' | 'breakthrough' | 'uncertainty' | 'urgency';
  commit: CommitInfo;
  evidence: string;
}

export interface MessagePattern {
  pattern: string;
  count: number;
  examples: string[];
}

const FRUSTRATION_PATTERNS = [
  /\btrying again\b/i,
  /\bstill broken\b/i,
  /\bwhy\b.*\bnot work/i,
  /\brevert\b/i,
  /\bundo\b/i,
  /\bfailed attempt\b/i,
  /\bhack\b/i,
  /\bworkaround\b/i,
  /\btemp fix\b/i,
  /\bhotfix\b/i,
];

const BREAKTHROUGH_PATTERNS = [
  /\bfinally\b/i,
  /\bfixed\b.*\b(properly|correctly)\b/i,
  /\bworking\b/i,
  /\bsolved\b/i,
  /\bcomplete\b/i,
  /\brefactor\b/i,
];

const UNCERTAINTY_PATTERNS = [
  /\bmaybe\b/i,
  /\btry\b/i,
  /\bexperiment\b/i,
  /\btest\b.*\bapproach\b/i,
  /\bnot sure\b/i,
  /\bwip\b/i,
];

const URGENCY_PATTERNS = [
  /\bASAP\b/,
  /\burgent\b/i,
  /\bcritical\b/i,
  /\bhotfix\b/i,
  /\bemergency\b/i,
];

export class PatternDetector {
  detectPatterns(commits: CommitInfo[]): PatternResults {
    return {
      circularDevelopment: this.findCircularDevelopment(commits),
      timeSinks: this.findTimeSinks(commits),
      sentimentIndicators: this.analyzeSentiment(commits),
      commitMessagePatterns: this.analyzeMessagePatterns(commits),
    };
  }

  private findCircularDevelopment(commits: CommitInfo[]): CircularPattern[] {
    const patterns: CircularPattern[] = [];

    // Find reverts that were later re-applied
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      if (!commit.message.startsWith('Revert')) continue;

      const match = commit.message.match(/Revert "(.+)"/);
      if (!match) continue;

      const originalMsg = match[1];

      // Look for re-application after the revert
      for (let j = i + 1; j < commits.length; j++) {
        if (commits[j].message.includes(originalMsg) || this.similarMessages(commits[j].message, originalMsg)) {
          patterns.push({
            file: commits[j].files[0] ?? 'unknown',
            addedIn: commits[j].hash,
            removedIn: commit.hash,
            reAddedIn: commits[j].hash,
            description: `Feature "${originalMsg}" was added, reverted, then re-applied`,
          });
          break;
        }
      }
    }

    // Find files that were changed many times with similar messages
    const fileChangeMessages = new Map<string, string[]>();
    for (const commit of commits) {
      for (const file of commit.files) {
        const existing = fileChangeMessages.get(file) ?? [];
        existing.push(commit.message);
        fileChangeMessages.set(file, existing);
      }
    }

    for (const [file, messages] of fileChangeMessages) {
      if (messages.length < 5) continue;

      // Check for repetitive fix patterns
      const fixMessages = messages.filter(m => /\bfix\b/i.test(m));
      if (fixMessages.length >= 3) {
        patterns.push({
          file,
          addedIn: '',
          removedIn: '',
          reAddedIn: '',
          description: `${file} was "fixed" ${fixMessages.length} times — possible circular development`,
        });
      }
    }

    return patterns;
  }

  private findTimeSinks(commits: CommitInfo[]): TimeSink[] {
    // Group commits by topic (extracted from commit messages)
    const topics = new Map<string, CommitInfo[]>();

    for (const commit of commits) {
      const topic = this.extractTopic(commit.message);
      const existing = topics.get(topic) ?? [];
      existing.push(commit);
      topics.set(topic, existing);
    }

    return [...topics.entries()]
      .filter(([, topicCommits]) => topicCommits.length >= 8)
      .map(([topic, topicCommits]) => {
        const sorted = topicCommits.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const first = new Date(sorted[0].date);
        const last = new Date(sorted[sorted.length - 1].date);
        const spanDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));

        const allFiles = new Set<string>();
        for (const c of topicCommits) {
          for (const f of c.files) allFiles.add(f);
        }

        return {
          topic,
          commitCount: topicCommits.length,
          spanDays,
          files: [...allFiles],
        };
      })
      .sort((a, b) => b.commitCount - a.commitCount);
  }

  private analyzeSentiment(commits: CommitInfo[]): SentimentIndicator[] {
    const indicators: SentimentIndicator[] = [];

    for (const commit of commits) {
      for (const pattern of FRUSTRATION_PATTERNS) {
        if (pattern.test(commit.message)) {
          indicators.push({ type: 'frustration', commit, evidence: commit.message });
          break;
        }
      }
      for (const pattern of BREAKTHROUGH_PATTERNS) {
        if (pattern.test(commit.message)) {
          indicators.push({ type: 'breakthrough', commit, evidence: commit.message });
          break;
        }
      }
      for (const pattern of UNCERTAINTY_PATTERNS) {
        if (pattern.test(commit.message)) {
          indicators.push({ type: 'uncertainty', commit, evidence: commit.message });
          break;
        }
      }
      for (const pattern of URGENCY_PATTERNS) {
        if (pattern.test(commit.message)) {
          indicators.push({ type: 'urgency', commit, evidence: commit.message });
          break;
        }
      }
    }

    return indicators;
  }

  private analyzeMessagePatterns(commits: CommitInfo[]): MessagePattern[] {
    const prefixes = new Map<string, string[]>();

    for (const commit of commits) {
      // Extract common prefixes like "fix:", "feat:", "[module]", etc.
      const prefixMatch = commit.message.match(/^(\w+[\(:!]|(\[.+?\]))/);
      if (prefixMatch) {
        const prefix = prefixMatch[0].toLowerCase();
        const existing = prefixes.get(prefix) ?? [];
        existing.push(commit.message);
        prefixes.set(prefix, existing);
      }
    }

    return [...prefixes.entries()]
      .filter(([, msgs]) => msgs.length >= 2)
      .map(([pattern, msgs]) => ({
        pattern,
        count: msgs.length,
        examples: msgs.slice(0, 3),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private extractTopic(message: string): string {
    // Try bracket prefix [topic]
    const bracketMatch = message.match(/^\[(.+?)\]/);
    if (bracketMatch) return bracketMatch[1].toLowerCase();

    // Try conventional commit prefix (fix, feat, etc.)
    const conventionalMatch = message.match(/^(\w+)\((.+?)\)/);
    if (conventionalMatch) return conventionalMatch[2].toLowerCase();

    // Try scope from colon prefix
    const colonMatch = message.match(/^(\w+):/);
    if (colonMatch) return colonMatch[1].toLowerCase();

    // Fallback: first significant word
    const words = message.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    return words[0] ?? 'general';
  }

  private similarMessages(a: string, b: string): boolean {
    const cleanA = a.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const cleanB = b.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    return cleanA.includes(cleanB) || cleanB.includes(cleanA);
  }
}
