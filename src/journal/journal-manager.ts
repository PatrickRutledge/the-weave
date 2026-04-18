import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomBytes } from 'node:crypto';
import type {
  Intention,
  IntentionsFile,
  JournalPaths,
  JournalSession,
  JournalSummary,
} from './types.js';

export class JournalManager {
  readonly paths: JournalPaths;

  constructor(root: string) {
    const abs = path.resolve(root);
    this.paths = {
      root: abs,
      sessionsDir: path.join(abs, 'sessions'),
      insightsDir: path.join(abs, 'insights'),
      conceptsDir: path.join(abs, 'concepts'),
      vaultDir: path.join(abs, 'vault'),
      promptsDir: path.join(abs, 'prompts'),
      intentionsFile: path.join(abs, 'intentions.json'),
      stateFile: path.join(abs, 'current-state.md'),
      readme: path.join(abs, 'README.md'),
      gitignore: path.join(abs, '.gitignore'),
    };
  }

  exists(): boolean {
    return fs.existsSync(this.paths.root) && fs.existsSync(this.paths.intentionsFile);
  }

  init(): void {
    for (const dir of [
      this.paths.root,
      this.paths.sessionsDir,
      this.paths.insightsDir,
      this.paths.conceptsDir,
      this.paths.vaultDir,
      this.paths.promptsDir,
    ]) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.paths.intentionsFile)) {
      const fresh: IntentionsFile = { intentions: [] };
      fs.writeFileSync(this.paths.intentionsFile, JSON.stringify(fresh, null, 2), 'utf-8');
    }

    if (!fs.existsSync(this.paths.readme)) {
      fs.writeFileSync(this.paths.readme, this.defaultReadme(), 'utf-8');
    }

    if (!fs.existsSync(this.paths.gitignore)) {
      fs.writeFileSync(this.paths.gitignore, this.defaultGitignore(), 'utf-8');
    }

    if (!fs.existsSync(this.paths.stateFile)) {
      fs.writeFileSync(this.paths.stateFile, '# Current state\n\n*No sessions yet. Run a retrospective to begin.*\n', 'utf-8');
    }
  }

  readIntentions(): IntentionsFile {
    if (!fs.existsSync(this.paths.intentionsFile)) {
      return { intentions: [] };
    }
    const raw = fs.readFileSync(this.paths.intentionsFile, 'utf-8');
    return JSON.parse(raw) as IntentionsFile;
  }

  writeIntentions(file: IntentionsFile): void {
    fs.writeFileSync(this.paths.intentionsFile, JSON.stringify(file, null, 2), 'utf-8');
  }

  addIntention(text: string, context?: string, originSession?: string): Intention {
    const file = this.readIntentions();
    const intention: Intention = {
      id: randomBytes(4).toString('hex'),
      text,
      createdAt: new Date().toISOString(),
      status: 'active',
      context,
      originSession,
    };
    file.intentions.push(intention);
    this.writeIntentions(file);
    return intention;
  }

  resolveIntention(id: string, status: 'kept' | 'abandoned'): Intention | null {
    const file = this.readIntentions();
    const target = file.intentions.find((i) => i.id === id);
    if (!target) return null;
    target.status = status;
    target.resolvedAt = new Date().toISOString();
    this.writeIntentions(file);
    return target;
  }

  touchIntention(id: string): void {
    const file = this.readIntentions();
    const target = file.intentions.find((i) => i.id === id);
    if (!target) return;
    target.lastCheckedAt = new Date().toISOString();
    this.writeIntentions(file);
  }

  activeIntentions(): Intention[] {
    return this.readIntentions().intentions.filter((i) => i.status === 'active');
  }

  writeSession(session: JournalSession): string {
    const dir = session.vault ? this.paths.vaultDir : this.paths.sessionsDir;
    fs.mkdirSync(dir, { recursive: true });
    const fileName = `${session.slug}.md`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, session.content, 'utf-8');
    return filePath;
  }

  listSessions(includeVault = false): { filePath: string; slug: string; vault: boolean }[] {
    const out: { filePath: string; slug: string; vault: boolean }[] = [];
    if (fs.existsSync(this.paths.sessionsDir)) {
      for (const f of fs.readdirSync(this.paths.sessionsDir)) {
        if (f.endsWith('.md')) {
          out.push({
            filePath: path.join(this.paths.sessionsDir, f),
            slug: f.replace(/\.md$/, ''),
            vault: false,
          });
        }
      }
    }
    if (includeVault && fs.existsSync(this.paths.vaultDir)) {
      for (const f of fs.readdirSync(this.paths.vaultDir)) {
        if (f.endsWith('.md')) {
          out.push({
            filePath: path.join(this.paths.vaultDir, f),
            slug: f.replace(/\.md$/, ''),
            vault: true,
          });
        }
      }
    }
    return out.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  summarize(): JournalSummary {
    const sessions = this.listSessions(false);
    const intentions = this.readIntentions().intentions;

    const projects = new Set<string>();
    const recent: { slug: string; date: string; projectName: string }[] = [];

    // Slug format: YYYY-MM-DD-project-name
    for (const s of sessions) {
      const match = /^(\d{4}-\d{2}-\d{2})-(.+)$/.exec(s.slug);
      if (match) {
        projects.add(match[2]);
        recent.push({ slug: s.slug, date: match[1], projectName: match[2] });
      }
    }

    recent.sort((a, b) => b.date.localeCompare(a.date));

    return {
      totalSessions: sessions.length,
      projects: [...projects].sort(),
      activeIntentions: intentions.filter((i) => i.status === 'active'),
      resolvedIntentions: intentions.filter((i) => i.status !== 'active'),
      recentSessions: recent.slice(0, 10),
      recurringConcepts: [],
    };
  }

  private defaultReadme(): string {
    const today = new Date().toISOString().slice(0, 10);
    return `# Personal Learning Journal

*Started: ${today}*

This is a personal learning journal maintained by **The Weaver**. It is a
dedicated space to track your development evolution across projects.

## Structure

- \`intentions.json\` — things you want future-you to remember, with status
- \`current-state.md\` — rolling snapshot regenerated after every session
- \`sessions/\` — one file per retrospective, one project at a time
- \`insights/\` — cross-project patterns you name yourself
- \`concepts/\` — a growing glossary of things you have learned
- \`vault/\` — private entries that never appear in exports without re-consent
- \`prompts/\` — ready-to-paste conversation seeds (mentor, AI tutor, future-self)

## Privacy

Nothing here is ever uploaded anywhere by The Weaver. If you want a backup,
push this directory to a private Git remote using your normal git tooling.

## Reading this later

If The Weaver is gone or you no longer use it, this journal is just plain
markdown and JSON. It will still read cleanly.
`;
  }

  private defaultGitignore(): string {
    return `# Per your own discretion — the vault holds entries marked private.
# Uncomment the next line if you want to exclude vault entries from git:
# vault/
`;
  }
}
