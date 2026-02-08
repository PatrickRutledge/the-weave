import { randomBytes } from 'crypto';
import type { SessionState, Finding, Lesson } from '../engine/types.js';

export class StateManager {
  private state: SessionState;

  constructor() {
    this.state = this.createFreshState();
  }

  private createFreshState(): SessionState {
    return {
      id: randomBytes(8).toString('hex'),
      mode: 'retrospective',
      status: 'initializing',
      repositoryPath: '',
      startedAt: new Date().toISOString(),
      findings: [],
      currentFindingIndex: 0,
      lessons: [],
      consentGranted: false,
      comfortLevel: 'surface',
      rehearsalMode: false,
    };
  }

  initialize(repoPath: string, mode: SessionState['mode']): void {
    this.state = this.createFreshState();
    this.state.repositoryPath = repoPath;
    this.state.mode = mode;
    this.state.status = 'analyzing';
  }

  setStatus(status: SessionState['status']): void {
    this.state.status = status;
  }

  setConsent(granted: boolean): void {
    this.state.consentGranted = granted;
  }

  setComfortLevel(level: SessionState['comfortLevel']): void {
    this.state.comfortLevel = level;
  }

  setRehearsalMode(active: boolean): void {
    this.state.rehearsalMode = active;
  }

  setFindings(findings: Finding[]): void {
    this.state.findings = findings;
    this.state.currentFindingIndex = 0;
    this.state.status = 'dialogue';
  }

  getCurrentFinding(): Finding | undefined {
    return this.state.findings[this.state.currentFindingIndex];
  }

  advanceFinding(): Finding | undefined {
    this.state.currentFindingIndex++;
    return this.getCurrentFinding();
  }

  moveFindingTo(index: number): Finding | undefined {
    if (index >= 0 && index < this.state.findings.length) {
      this.state.currentFindingIndex = index;
    }
    return this.getCurrentFinding();
  }

  skipCurrentFinding(): Finding | undefined {
    return this.advanceFinding();
  }

  prioritizeFinding(findingId: string): void {
    const idx = this.state.findings.findIndex(f => f.id === findingId);
    if (idx > this.state.currentFindingIndex) {
      const [finding] = this.state.findings.splice(idx, 1);
      this.state.findings.splice(this.state.currentFindingIndex + 1, 0, finding);
    }
  }

  mergeFindings(findingIds: string[]): void {
    if (findingIds.length < 2) return;
    const findings = findingIds.map(id => this.state.findings.find(f => f.id === id)).filter(Boolean) as Finding[];
    if (findings.length < 2) return;

    const merged: Finding = {
      id: findings[0].id,
      perspective: findings.map(f => f.perspective).join(', '),
      title: findings[0].title,
      description: findings.map(f => f.description).join('\n\n'),
      evidence: findings.flatMap(f => f.evidence),
      severity: findings.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
      })[0].severity,
      category: findings[0].category,
      relatedFindings: findingIds,
    };

    // Replace first, remove rest
    const firstIdx = this.state.findings.findIndex(f => f.id === merged.id);
    this.state.findings[firstIdx] = merged;
    this.state.findings = this.state.findings.filter(
      f => f.id === merged.id || !findingIds.includes(f.id)
    );
  }

  captureLesson(lesson: Lesson): void {
    this.state.lessons.push(lesson);
  }

  getState(): SessionState {
    return { ...this.state };
  }

  getProgress(): { current: number; total: number; percent: number } {
    const total = this.state.findings.length;
    const current = this.state.currentFindingIndex;
    return {
      current: current + 1,
      total,
      percent: total > 0 ? Math.round((current / total) * 100) : 0,
    };
  }

  isComplete(): boolean {
    return this.state.currentFindingIndex >= this.state.findings.length;
  }

  reset(): void {
    this.state = this.createFreshState();
  }
}
