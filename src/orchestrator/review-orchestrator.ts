import type { Finding, Lesson, RepositoryAnalysis, SessionState } from '../engine/types.js';
import { StateManager } from '../state/state-manager.js';
import { LessonManager } from './lesson-manager.js';

export class ReviewOrchestrator {
  private stateManager: StateManager;
  private lessonManager: LessonManager;

  constructor(stateManager: StateManager, lessonManager: LessonManager) {
    this.stateManager = stateManager;
    this.lessonManager = lessonManager;
  }

  formatFindingAsQuestion(finding: Finding, progress: { current: number; total: number }): string {
    const lines: string[] = [];

    lines.push(`### Finding ${progress.current} of ${progress.total}`);
    lines.push(`**Perspective**: ${finding.perspective}`);
    lines.push(`**Severity**: ${finding.severity}`);
    lines.push('');
    lines.push(finding.description);
    lines.push('');

    if (finding.evidence.length > 0) {
      lines.push('**Evidence:**');
      for (const e of finding.evidence.slice(0, 5)) {
        lines.push(`- ${e}`);
      }
      lines.push('');
    }

    // Generate appropriate question based on category
    switch (finding.category) {
      case 'antipattern':
        lines.push(`What was the root cause that led to this "${finding.title}" pattern?`);
        break;
      case 'pattern':
        lines.push(`What context or constraints drove this pattern?`);
        break;
      case 'insight':
        lines.push(`What insight or realization made the difference here?`);
        break;
      case 'question':
        lines.push(`What was your experience with this? What would you do differently?`);
        break;
    }

    return lines.join('\n');
  }

  processResponse(finding: Finding, response: string): Lesson {
    return this.lessonManager.captureFromDialogue(finding, response);
  }

  generateEvolutionLog(analysis: RepositoryAnalysis, lessons: Lesson[]): string {
    const lines: string[] = [];
    const state = this.stateManager.getState();

    lines.push('# Evolution Log');
    lines.push('');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Repository: ${analysis.path}`);
    lines.push(`Commits analyzed: ${analysis.totalCommits}`);
    lines.push(`Date range: ${analysis.dateRange.first} to ${analysis.dateRange.last}`);
    lines.push(`Lessons captured: ${lessons.length}`);
    lines.push('');

    // Patterns section
    lines.push('## Patterns Identified');
    lines.push('');

    const findings = state.findings;
    const antiPatterns = findings.filter(f => f.category === 'antipattern');
    const patterns = findings.filter(f => f.category === 'pattern');

    if (antiPatterns.length > 0) {
      lines.push('### Anti-Patterns');
      for (const f of antiPatterns) {
        lines.push(`- **${f.title}** (${f.severity}): ${f.description}`);
      }
      lines.push('');
    }

    if (patterns.length > 0) {
      lines.push('### Patterns');
      for (const f of patterns) {
        lines.push(`- **${f.title}** (${f.severity}): ${f.description}`);
      }
      lines.push('');
    }

    // Insights from dialogue
    if (lessons.length > 0) {
      lines.push('## Insights from Dialogue');
      lines.push('');
      for (const lesson of lessons) {
        lines.push(`### ${lesson.title}`);
        lines.push(`*Perspective: ${lesson.perspective}*`);
        lines.push('');
        lines.push(lesson.insight);
        lines.push('');

        if (lesson.actionItems.length > 0) {
          lines.push('**Action Items:**');
          for (const item of lesson.actionItems) {
            lines.push(`- [ ] ${item}`);
          }
          lines.push('');
        }
      }
    }

    // Framework improvements
    lines.push('## Recommended Improvements');
    lines.push('');

    const allActions = lessons.flatMap(l => l.actionItems);
    const unique = [...new Set(allActions)];

    const highPriority = unique.filter(a =>
      a.toLowerCase().includes('critical') ||
      a.toLowerCase().includes('tracking issue') ||
      a.toLowerCase().includes('process')
    );
    const mediumPriority = unique.filter(a => !highPriority.includes(a));

    if (highPriority.length > 0) {
      lines.push('### High Priority');
      for (const a of highPriority) {
        lines.push(`- [ ] ${a}`);
      }
      lines.push('');
    }

    if (mediumPriority.length > 0) {
      lines.push('### Medium Priority');
      for (const a of mediumPriority) {
        lines.push(`- [ ] ${a}`);
      }
      lines.push('');
    }

    // Summary stats
    lines.push('## Summary');
    lines.push('');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total commits | ${analysis.totalCommits} |`);
    lines.push(`| Active branches | ${analysis.activeBranches.length} |`);
    lines.push(`| Authors | ${analysis.authors.length} |`);
    lines.push(`| Findings reviewed | ${state.findings.length} |`);
    lines.push(`| Lessons captured | ${lessons.length} |`);

    if (analysis.dependencies) {
      lines.push(`| Production deps | ${analysis.dependencies.dependencies.filter(d => d.type === 'production').length} |`);
      lines.push(`| Frameworks | ${analysis.dependencies.frameworks.map(f => f.name).join(', ') || 'none detected'} |`);
    }

    return lines.join('\n');
  }

  generateQuickScan(analysis: RepositoryAnalysis, findings: Finding[]): string {
    const lines: string[] = [];

    lines.push('# Quick Scan Results');
    lines.push('');
    lines.push(`Repository: ${analysis.path}`);
    lines.push(`Analyzed: ${analysis.analyzedAt}`);
    lines.push('');

    // Summary
    lines.push('## Overview');
    lines.push(`- **${analysis.totalCommits}** commits analyzed`);
    lines.push(`- **${analysis.activeBranches.length}** branch(es)`);
    lines.push(`- **${analysis.authors.length}** contributor(s)`);
    lines.push(`- Date range: ${analysis.dateRange.first} to ${analysis.dateRange.last}`);
    lines.push('');

    // Key findings
    const critical = findings.filter(f => f.severity === 'critical');
    const high = findings.filter(f => f.severity === 'high');

    if (critical.length > 0 || high.length > 0) {
      lines.push('## Key Findings');
      lines.push('');
      for (const f of [...critical, ...high]) {
        lines.push(`- **[${f.severity.toUpperCase()}]** ${f.title}: ${f.description}`);
      }
      lines.push('');
    }

    // All findings summary
    lines.push('## All Findings');
    lines.push('');
    for (const f of findings) {
      lines.push(`- [${f.severity}] ${f.title}`);
    }
    lines.push('');

    lines.push('*Run a full retrospective for interactive dialogue about these findings.*');

    return lines.join('\n');
  }
}
