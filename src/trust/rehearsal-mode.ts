import { EphemeralStore } from './ephemeral-store.js';

export class RehearsalMode extends EphemeralStore<unknown> {
  private active = false;

  constructor() {
    super(5 * 60 * 1000); // 5-minute TTL
  }

  start(): void {
    this.active = true;
  }

  isActive(): boolean {
    return this.active;
  }

  assertNotRehearsal(operation: string): void {
    if (this.active) {
      throw new Error(`Cannot ${operation} in rehearsal mode — this is practice only`);
    }
  }

  end(): string {
    this.purgeAll();
    this.active = false;
    return 'Rehearsal complete. Everything has been forgotten.';
  }
}
