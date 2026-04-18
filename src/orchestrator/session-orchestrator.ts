import { randomBytes } from 'crypto';
import type { Finding, RepositoryAnalysis, SessionState } from '../engine/types.js';
import { GitAnalyzer } from '../engine/git-analyzer.js';
import { DependencyAnalyzer } from '../engine/dependency-analyzer.js';
import { PatternDetector } from '../engine/pattern-detector.js';
import { FileAnalyzer } from '../engine/file-analyzer.js';
import { PerspectiveLoader } from '../perspectives/loader.js';
import type { PerspectiveDefinition } from '../perspectives/types.js';
import { StateManager } from '../state/state-manager.js';
import { LessonManager } from './lesson-manager.js';
import { ConsentGate } from '../trust/consent-gate.js';
import { ComfortMeter } from '../trust/comfort-meter.js';
import { RehearsalMode } from '../trust/rehearsal-mode.js';

export class SessionOrchestrator {
  private stateManager: StateManager;
  private lessonManager: LessonManager;
  private perspectiveLoader: PerspectiveLoader;
  private consentGate: ConsentGate;
  private comfortMeter: ComfortMeter;
  private rehearsalMode: RehearsalMode;
  private lastAnalysis?: RepositoryAnalysis;

  constructor() {
    this.stateManager = new StateManager();
    this.lessonManager = new LessonManager(this.stateManager);
    this.perspectiveLoader = new PerspectiveLoader();
    this.consentGate = new ConsentGate();
    this.comfortMeter = new ComfortMeter();
    this.rehearsalMode = new RehearsalMode();
  }

  async analyzeRepository(repoPath: string): Promise<RepositoryAnalysis> {
    const gitAnalyzer = new GitAnalyzer(repoPath);
    const depAnalyzer = new DependencyAnalyzer(repoPath);

    const [analysis, deps] = await Promise.all([
      gitAnalyzer.analyze(),
      depAnalyzer.analyze(),
    ]);

    analysis.dependencies = deps;

    // Run pattern detection
    const patternDetector = new PatternDetector();
    const fileAnalyzer = new FileAnalyzer();

    const commits = analysis.clusters.flatMap(c => c.commits);
    if (commits.length > 0) {
      const patterns = patternDetector.detectPatterns(commits);
      analysis.circularPatterns = patterns.circularDevelopment;
      analysis.timeSinks = patterns.timeSinks;

      const coupledFiles = fileAnalyzer.analyzeCoupledFiles(commits);
      analysis.coupledFiles = coupledFiles;
    }

    this.lastAnalysis = analysis;
    return analysis;
  }

  async identifyFindings(analysis: RepositoryAnalysis, perspectiveIds?: string[]): Promise<Finding[]> {
    const perspectives = await this.perspectiveLoader.loadAll();
    const activePerspectives = perspectiveIds
      ? perspectives.filter(p => perspectiveIds.includes(p.id))
      : perspectives;

    const raw: Finding[] = [];

    for (const perspective of activePerspectives) {
      raw.push(...this.applyPerspective(perspective, analysis));
    }

    // Deduplicate: findings with identical (title, category) collapse into one,
    // merging perspective tags. This prevents the same real pattern (e.g. "circular
    // development") from appearing once per perspective whose trigger list matched.
    const findings = this.dedupeFindings(raw);

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    this.stateManager.setFindings(findings);
    return findings;
  }

  private dedupeFindings(findings: Finding[]): Finding[] {
    const byKey = new Map<string, Finding>();
    for (const f of findings) {
      const key = `${f.category}::${f.title}`;
      const existing = byKey.get(key);
      if (existing) {
        for (const p of f.perspectives) {
          if (!existing.perspectives.includes(p)) existing.perspectives.push(p);
        }
      } else {
        byKey.set(key, { ...f, perspectives: [...f.perspectives] });
      }
    }
    return [...byKey.values()];
  }

  startSession(repoPath: string, mode: SessionState['mode']): void {
    this.stateManager.initialize(repoPath, mode);
    this.consentGate.grant('session-start');
    this.comfortMeter.reset();
  }

  grantConsent(): void {
    this.consentGate.grant('user');
    this.stateManager.setConsent(true);
  }

  enableRehearsalMode(): void {
    this.rehearsalMode.start();
    this.stateManager.setRehearsalMode(true);
  }

  getStateManager(): StateManager {
    return this.stateManager;
  }

  getLessonManager(): LessonManager {
    return this.lessonManager;
  }

  getConsentGate(): ConsentGate {
    return this.consentGate;
  }

  getComfortMeter(): ComfortMeter {
    return this.comfortMeter;
  }

  getRehearsalMode(): RehearsalMode {
    return this.rehearsalMode;
  }

  getLastAnalysis(): RepositoryAnalysis | undefined {
    return this.lastAnalysis;
  }

  private applyPerspective(perspective: PerspectiveDefinition, analysis: RepositoryAnalysis): Finding[] {
    const findings: Finding[] = [];
    const makeId = () => randomBytes(6).toString('hex');

    // Check triggers against analysis data. Findings only fire when the analysis
    // contains observable evidence; we no longer emit questionFocus items as findings.
    for (const trigger of perspective.triggers) {
      const triggered = this.checkTrigger(trigger, analysis);
      if (triggered) {
        findings.push({
          id: makeId(),
          perspectives: [perspective.id],
          title: triggered.title,
          description: triggered.description,
          evidence: triggered.evidence,
          severity: triggered.severity,
          category: 'pattern',
        });
      }
    }

    // Check anti-patterns
    for (const antiPattern of perspective.antiPatterns) {
      const found = this.checkAntiPattern(antiPattern, analysis);
      if (found) {
        findings.push({
          id: makeId(),
          perspectives: [perspective.id],
          title: found.title,
          description: found.description,
          evidence: found.evidence,
          severity: found.severity,
          category: 'antipattern',
        });
      }
    }

    return findings;
  }

  private checkTrigger(trigger: string, analysis: RepositoryAnalysis): { title: string; description: string; evidence: string[]; severity: Finding['severity'] } | null {
    const lowerTrigger = trigger.toLowerCase();

    if (lowerTrigger.includes('revert') && analysis.reverts.length > 0) {
      return {
        title: 'Revert patterns detected',
        description: `Found ${analysis.reverts.length} revert(s) in the commit history, suggesting rework or direction changes.`,
        evidence: analysis.reverts.map(r => `"${r.originalCommit.message}" reverted after ${Math.round(r.daysBetween)} days`),
        severity: analysis.reverts.length > 3 ? 'high' : 'medium',
      };
    }

    if (lowerTrigger.includes('hotspot') && analysis.hotspots.length > 0) {
      return {
        title: 'File hotspots identified',
        description: `${analysis.hotspots.length} files have been changed frequently, indicating active areas or instability.`,
        evidence: analysis.hotspots.slice(0, 5).map(h => `${h.path}: ${h.changeCount} changes`),
        severity: analysis.hotspots[0]?.changeCount > 20 ? 'high' : 'medium',
      };
    }

    if (lowerTrigger.includes('burst') && analysis.burstPeriods.length > 0) {
      return {
        title: 'Development burst periods',
        description: `Found ${analysis.burstPeriods.length} periods of unusually high commit activity.`,
        evidence: analysis.burstPeriods.slice(0, 3).map(b => `${b.start}: ${b.commitCount} commits`),
        severity: 'medium',
      };
    }

    if (lowerTrigger.includes('circular') && analysis.circularPatterns.length > 0) {
      return {
        title: 'Circular development detected',
        description: `Found ${analysis.circularPatterns.length} instance(s) of code being added, removed, and re-added.`,
        evidence: analysis.circularPatterns.map(c => c.description),
        severity: 'high',
      };
    }

    if (lowerTrigger.includes('time sink') && analysis.timeSinks.length > 0) {
      return {
        title: 'Time sinks identified',
        description: `${analysis.timeSinks.length} feature(s) consumed disproportionate effort.`,
        evidence: analysis.timeSinks.map(t => `"${t.topic}": ${t.commitCount} commits over ${t.spanDays} days`),
        severity: 'high',
      };
    }

    // Exclude default branches — an idle main is not "dead work."
    const isDefault = (name: string) => /^(main|master|develop|dev|trunk)$/.test(name);

    if (lowerTrigger.includes('abandoned')) {
      const abandoned = analysis.activeBranches.filter(
        b => b.daysSinceLastCommit > 180 && !isDefault(b.name)
      );
      if (abandoned.length > 0) {
        return {
          title: 'Abandoned branches',
          description: `${abandoned.length} branch(es) have had no activity for over 180 days — likely dead work.`,
          evidence: abandoned.map(b => `${b.name}: ${b.daysSinceLastCommit} days since last commit`),
          severity: abandoned.length > 3 ? 'medium' : 'low',
        };
      }
    }

    if (lowerTrigger.includes('stale branch')) {
      const stale = analysis.activeBranches.filter(
        b => b.daysSinceLastCommit > 30 && b.daysSinceLastCommit <= 180 && !isDefault(b.name)
      );
      if (stale.length > 0) {
        return {
          title: 'Stale branches',
          description: `${stale.length} branch(es) have had no activity for 30-180 days.`,
          evidence: stale.map(b => `${b.name}: ${b.daysSinceLastCommit} days since last commit`),
          severity: 'low',
        };
      }
    }

    if (lowerTrigger.includes('dependency') && analysis.dependencies) {
      const prodDeps = analysis.dependencies.dependencies.filter(d => d.type === 'production');
      if (prodDeps.length > 15) {
        return {
          title: 'Heavy dependency footprint',
          description: `Project has ${prodDeps.length} production dependencies.`,
          evidence: prodDeps.slice(0, 5).map(d => `${d.name}@${d.version}`),
          severity: prodDeps.length > 30 ? 'medium' : 'low',
        };
      }
    }

    return null;
  }

  private checkAntiPattern(antiPattern: string, analysis: RepositoryAnalysis): { title: string; description: string; evidence: string[]; severity: Finding['severity'] } | null {
    const lower = antiPattern.toLowerCase();

    if (lower.includes('circular development') && analysis.circularPatterns.length > 0) {
      return {
        title: 'Circular development',
        description: `Code was added, removed, and re-added ${analysis.circularPatterns.length} time(s).`,
        evidence: analysis.circularPatterns.map(c => c.description),
        severity: 'high',
      };
    }

    if (lower.includes('scope creep') && analysis.timeSinks.length > 0) {
      const longSinks = analysis.timeSinks.filter(t => t.spanDays > 14);
      if (longSinks.length > 0) {
        return {
          title: 'Possible scope creep',
          description: `${longSinks.length} feature area(s) expanded well beyond expected effort.`,
          evidence: longSinks.map(t => `"${t.topic}": ${t.commitCount} commits over ${t.spanDays} days`),
          severity: 'medium',
        };
      }
    }

    return null;
  }

}
