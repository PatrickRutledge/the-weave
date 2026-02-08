import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SessionOrchestrator } from '../orchestrator/session-orchestrator.js';
import { ReviewOrchestrator } from '../orchestrator/review-orchestrator.js';
import { InvestigationOrchestrator } from '../orchestrator/investigation-orchestrator.js';
import { WeaveWriter } from '../weave/weave-writer.js';
import { WeaveLoader } from '../weave/weave-loader.js';
import { GitAnalyzer } from '../engine/git-analyzer.js';
import type { RepositoryAnalysis } from '../engine/types.js';

export function registerTools(server: McpServer, orchestrator: SessionOrchestrator): void {

  // ── Tool 1: analyze_repository ─────────────────────────
  server.registerTool(
    'analyze_repository',
    {
      title: 'Analyze Repository',
      description: 'Scan a git repository\'s history, branches, diffs, and file changes to identify development patterns.',
      inputSchema: {
        repositoryPath: z.string().describe('Absolute path to the git repository to analyze'),
        maxCommits: z.number().optional().default(500).describe('Maximum number of commits to analyze (default: 500)'),
      },
    },
    async ({ repositoryPath, maxCommits }) => {
      try {
        const analysis = await orchestrator.analyzeRepository(repositoryPath);
        const serializable = {
          ...analysis,
          commitFrequency: {
            ...analysis.commitFrequency,
            daily: Object.fromEntries(analysis.commitFrequency.daily),
          },
        };
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(serializable, null, 2),
          }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error analyzing repository: ${err}` }],
          isError: true,
        };
      }
    },
  );

  // ── Tool 2: analyze_dependencies ───────────────────────
  server.registerTool(
    'analyze_dependencies',
    {
      title: 'Analyze Dependencies',
      description: 'Examine package.json, configuration files, and detect frameworks and tool choices in a repository.',
      inputSchema: {
        repositoryPath: z.string().describe('Absolute path to the repository'),
      },
    },
    async ({ repositoryPath }) => {
      try {
        const { DependencyAnalyzer } = await import('../engine/dependency-analyzer.js');
        const analyzer = new DependencyAnalyzer(repositoryPath);
        const result = await analyzer.analyze();
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error analyzing dependencies: ${err}` }],
          isError: true,
        };
      }
    },
  );

  // ── Tool 3: identify_lessons ───────────────────────────
  server.registerTool(
    'identify_lessons',
    {
      title: 'Identify Lessons',
      description: 'Apply SDLC perspectives to a repository analysis to generate a prioritized list of findings and questions for retrospective dialogue.',
      inputSchema: {
        repositoryPath: z.string().describe('Absolute path to the repository'),
        perspectives: z.array(z.string()).optional().describe('Specific perspective IDs to apply (default: all)'),
      },
    },
    async ({ repositoryPath, perspectives }) => {
      try {
        // Ensure we have an analysis
        let analysis = orchestrator.getLastAnalysis();
        if (!analysis || analysis.path !== repositoryPath) {
          analysis = await orchestrator.analyzeRepository(repositoryPath);
        }

        orchestrator.startSession(repositoryPath, 'retrospective');
        const findings = await orchestrator.identifyFindings(analysis, perspectives);

        const summary = findings.map((f, i) =>
          `${i + 1}. [${f.severity}] ${f.title} (${f.perspective})`
        ).join('\n');

        return {
          content: [{
            type: 'text' as const,
            text: `# Identified ${findings.length} Finding(s)\n\n${summary}\n\nUse \`agent_dialogue\` to discuss each finding interactively, or \`manage_lesson_list\` to reorder/skip/merge findings.`,
          }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error identifying lessons: ${err}` }],
          isError: true,
        };
      }
    },
  );

  // ── Tool 4: manage_lesson_list ─────────────────────────
  server.registerTool(
    'manage_lesson_list',
    {
      title: 'Manage Lesson List',
      description: 'Add, merge, skip, prioritize, or jump through the findings list during a retrospective session.',
      inputSchema: {
        action: z.enum(['skip', 'prioritize', 'merge', 'jump', 'status']).describe('Action to perform on the lesson list'),
        findingId: z.string().optional().describe('Finding ID (for prioritize)'),
        findingIds: z.array(z.string()).optional().describe('Finding IDs (for merge)'),
        jumpTo: z.number().optional().describe('Index to jump to (for jump, 1-based)'),
      },
    },
    async ({ action, findingId, findingIds, jumpTo }) => {
      const lessonMgr = orchestrator.getLessonManager();
      const stateMgr = orchestrator.getStateManager();

      switch (action) {
        case 'skip': {
          const next = lessonMgr.skip();
          return {
            content: [{ type: 'text' as const, text: next ? `Skipped. Next: ${next.title}` : 'No more findings.' }],
          };
        }
        case 'prioritize': {
          if (!findingId) return { content: [{ type: 'text' as const, text: 'findingId required for prioritize' }], isError: true };
          lessonMgr.prioritize(findingId);
          return { content: [{ type: 'text' as const, text: `Finding ${findingId} moved to next position.` }] };
        }
        case 'merge': {
          if (!findingIds || findingIds.length < 2) return { content: [{ type: 'text' as const, text: 'Need at least 2 findingIds to merge' }], isError: true };
          lessonMgr.merge(findingIds);
          return { content: [{ type: 'text' as const, text: `Merged ${findingIds.length} findings.` }] };
        }
        case 'jump': {
          if (jumpTo === undefined) return { content: [{ type: 'text' as const, text: 'jumpTo index required' }], isError: true };
          const finding = lessonMgr.jumpTo(jumpTo - 1);
          return { content: [{ type: 'text' as const, text: finding ? `Jumped to finding ${jumpTo}: ${finding.title}` : 'Invalid index.' }] };
        }
        case 'status': {
          const progress = stateMgr.getProgress();
          const state = stateMgr.getState();
          return {
            content: [{
              type: 'text' as const,
              text: `Session: ${state.mode} | Status: ${state.status} | Progress: ${progress.current}/${progress.total} (${progress.percent}%) | Lessons captured: ${state.lessons.length}`,
            }],
          };
        }
      }
    },
  );

  // ── Tool 5: agent_dialogue ─────────────────────────────
  server.registerTool(
    'agent_dialogue',
    {
      title: 'Agent Dialogue',
      description: 'Engage in one-question-at-a-time dialogue about the current finding from a specific SDLC perspective. Provide your response to capture a lesson and advance to the next finding.',
      inputSchema: {
        response: z.string().optional().describe('Your response to the current finding question. Omit to see the current question.'),
      },
    },
    async ({ response }) => {
      const stateMgr = orchestrator.getStateManager();
      const reviewOrch = new ReviewOrchestrator(stateMgr, orchestrator.getLessonManager());
      const state = stateMgr.getState();

      // Check consent
      if (!orchestrator.getConsentGate().isActive()) {
        orchestrator.getConsentGate().grant('dialogue-start');
      }

      // Check for safe words
      if (response) {
        const consent = orchestrator.getConsentGate().interceptInput(response, 'user');
        if (!consent.proceed) {
          stateMgr.setStatus('stopped');
          return { content: [{ type: 'text' as const, text: `Session stopped: ${consent.reason}` }] };
        }
      }

      const finding = stateMgr.getCurrentFinding();
      if (!finding) {
        return { content: [{ type: 'text' as const, text: 'No more findings to discuss. Use `generate_narrative` to create your evolution log.' }] };
      }

      if (!response) {
        // Show current question
        const progress = stateMgr.getProgress();
        const question = reviewOrch.formatFindingAsQuestion(finding, progress);
        return { content: [{ type: 'text' as const, text: question }] };
      }

      // Process response and capture lesson
      const lesson = reviewOrch.processResponse(finding, response);

      // Record comfort
      orchestrator.getComfortMeter().recordResponse(response.length * 50); // rough proxy

      // Advance to next finding
      const next = stateMgr.advanceFinding();
      const progress = stateMgr.getProgress();

      if (!next) {
        stateMgr.setStatus('synthesizing');
        return {
          content: [{
            type: 'text' as const,
            text: `Lesson captured: "${lesson.title}"\n\nAll findings reviewed! Use \`generate_narrative\` to create your evolution log.`,
          }],
        };
      }

      const nextQuestion = reviewOrch.formatFindingAsQuestion(next, progress);
      return {
        content: [{
          type: 'text' as const,
          text: `Lesson captured: "${lesson.title}"\n\n---\n\n${nextQuestion}`,
        }],
      };
    },
  );

  // ── Tool 6: save_lesson ────────────────────────────────
  server.registerTool(
    'save_lesson',
    {
      title: 'Save Lesson',
      description: 'Persist captured lessons to the .weave/ directory in the repository.',
      inputSchema: {
        repositoryPath: z.string().describe('Absolute path to the repository'),
      },
    },
    async ({ repositoryPath }) => {
      // Check rehearsal mode
      const rehearsal = orchestrator.getRehearsalMode();
      if (rehearsal.isActive()) {
        return {
          content: [{ type: 'text' as const, text: 'Cannot save in rehearsal mode — this is practice only.' }],
          isError: true,
        };
      }

      const lessons = orchestrator.getLessonManager().getLessons();
      if (lessons.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No lessons to save.' }] };
      }

      const writer = new WeaveWriter(repositoryPath);
      const paths = await writer.saveLessons(lessons);

      return {
        content: [{
          type: 'text' as const,
          text: `Saved ${paths.length} lesson(s) to .weave/lessons/:\n${paths.map(p => `- ${p}`).join('\n')}`,
        }],
      };
    },
  );

  // ── Tool 7: generate_narrative ─────────────────────────
  server.registerTool(
    'generate_narrative',
    {
      title: 'Generate Narrative',
      description: 'Produce an evolution log, summary report, or full retrospective narrative from the current session.',
      inputSchema: {
        repositoryPath: z.string().describe('Absolute path to the repository'),
        format: z.enum(['evolution-log', 'quick-scan', 'summary']).optional().default('evolution-log').describe('Output format'),
        save: z.boolean().optional().default(false).describe('Save to .weave/logs/ directory'),
      },
    },
    async ({ repositoryPath, format, save }) => {
      const stateMgr = orchestrator.getStateManager();
      const reviewOrch = new ReviewOrchestrator(stateMgr, orchestrator.getLessonManager());
      const analysis = orchestrator.getLastAnalysis();
      const state = stateMgr.getState();

      if (!analysis) {
        return {
          content: [{ type: 'text' as const, text: 'No analysis available. Run `analyze_repository` first.' }],
          isError: true,
        };
      }

      let narrative: string;

      if (format === 'quick-scan') {
        narrative = reviewOrch.generateQuickScan(analysis, state.findings);
      } else {
        narrative = reviewOrch.generateEvolutionLog(analysis, state.lessons);
      }

      if (save) {
        const rehearsal = orchestrator.getRehearsalMode();
        if (rehearsal.isActive()) {
          return {
            content: [{ type: 'text' as const, text: `${narrative}\n\n---\n*Cannot save in rehearsal mode.*` }],
          };
        }

        const writer = new WeaveWriter(repositoryPath);
        const filePath = await writer.saveEvolutionLog(narrative, state.id);
        return {
          content: [{
            type: 'text' as const,
            text: `${narrative}\n\n---\n*Saved to: ${filePath}*`,
          }],
        };
      }

      return { content: [{ type: 'text' as const, text: narrative }] };
    },
  );

  // ── Tool 8: cross_project_patterns ─────────────────────
  server.registerTool(
    'cross_project_patterns',
    {
      title: 'Cross-Project Patterns',
      description: 'Analyze patterns across multiple repositories to find recurring themes and systemic issues.',
      inputSchema: {
        repositoryPaths: z.array(z.string()).min(2).describe('Paths to git repositories to compare'),
      },
    },
    async ({ repositoryPaths }) => {
      try {
        const analyses: RepositoryAnalysis[] = [];
        for (const repoPath of repositoryPaths) {
          const gitAnalyzer = new GitAnalyzer(repoPath);
          analyses.push(await gitAnalyzer.analyze());
        }

        // Cross-project comparison
        const lines: string[] = [];
        lines.push('# Cross-Project Pattern Analysis');
        lines.push('');

        for (const analysis of analyses) {
          lines.push(`## ${analysis.path}`);
          lines.push(`- ${analysis.totalCommits} commits, ${analysis.activeBranches.length} branches`);
          lines.push(`- ${analysis.reverts.length} reverts, ${analysis.circularPatterns.length} circular patterns`);
          lines.push(`- Top hotspot: ${analysis.hotspots[0]?.path ?? 'none'} (${analysis.hotspots[0]?.changeCount ?? 0} changes)`);
          lines.push('');
        }

        // Find common patterns
        lines.push('## Common Patterns');
        const allReverts = analyses.reduce((sum, a) => sum + a.reverts.length, 0);
        const allCircular = analyses.reduce((sum, a) => sum + a.circularPatterns.length, 0);
        lines.push(`- Total reverts across all repos: ${allReverts}`);
        lines.push(`- Total circular patterns: ${allCircular}`);

        // Load any existing lessons
        const allLessons = [];
        for (const repoPath of repositoryPaths) {
          const loader = new WeaveLoader(repoPath);
          if (await loader.exists()) {
            const lessons = await loader.loadLessons();
            allLessons.push(...lessons);
          }
        }

        if (allLessons.length > 0) {
          lines.push('');
          lines.push('## Previously Captured Lessons');
          for (const lesson of allLessons) {
            lines.push(`- **${lesson.title}** (${lesson.perspective}): ${lesson.insight.slice(0, 100)}`);
          }
        }

        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error in cross-project analysis: ${err}` }],
          isError: true,
        };
      }
    },
  );
}
