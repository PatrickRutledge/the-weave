/**
 * Personal learning journal — separate from per-project .weave/ storage.
 *
 * The journal is a dedicated directory (typically its own git repo) where a
 * single developer captures their evolution across projects. Unlike the
 * per-project .weave/ directory, the journal is:
 *   - Owned by one person, not a team
 *   - Persistent beyond any individual project's lifetime
 *   - Portable across machines (can be pushed to a private GitHub repo)
 *   - The container for intentions, concept growth, and cross-project patterns
 */

export interface JournalPaths {
  root: string;
  sessionsDir: string;
  insightsDir: string;
  conceptsDir: string;
  vaultDir: string;
  promptsDir: string;
  intentionsFile: string;
  stateFile: string;
  readme: string;
  gitignore: string;
}

export interface Intention {
  id: string;
  text: string;
  createdAt: string;
  status: 'active' | 'kept' | 'abandoned';
  context?: string;
  lastCheckedAt?: string;
  resolvedAt?: string;
  originSession?: string;
}

export interface IntentionsFile {
  intentions: Intention[];
}

export interface JournalSession {
  slug: string;
  date: string;
  projectPath: string;
  projectName: string;
  commitHashRange?: { first: string; last: string };
  content: string;
  vault: boolean;
  topics?: string[];
  concepts?: string[];
}

export interface JournalSummary {
  totalSessions: number;
  projects: string[];
  activeIntentions: Intention[];
  resolvedIntentions: Intention[];
  recentSessions: { slug: string; date: string; projectName: string }[];
  recurringConcepts: { concept: string; sessions: string[] }[];
}
