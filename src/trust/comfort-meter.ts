export type ComfortDepth = 'surface' | 'exploring' | 'deep';

export class ComfortMeter {
  private signals = {
    responseTime: [] as number[],
    pauseRequests: 0,
    clarifications: 0,
    skippedQuestions: 0,
    totalQuestions: 0,
  };

  recordResponse(timeMs: number): void {
    this.signals.responseTime.push(timeMs);
    this.signals.totalQuestions++;
  }

  recordPause(): void {
    this.signals.pauseRequests++;
  }

  recordClarification(): void {
    this.signals.clarifications++;
  }

  recordSkip(): void {
    this.signals.skippedQuestions++;
    this.signals.totalQuestions++;
  }

  getDepth(): ComfortDepth {
    const times = this.signals.responseTime;
    if (times.length === 0) return 'surface';

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    if (avgTime < 5000) return 'surface';
    if (avgTime < 15000) return 'exploring';
    return 'deep';
  }

  isComfortable(): boolean {
    if (this.signals.pauseRequests >= 3) return false;
    if (this.signals.totalQuestions > 3 && this.signals.skippedQuestions / this.signals.totalQuestions > 0.5) return false;
    return true;
  }

  getSkipRate(): number {
    if (this.signals.totalQuestions === 0) return 0;
    return this.signals.skippedQuestions / this.signals.totalQuestions;
  }

  getLocalSignals() {
    return { ...this.signals, depth: this.getDepth(), comfortable: this.isComfortable() };
  }

  reset(): void {
    this.signals = {
      responseTime: [],
      pauseRequests: 0,
      clarifications: 0,
      skippedQuestions: 0,
      totalQuestions: 0,
    };
  }
}
