import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { JournalManager } from '../../src/journal/journal-manager.js';
import { StateWriter } from '../../src/journal/state-writer.js';
import { PromptGenerator } from '../../src/journal/prompt-generator.js';
import { ReflectGenerator } from '../../src/journal/reflect-generator.js';

describe('StateWriter', () => {
  let tmpDir: string;
  let journal: JournalManager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weaver-state-test-'));
    journal = new JournalManager(tmpDir);
    journal.init();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes a current-state.md file with empty sections on a fresh journal', () => {
    const content = new StateWriter(journal).regenerate();
    expect(fs.existsSync(journal.paths.stateFile)).toBe(true);
    expect(content).toContain('# Current state');
    expect(content).toContain('None yet');
    expect(content).toContain('Session count**: 0');
  });

  it('lists active intentions in the state file', () => {
    journal.addIntention('pick one deploy target', 'from RunChart-Goal');
    journal.addIntention('set up CI before writing features');
    const content = new StateWriter(journal).regenerate();
    expect(content).toContain('pick one deploy target');
    expect(content).toContain('set up CI before writing features');
    expect(content).toContain('from RunChart-Goal');
  });

  it('lists recent sessions with links', () => {
    journal.writeSession({
      slug: '2026-04-18-runchart-goal',
      date: '2026-04-18T00:00:00Z',
      projectPath: '/tmp/x',
      projectName: 'runchart-goal',
      content: '',
      vault: false,
    });
    const content = new StateWriter(journal).regenerate();
    expect(content).toContain('runchart-goal');
    expect(content).toContain('sessions/2026-04-18-runchart-goal.md');
  });

  it('excludes vault sessions from the recent list', () => {
    journal.writeSession({
      slug: '2026-04-18-public', date: '', projectPath: '', projectName: 'public', content: '', vault: false,
    });
    journal.writeSession({
      slug: '2026-04-19-private', date: '', projectPath: '', projectName: 'private', content: '', vault: true,
    });
    const content = new StateWriter(journal).regenerate();
    expect(content).toContain('public');
    expect(content).not.toContain('private');
  });
});

describe('PromptGenerator', () => {
  let tmpDir: string;
  let journal: JournalManager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weaver-prompts-test-'));
    journal = new JournalManager(tmpDir);
    journal.init();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates three canonical prompts', () => {
    new PromptGenerator(journal).regenerate();
    expect(fs.existsSync(path.join(journal.paths.promptsDir, 'ask-a-mentor.md'))).toBe(true);
    expect(fs.existsSync(path.join(journal.paths.promptsDir, 'tutor-me.md'))).toBe(true);
    expect(fs.existsSync(path.join(journal.paths.promptsDir, 'future-self.md'))).toBe(true);
  });

  it('embeds active intentions in future-self prompt', () => {
    journal.addIntention('pick one deploy target first');
    new PromptGenerator(journal).regenerate();
    const futureSelf = fs.readFileSync(path.join(journal.paths.promptsDir, 'future-self.md'), 'utf-8');
    expect(futureSelf).toContain('pick one deploy target first');
  });

  it('shows recent sessions in mentor prompt', () => {
    journal.writeSession({
      slug: '2026-04-18-runchart-goal',
      date: '', projectPath: '', projectName: 'runchart-goal', content: '', vault: false,
    });
    new PromptGenerator(journal).regenerate();
    const mentor = fs.readFileSync(path.join(journal.paths.promptsDir, 'ask-a-mentor.md'), 'utf-8');
    expect(mentor).toContain('runchart-goal');
  });
});

describe('ReflectGenerator', () => {
  let tmpDir: string;
  let journal: JournalManager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weaver-reflect-test-'));
    journal = new JournalManager(tmpDir);
    journal.init();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('handles an empty journal gracefully', () => {
    const report = new ReflectGenerator(journal).generate();
    expect(report).toContain('# Reflection');
    expect(report).toContain('No intentions recorded yet');
  });

  it('detects recurring intentions by similar wording', () => {
    journal.addIntention('pick one deployment target before coding');
    journal.addIntention('pick one deployment target first');
    const report = new ReflectGenerator(journal).generate();
    expect(report).toContain('Recurring intentions');
    expect(report).toMatch(/set 2 time/);
  });

  it('reports kept vs abandoned breakdown', () => {
    const a = journal.addIntention('one');
    const b = journal.addIntention('two');
    journal.addIntention('three');
    journal.resolveIntention(a.id, 'kept');
    journal.resolveIntention(b.id, 'abandoned');
    const report = new ReflectGenerator(journal).generate();
    expect(report).toContain('### Kept');
    expect(report).toContain('### Still active');
    expect(report).toContain('### Abandoned');
  });
});
