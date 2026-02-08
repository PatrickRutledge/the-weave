import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PerspectiveLoader } from '../perspectives/loader.js';
import { SessionOrchestrator } from '../orchestrator/session-orchestrator.js';
import { WeaveLoader } from '../weave/weave-loader.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export function registerResources(server: McpServer, orchestrator: SessionOrchestrator): void {
  const perspectiveLoader = new PerspectiveLoader();

  // ── Resource: Methodology ──────────────────────────────
  server.registerResource(
    'methodology',
    'weaver://methodology',
    {
      title: 'Facilitation Methodology',
      description: 'The Weaver\'s facilitation methodology based on military after-action reviews (AAR), Blue Angels debriefs, and organizational learning research.',
      mimeType: 'text/markdown',
    },
    async () => {
      const content = getMethodologyContent();
      return {
        contents: [{ uri: 'weaver://methodology', text: content }],
      };
    },
  );

  // ── Resource: Perspective (template) ───────────────────
  server.registerResource(
    'perspective',
    new ResourceTemplate('weaver://perspective/{perspectiveId}', { list: listPerspectives }),
    {
      title: 'SDLC Perspective',
      description: 'Individual SDLC perspective definition with triggers, questions, and patterns.',
      mimeType: 'text/markdown',
    },
    async (uri, { perspectiveId }) => {
      const perspective = await perspectiveLoader.get(perspectiveId as string);
      if (!perspective) {
        return { contents: [{ uri: uri.href, text: `Perspective "${perspectiveId}" not found.` }] };
      }

      const content = [
        `# ${perspective.name}`,
        '',
        perspective.description,
        '',
        '## Triggers',
        ...perspective.triggers.map(t => `- ${t}`),
        '',
        '## Question Focus',
        ...perspective.questionFocus.map(q => `- ${q}`),
        '',
        '## Anti-Patterns',
        ...perspective.antiPatterns.map(a => `- ${a}`),
        '',
        '## Success Patterns',
        ...perspective.successPatterns.map(s => `- ${s}`),
        '',
        '---',
        '',
        perspective.body,
      ].join('\n');

      return { contents: [{ uri: uri.href, text: content }] };
    },
  );

  // ── Resource: Best Practices ───────────────────────────
  server.registerResource(
    'best-practices',
    new ResourceTemplate('weaver://best-practices/{topic}', { list: undefined }),
    {
      title: 'Best Practices',
      description: 'Best practice reference documents for retrospective facilitation.',
      mimeType: 'text/markdown',
    },
    async (uri, { topic }) => {
      const content = getBestPracticesContent(topic as string);
      return { contents: [{ uri: uri.href, text: content }] };
    },
  );

  // ── Resource: Session State ────────────────────────────
  server.registerResource(
    'session-state',
    'weaver://session/state',
    {
      title: 'Session State',
      description: 'Current retrospective session state including findings, lessons, and progress.',
      mimeType: 'application/json',
    },
    async () => {
      const state = orchestrator.getStateManager().getState();
      return {
        contents: [{ uri: 'weaver://session/state', text: JSON.stringify(state, null, 2) }],
      };
    },
  );

  // ── Resource: Project Lessons (template) ───────────────
  server.registerResource(
    'project-lessons',
    new ResourceTemplate('weaver://project/{projectPath}/lessons', { list: undefined }),
    {
      title: 'Project Lessons',
      description: 'Previously captured lessons for a specific project.',
      mimeType: 'application/json',
    },
    async (uri, { projectPath }) => {
      const loader = new WeaveLoader(projectPath as string);
      const lessons = await loader.loadLessons();
      return {
        contents: [{ uri: uri.href, text: JSON.stringify(lessons, null, 2) }],
      };
    },
  );

  async function listPerspectives() {
    const perspectives = await perspectiveLoader.loadAll();
    return {
      resources: perspectives.map(p => ({
        uri: `weaver://perspective/${p.id}`,
        name: p.name,
        description: p.description,
        mimeType: 'text/markdown' as const,
      })),
    };
  }
}

function getMethodologyContent(): string {
  return `# The Weaver Facilitation Methodology

## Core Philosophy
The Weaver facilitates genuine reflection, not performance theater. Every feature must pass the test:
**"Does this increase genuine reflection or performance theater?"**

## Methodology Sources

### Blue Angels Debrief Rules
1. **No Blame** — Identify improvements, not fault
2. **Every Flight** — Review everything, success or failure
3. **Facts First** — What happened before why it happened
4. **Drive Out Fear** — Safety enables honesty

### Army After-Action Review (AAR) Sequence
1. What did we intend?
2. What actually happened?
3. Why the difference?
4. What should we learn?
5. How do we improve?

### Navy Lessons Learned
- **Rigorous Self-Assessment** — Don't accept problems, solve them
- **Systematic Review** — Same process every time
- **Transparency** — Hidden problems can't be fixed
- **Culture Matters** — Individual mistakes often have system causes

## The 25% Promise
Research shows teams that debrief effectively improve performance by 25%.

## Facilitation Principles

### The Depth Ladder
1. Surface: "The build failed"
2. Deeper: "Dependencies conflicted"
3. Deeper: "Documentation was incorrect"
4. Root: "No single source of truth for dependencies"
5. System: "Need dependency verification in CI"

### Safety-First Language
- "What happened?" (not "What went wrong?")
- "What would have helped?" (not "What should you have done?")
- "What did you learn?" (not "What was your mistake?")

### Going Deeper
- "What made that challenging?"
- "What constraint were you working within?"
- "When did you realize the approach wouldn't work?"
- "What would you tell someone starting this today?"

### Finding Systems Issues
- "Is this a pattern we've seen before?"
- "What in our process led to this?"
- "How could we prevent this systematically?"
- "What early warning sign did we miss?"

## Non-Negotiable Principles
1. **Human Agency Above All** — Explicit initiation, instant revoke
2. **Privacy by Default** — Local-first, ephemeral unless saved
3. **Psychological Safety First** — Safe words, rehearsal mode, comfort signals
4. **Anti-Performance Theater** — No gaming metrics, no surveillance
`;
}

function getBestPracticesContent(topic: string): string {
  const topics: Record<string, string> = {
    'facilitation': `# Facilitation Best Practices

## One Question at a Time
Never ask multiple questions. Wait for a response before continuing.

## Acknowledge Before Advancing
Show you understood the answer before moving to the next question.

## Respect Skips
User can skip questions. Move on gracefully, no pressure.

## Time Awareness
A full retrospective should take 20-30 minutes. Don't rush or overwhelm.

## Quality Indicators

### Good Signs
- Answers getting longer and richer
- User volunteering extra context
- "Aha" moments during conversation
- Specific constraints revealed
- System issues identified

### Warning Signs
- Single sentence answers
- Defensive language
- High skip rate
- Only technical issues surfaced
- No actionable insights
`,
    'patterns': `# Common Development Patterns

## Anti-Patterns to Watch For
- **Zealous Liar**: Following rules without understanding
- **Exhaustion Spiral**: Repeated attempts without stepping back
- **Circular Development**: Adding, removing, re-adding same code
- **Assumption Cascade**: Building on unverified assumptions
- **Tool Obsession**: Forcing wrong tool for the job

## Positive Patterns
- **Breakthrough Moments**: Sudden progress after struggle
- **Effective Pairing**: Human-AI collaboration that worked
- **Quick Pivots**: Recognizing wrong approach early
- **Verification Wins**: Catching issues before they cascaded
- **Learning Acceleration**: Rapid skill acquisition
`,
  };

  return topics[topic] ?? `# Best Practices: ${topic}\n\nNo specific best practices document found for "${topic}". Available topics: ${Object.keys(topics).join(', ')}`;
}
