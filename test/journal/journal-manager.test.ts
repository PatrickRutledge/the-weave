import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { JournalManager } from '../../src/journal/journal-manager.js';

describe('JournalManager', () => {
  let tmpDir: string;
  let journal: JournalManager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weaver-journal-test-'));
    journal = new JournalManager(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('does not exist before init', () => {
    // Fresh empty tmp dir — no intentions.json yet
    expect(journal.exists()).toBe(false);
  });

  it('creates the expected directory structure on init', () => {
    journal.init();

    expect(fs.existsSync(journal.paths.sessionsDir)).toBe(true);
    expect(fs.existsSync(journal.paths.insightsDir)).toBe(true);
    expect(fs.existsSync(journal.paths.conceptsDir)).toBe(true);
    expect(fs.existsSync(journal.paths.vaultDir)).toBe(true);
    expect(fs.existsSync(journal.paths.promptsDir)).toBe(true);
    expect(fs.existsSync(journal.paths.intentionsFile)).toBe(true);
    expect(fs.existsSync(journal.paths.readme)).toBe(true);
    expect(fs.existsSync(journal.paths.gitignore)).toBe(true);
  });

  it('is idempotent (safe to re-run init)', () => {
    journal.init();
    const intention = journal.addIntention('preserve me');
    journal.init();
    expect(journal.readIntentions().intentions).toHaveLength(1);
    expect(journal.readIntentions().intentions[0].text).toBe('preserve me');
  });

  describe('intentions', () => {
    beforeEach(() => journal.init());

    it('records an intention with text and status active', () => {
      const i = journal.addIntention('pick one deploy target first');
      expect(i.status).toBe('active');
      expect(i.id).toHaveLength(8);
      expect(i.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('lists only active intentions', () => {
      journal.addIntention('one');
      const two = journal.addIntention('two');
      journal.resolveIntention(two.id, 'kept');
      const active = journal.activeIntentions();
      expect(active).toHaveLength(1);
      expect(active[0].text).toBe('one');
    });

    it('records resolvedAt when marked kept/abandoned', () => {
      const i = journal.addIntention('something');
      const resolved = journal.resolveIntention(i.id, 'abandoned');
      expect(resolved?.status).toBe('abandoned');
      expect(resolved?.resolvedAt).toBeDefined();
    });

    it('returns null when resolving a non-existent id', () => {
      expect(journal.resolveIntention('does-not-exist', 'kept')).toBeNull();
    });

    it('touches lastCheckedAt without changing status', () => {
      const i = journal.addIntention('still live');
      journal.touchIntention(i.id);
      const reread = journal.readIntentions().intentions[0];
      expect(reread.status).toBe('active');
      expect(reread.lastCheckedAt).toBeDefined();
    });
  });

  describe('sessions', () => {
    beforeEach(() => journal.init());

    it('writes a session to sessions/ when vault=false', () => {
      const filePath = journal.writeSession({
        slug: '2026-04-18-runchart-goal',
        date: '2026-04-18T00:00:00Z',
        projectPath: '/tmp/runchart',
        projectName: 'runchart-goal',
        content: '# test content',
        vault: false,
      });
      expect(filePath).toContain('sessions');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('writes a session to vault/ when vault=true', () => {
      const filePath = journal.writeSession({
        slug: '2026-04-18-private-thoughts',
        date: '2026-04-18T00:00:00Z',
        projectPath: '/tmp/x',
        projectName: 'x',
        content: '# private',
        vault: true,
      });
      expect(filePath).toContain('vault');
    });

    it('excludes vault sessions from listSessions() by default', () => {
      journal.writeSession({
        slug: '2026-01-01-public', date: '', projectPath: '', projectName: '', content: '', vault: false,
      });
      journal.writeSession({
        slug: '2026-01-02-private', date: '', projectPath: '', projectName: '', content: '', vault: true,
      });
      expect(journal.listSessions(false)).toHaveLength(1);
      expect(journal.listSessions(true)).toHaveLength(2);
    });
  });

  describe('summarize', () => {
    beforeEach(() => journal.init());

    it('reports zero sessions when fresh', () => {
      const s = journal.summarize();
      expect(s.totalSessions).toBe(0);
      expect(s.projects).toEqual([]);
    });

    it('extracts project names from session slugs', () => {
      journal.writeSession({
        slug: '2026-04-18-runchart-goal', date: '', projectPath: '', projectName: '', content: '', vault: false,
      });
      journal.writeSession({
        slug: '2026-04-20-the-weave', date: '', projectPath: '', projectName: '', content: '', vault: false,
      });
      const s = journal.summarize();
      expect(s.projects).toEqual(['runchart-goal', 'the-weave']);
      expect(s.totalSessions).toBe(2);
    });

    it('separates active from resolved intentions', () => {
      const one = journal.addIntention('one');
      journal.addIntention('two');
      journal.resolveIntention(one.id, 'kept');
      const s = journal.summarize();
      expect(s.activeIntentions).toHaveLength(1);
      expect(s.resolvedIntentions).toHaveLength(1);
    });
  });
});
