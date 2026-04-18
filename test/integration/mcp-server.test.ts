import { describe, it, expect } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SessionOrchestrator } from '../../src/orchestrator/session-orchestrator.js';
import { registerTools } from '../../src/server/tools.js';
import { registerResources } from '../../src/server/resources.js';
import { registerPrompts } from '../../src/server/prompts.js';

describe('MCP Server Registration', () => {
  it('creates server without errors', () => {
    const server = new McpServer({ name: 'test', version: '0.0.1' });
    const orchestrator = new SessionOrchestrator();

    expect(() => {
      registerTools(server, orchestrator);
      registerResources(server, orchestrator);
      registerPrompts(server);
    }).not.toThrow();
  });
});

describe('SessionOrchestrator', () => {
  it('analyzes a real git repository', async () => {
    const orchestrator = new SessionOrchestrator();
    // Analyze the project's own repo
    const analysis = await orchestrator.analyzeRepository(process.cwd());

    expect(analysis.path).toBe(process.cwd());
    expect(analysis.totalCommits).toBeGreaterThan(0);
    expect(analysis.activeBranches.length).toBeGreaterThan(0);
    expect(analysis.authors.length).toBeGreaterThan(0);
    expect(analysis.analyzedAt).toBeTruthy();
    expect(analysis.dateRange.first).toBeTruthy();
    expect(analysis.dateRange.last).toBeTruthy();
  });

  it('identifies findings from analysis', async () => {
    const orchestrator = new SessionOrchestrator();
    const analysis = await orchestrator.analyzeRepository(process.cwd());

    orchestrator.startSession(process.cwd(), 'retrospective');
    const findings = await orchestrator.identifyFindings(analysis);

    // Should generate at least some findings with perspectives
    expect(Array.isArray(findings)).toBe(true);
    // Every finding should have required fields
    for (const f of findings) {
      expect(f.id).toBeTruthy();
      expect(f.perspectives.length).toBeGreaterThan(0);
      expect(f.title).toBeTruthy();
      expect(f.severity).toMatch(/^(critical|high|medium|low)$/);
      expect(f.category).toMatch(/^(pattern|antipattern|insight|question)$/);
    }
  });

  it('rejects non-git directories', async () => {
    const orchestrator = new SessionOrchestrator();
    await expect(orchestrator.analyzeRepository('/tmp')).rejects.toThrow();
  });

  it('manages consent gate', () => {
    const orchestrator = new SessionOrchestrator();
    expect(orchestrator.getConsentGate().isActive()).toBe(false);

    orchestrator.grantConsent();
    expect(orchestrator.getConsentGate().isActive()).toBe(true);
  });

  it('manages rehearsal mode', () => {
    const orchestrator = new SessionOrchestrator();
    expect(orchestrator.getRehearsalMode().isActive()).toBe(false);

    orchestrator.enableRehearsalMode();
    expect(orchestrator.getRehearsalMode().isActive()).toBe(true);
  });
});
