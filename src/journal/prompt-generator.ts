import * as fs from 'node:fs';
import * as path from 'node:path';
import type { JournalManager } from './journal-manager.js';

/**
 * Regenerates the prompts/ directory — ready-to-paste conversation seeds
 * that reference the current journal state. User copies one and pastes it
 * into a mentor chat, an AI tutor session, or their own notes.
 *
 * These prompts do NOT include vault content. If the user wants to share
 * vault material, they have to export it manually via the re-consent flow.
 */
export class PromptGenerator {
  constructor(private readonly journal: JournalManager) {}

  regenerate(): void {
    fs.mkdirSync(this.journal.paths.promptsDir, { recursive: true });
    const summary = this.journal.summarize();

    this.write('ask-a-mentor.md', this.mentorPrompt(summary));
    this.write('tutor-me.md', this.tutorPrompt(summary));
    this.write('future-self.md', this.futureSelfPrompt(summary));
  }

  private write(name: string, content: string): void {
    fs.writeFileSync(path.join(this.journal.paths.promptsDir, name), content, 'utf-8');
  }

  private mentorPrompt(summary: ReturnType<typeof this.journal.summarize>): string {
    const sessions = summary.recentSessions.slice(0, 3)
      .map((s) => `- ${s.date} — ${s.projectName}`)
      .join('\n') || '- (no sessions yet)';

    const intentions = summary.activeIntentions.slice(0, 5)
      .map((i) => `- ${i.text}`)
      .join('\n') || '- (none active)';

    return `# Ask a mentor

Paste this into a conversation with someone whose judgment you trust — a senior engineer, a coach, a peer who ships.

---

I have been keeping a development journal to track what I'm learning across projects. I want a second pair of eyes on what I'm seeing.

**Recent projects I've worked on:**

${sessions}

**Intentions I have currently set for myself:**

${intentions}

The full journal is ${summary.totalSessions} session(s) across ${summary.projects.length} project(s). I can share more detail if you want to go deeper.

**What I'm asking**: Looking at this summary, what patterns do you notice that I might be too close to see? Where would you push back on an intention I've set? What is a question I should be asking myself that I'm not?

Do not validate me. Do not give me an action list. Tell me what you see.
`;
  }

  private tutorPrompt(summary: ReturnType<typeof this.journal.summarize>): string {
    const sessions = summary.recentSessions.slice(0, 3)
      .map((s) => `- ${s.date} — ${s.projectName}`)
      .join('\n') || '- (no sessions yet)';

    return `# Tutor me

Paste this into Claude, ChatGPT, or any AI coding assistant. Attach the relevant session file(s) from \`sessions/\` for context if the tool supports file upload.

---

I have a personal development journal. I want you to act as a tutor, not a cheerleader.

**Recent sessions:**

${sessions}

**What I want from you:**

1. Read the attached session(s) carefully.
2. Identify the 3 concepts I clearly lacked when I hit the patterns described. Do not just name them — explain what they are in a way that fills the gap.
3. Quiz me on each concept. One question at a time. Wait for my answer before moving on.
4. When I get something wrong, explain it. When I get it right, go deeper.
5. At the end, give me a short study plan: what would be worth reading, building, or practicing based on where I got things wrong.

Do not be polite about gaps. I am trying to learn, not feel good.
`;
  }

  private futureSelfPrompt(summary: ReturnType<typeof this.journal.summarize>): string {
    const intentions = summary.activeIntentions
      .map((i) => `- ${i.text}${i.context ? ` _(${i.context})_` : ''}`)
      .join('\n') || '_No active intentions yet._';

    const projects = summary.projects.length > 0
      ? summary.projects.join(', ')
      : '(no projects recorded yet)';

    return `# For future-me, at the start of the next project

Paste this into your notes or your new project's README when you're starting something fresh. Read it before writing any code.

---

## What I said I wanted to remember

${intentions}

## Projects I've learned from

${projects}

## The question to ask before starting

Before I write a single line, I'm going to sit with these questions:

1. Which of the active intentions above is relevant to this project?
2. What did I learn from the previous projects that I am at risk of forgetting under deadline pressure?
3. What's the smallest version of this project that would prove the idea? (Not the smallest version I'll settle for — the smallest that would actually prove it.)

## The commitment

I'll run a retrospective on this project when it's done — whether it ships, pivots, or dies. The journal only works if I keep feeding it.

_Generated from a journal with ${summary.totalSessions} session(s) so far._
`;
  }
}
