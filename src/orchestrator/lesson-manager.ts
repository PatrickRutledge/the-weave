import { randomBytes } from 'crypto';
import type { Finding, Lesson } from '../engine/types.js';
import { StateManager } from '../state/state-manager.js';

export class LessonManager {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  captureFromDialogue(finding: Finding, userResponse: string): Lesson {
    const lesson: Lesson = {
      id: randomBytes(8).toString('hex'),
      findingId: finding.id,
      title: finding.title,
      insight: this.extractInsight(finding, userResponse),
      actionItems: this.suggestActions(finding, userResponse),
      perspective: finding.perspective,
      capturedAt: new Date().toISOString(),
      userResponse,
    };

    this.stateManager.captureLesson(lesson);
    return lesson;
  }

  skip(): Finding | undefined {
    return this.stateManager.skipCurrentFinding();
  }

  prioritize(findingId: string): void {
    this.stateManager.prioritizeFinding(findingId);
  }

  merge(findingIds: string[]): void {
    this.stateManager.mergeFindings(findingIds);
  }

  jumpTo(findingIndex: number): Finding | undefined {
    return this.stateManager.moveFindingTo(findingIndex);
  }

  getLessons(): Lesson[] {
    return this.stateManager.getState().lessons;
  }

  private extractInsight(finding: Finding, response: string): string {
    // Build insight by combining finding context with user response
    return `From ${finding.perspective} perspective: ${finding.title}. ` +
      `User insight: ${response.slice(0, 500)}`;
  }

  private suggestActions(finding: Finding, response: string): string[] {
    const actions: string[] = [];

    if (finding.category === 'antipattern') {
      actions.push(`Add check for "${finding.title}" pattern in code review process`);
    }

    if (finding.severity === 'critical' || finding.severity === 'high') {
      actions.push(`Create tracking issue for: ${finding.title}`);
    }

    if (response.toLowerCase().includes('documentation') || response.toLowerCase().includes('document')) {
      actions.push('Update documentation to capture this knowledge');
    }

    if (response.toLowerCase().includes('test') || response.toLowerCase().includes('testing')) {
      actions.push('Add test coverage for this scenario');
    }

    if (response.toLowerCase().includes('process') || response.toLowerCase().includes('workflow')) {
      actions.push('Update development workflow to address this pattern');
    }

    if (actions.length === 0) {
      actions.push(`Review and address: ${finding.title}`);
    }

    return actions;
  }
}
