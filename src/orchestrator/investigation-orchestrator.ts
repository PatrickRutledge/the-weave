import type { Finding, Lesson, RepositoryAnalysis } from '../engine/types.js';
import { StateManager } from '../state/state-manager.js';
import { LessonManager } from './lesson-manager.js';

export class InvestigationOrchestrator {
  private stateManager: StateManager;
  private lessonManager: LessonManager;

  constructor(stateManager: StateManager, lessonManager: LessonManager) {
    this.stateManager = stateManager;
    this.lessonManager = lessonManager;
  }

  investigatePattern(pattern: string, analysis: RepositoryAnalysis): Finding[] {
    const findings: Finding[] = [];

    switch (pattern) {
      case 'circular_development':
        findings.push(...this.investigateCircular(analysis));
        break;
      case 'time_sinks':
        findings.push(...this.investigateTimeSinks(analysis));
        break;
      case 'abandoned_work':
        findings.push(...this.investigateAbandoned(analysis));
        break;
      case 'build_failures':
        findings.push(...this.investigateBuildFailures(analysis));
        break;
      case 'hotspots':
        findings.push(...this.investigateHotspots(analysis));
        break;
      default:
        findings.push(...this.investigateCustom(pattern, analysis));
        break;
    }

    this.stateManager.setFindings(findings);
    return findings;
  }

  private investigateCircular(analysis: RepositoryAnalysis): Finding[] {
    return analysis.circularPatterns.map((cp, i) => ({
      id: `circ-${i}`,
      perspective: 'development-coding',
      title: `Circular development: ${cp.file}`,
      description: cp.description,
      evidence: [`File: ${cp.file}`, `Pattern: add → remove → re-add`],
      severity: 'high' as const,
      category: 'antipattern' as const,
    }));
  }

  private investigateTimeSinks(analysis: RepositoryAnalysis): Finding[] {
    return analysis.timeSinks.map((ts, i) => ({
      id: `sink-${i}`,
      perspective: 'project-management',
      title: `Time sink: "${ts.topic}"`,
      description: `Feature area "${ts.topic}" consumed ${ts.commitCount} commits over ${ts.spanDays} days.`,
      evidence: [
        `${ts.commitCount} commits`,
        `${ts.spanDays} day span`,
        `Files: ${ts.files.slice(0, 5).join(', ')}`,
      ],
      severity: (ts.commitCount > 15 ? 'high' : 'medium') as Finding['severity'],
      category: 'pattern' as const,
    }));
  }

  private investigateAbandoned(analysis: RepositoryAnalysis): Finding[] {
    return analysis.activeBranches
      .filter(b => b.daysSinceLastCommit > 30)
      .map((branch, i) => ({
        id: `abandoned-${i}`,
        perspective: 'project-management',
        title: `Abandoned branch: ${branch.name}`,
        description: `Branch "${branch.name}" has had no activity for ${branch.daysSinceLastCommit} days.`,
        evidence: [
          `Last commit: ${branch.lastCommitDate}`,
          `${branch.commitCount} total commits`,
          branch.isMerged ? 'Branch was merged' : 'Branch was NOT merged',
        ],
        severity: (branch.commitCount > 10 && !branch.isMerged ? 'high' : 'medium') as Finding['severity'],
        category: 'question' as const,
      }));
  }

  private investigateBuildFailures(analysis: RepositoryAnalysis): Finding[] {
    // Look for clusters with fix/build-related messages
    const findings: Finding[] = [];

    for (const cluster of analysis.clusters) {
      const fixCommits = cluster.commits.filter(c =>
        /\b(fix|broken|fail|error|bug)\b/i.test(c.message)
      );

      if (fixCommits.length >= 3) {
        findings.push({
          id: `build-${findings.length}`,
          perspective: 'development-coding',
          title: `Build failure cluster around ${cluster.dominantTopic}`,
          description: `${fixCommits.length} fix-related commits in a cluster of ${cluster.commits.length} commits.`,
          evidence: fixCommits.slice(0, 5).map(c => `"${c.message}" (${c.date})`),
          severity: fixCommits.length > 5 ? 'critical' : 'high',
          category: 'antipattern',
        });
      }
    }

    return findings;
  }

  private investigateHotspots(analysis: RepositoryAnalysis): Finding[] {
    return analysis.hotspots.slice(0, 10).map((h, i) => ({
      id: `hotspot-${i}`,
      perspective: 'architecture-design',
      title: `File hotspot: ${h.path}`,
      description: `${h.path} was changed ${h.changeCount} times by ${h.uniqueAuthors} author(s).`,
      evidence: [
        `${h.changeCount} changes`,
        `${h.uniqueAuthors} unique author(s)`,
        `Last changed: ${h.lastChanged}`,
      ],
      severity: (h.changeCount > 20 ? 'high' : 'medium') as Finding['severity'],
      category: 'insight' as const,
    }));
  }

  private investigateCustom(pattern: string, analysis: RepositoryAnalysis): Finding[] {
    return [{
      id: `custom-0`,
      perspective: 'learning-growth',
      title: `Custom investigation: ${pattern}`,
      description: `Investigating custom pattern "${pattern}" across ${analysis.totalCommits} commits.`,
      evidence: [`Repository: ${analysis.path}`, `Branches: ${analysis.activeBranches.length}`],
      severity: 'medium',
      category: 'question',
    }];
  }
}
