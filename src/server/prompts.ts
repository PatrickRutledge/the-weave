import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerPrompts(server: McpServer): void {

  // ── Prompt 1: start_retrospective ──────────────────────
  server.registerPrompt(
    'start_retrospective',
    {
      title: 'Start Retrospective',
      description: 'Begin a full facilitated retrospective session on a git repository. Guides you through analysis, findings, dialogue, and lesson capture.',
      argsSchema: {
        repositoryPath: z.string().describe('Absolute path to the git repository'),
        rehearsal: z.string().optional().describe('Set to "true" to run in rehearsal/practice mode (nothing saved)'),
      },
    },
    async ({ repositoryPath, rehearsal }) => {
      const isRehearsal = rehearsal === 'true';
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `I'd like to do a retrospective on the repository at: ${repositoryPath}${isRehearsal ? ' (REHEARSAL MODE - nothing will be saved)' : ''}

Please follow this workflow:

1. **Analyze** — Use the \`analyze_repository\` tool to scan the repository's git history
2. **Identify** — Use the \`identify_lessons\` tool to find patterns and generate findings from SDLC perspectives
3. **Dialogue** — Use the \`agent_dialogue\` tool to walk through findings ONE AT A TIME
   - Present each finding with its evidence
   - Ask me one thoughtful question about each finding
   - Wait for my response before moving on
   - Use safety-first language (no blame, no judgment)
4. **Capture** — After all findings are discussed, use \`save_lesson\` to persist insights
5. **Synthesize** — Use \`generate_narrative\` to produce an evolution log

**Important guidelines:**
- Ask only ONE question at a time
- Acknowledge my answers before moving on
- If I say STOP, PAUSE, BREAK, or EXIT — stop immediately
- Focus on "what happened" and "what would help" not "what went wrong"
- This is about learning, not judgment
${isRehearsal ? '- REHEARSAL MODE: Do not save any files' : ''}`,
            },
          },
        ],
      };
    },
  );

  // ── Prompt 2: quick_scan ───────────────────────────────
  server.registerPrompt(
    'quick_scan',
    {
      title: 'Quick Scan',
      description: 'Rapid analysis of a repository without interactive dialogue. Get a summary of findings and patterns.',
      argsSchema: {
        repositoryPath: z.string().describe('Absolute path to the git repository'),
      },
    },
    async ({ repositoryPath }) => {
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `Do a quick scan of: ${repositoryPath}

1. Use \`analyze_repository\` to scan the repo
2. Use \`identify_lessons\` to find patterns
3. Use \`generate_narrative\` with format "quick-scan" to produce a summary

No interactive dialogue needed — just analyze and report.`,
            },
          },
        ],
      };
    },
  );

  // ── Prompt 3: investigate ──────────────────────────────
  server.registerPrompt(
    'investigate',
    {
      title: 'Investigate Pattern',
      description: 'Deep dive investigation into a specific development pattern found in a repository.',
      argsSchema: {
        repositoryPath: z.string().describe('Absolute path to the git repository'),
        pattern: z.string().describe('Pattern to investigate: circular_development, time_sinks, abandoned_work, build_failures, hotspots, or custom'),
      },
    },
    async ({ repositoryPath, pattern }) => {
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `I want to investigate the "${pattern}" pattern in: ${repositoryPath}

1. Use \`analyze_repository\` to scan the repo
2. Focus specifically on "${pattern}" patterns in the analysis
3. Use \`agent_dialogue\` to walk me through each instance of this pattern
4. Ask me what was happening during each occurrence — one question at a time
5. Capture lessons about what caused this pattern and how to prevent it

Use the depth ladder:
- Surface → What happened?
- Deeper → What constraint or context caused it?
- Root → What systemic issue is behind it?
- Action → How can we prevent this systematically?`,
            },
          },
        ],
      };
    },
  );

  // ── Prompt 4: debate ───────────────────────────────────
  server.registerPrompt(
    'debate',
    {
      title: 'Perspective Debate',
      description: 'Two SDLC perspectives discuss a finding, offering different viewpoints for deeper understanding.',
      argsSchema: {
        repositoryPath: z.string().describe('Absolute path to the git repository'),
        perspective1: z.string().describe('First perspective ID (e.g., "architecture-design")'),
        perspective2: z.string().describe('Second perspective ID (e.g., "development-coding")'),
        findingIndex: z.string().optional().describe('Finding index to debate (1-based, default: current)'),
      },
    },
    async ({ repositoryPath, perspective1, perspective2, findingIndex }) => {
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `I want to see a debate between two perspectives on a finding from: ${repositoryPath}

**Perspective 1**: ${perspective1}
**Perspective 2**: ${perspective2}
${findingIndex ? `**Finding**: #${findingIndex}` : '**Finding**: Current finding'}

Please:
1. First analyze the repository if not already done (\`analyze_repository\`)
2. Identify findings if not already done (\`identify_lessons\`)
3. Take the ${findingIndex ? `#${findingIndex}` : 'current'} finding
4. Present what each perspective would say about this finding:
   - What does ${perspective1} see as the core issue?
   - What does ${perspective2} see as the core issue?
   - Where do they agree? Where do they disagree?
   - What would each perspective recommend?
5. Then ask me: "Which perspective resonates more with your experience, and why?"

This helps me see the finding from multiple angles before drawing conclusions.`,
            },
          },
        ],
      };
    },
  );

  // ── Prompt 5: generate_report ──────────────────────────
  server.registerPrompt(
    'generate_report',
    {
      title: 'Generate Report',
      description: 'Produce a final retrospective report in chosen format from the current session.',
      argsSchema: {
        repositoryPath: z.string().describe('Absolute path to the git repository'),
        format: z.string().optional().describe('Report format: evolution-log (default), quick-scan, or summary'),
        save: z.string().optional().describe('Set to "true" to save to .weave/logs/'),
      },
    },
    async ({ repositoryPath, format, save }) => {
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `Please generate a ${format ?? 'evolution-log'} report for: ${repositoryPath}

Use \`generate_narrative\` with:
- format: "${format ?? 'evolution-log'}"
- save: ${save === 'true' ? 'true' : 'false'}

If there's an active session with lessons captured, include those in the report.
If not, do a quick analysis first using \`analyze_repository\` and \`identify_lessons\`.`,
            },
          },
        ],
      };
    },
  );
}
