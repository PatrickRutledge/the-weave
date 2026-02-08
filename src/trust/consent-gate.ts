import { EventEmitter } from 'events';

export interface ConsentEvent {
  type: 'grant' | 'revoke';
  by: string;
  at: number;
  reason?: string;
}

const SAFE_WORDS = ['STOP', 'PAUSE', 'BREAK', 'EXIT'] as const;

export class ConsentGate extends EventEmitter {
  private state: 'granted' | 'revoked' | 'pending' = 'pending';

  grant(by: string): void {
    this.state = 'granted';
    this.emit('consent', { type: 'grant', by, at: Date.now() } satisfies ConsentEvent);
  }

  revoke(by: string, reason?: string): void {
    this.state = 'revoked';
    this.emit('consent', { type: 'revoke', by, at: Date.now(), reason } satisfies ConsentEvent);
  }

  interceptInput(input: string, by: string): { proceed: boolean; reason?: string } {
    if (this.state !== 'granted') {
      return { proceed: false, reason: 'No active consent' };
    }

    const upperInput = input.toUpperCase().trim();
    for (const word of SAFE_WORDS) {
      if (upperInput === word || upperInput.startsWith(word + ' ') || upperInput.startsWith(word + '.') || upperInput.startsWith(word + '!')) {
        this.revoke(by, `safe-word: ${word}`);
        return { proceed: false, reason: `Safe word "${word}" detected — session stopped` };
      }
    }

    return { proceed: true };
  }

  isActive(): boolean {
    return this.state === 'granted';
  }

  getState(): 'granted' | 'revoked' | 'pending' {
    return this.state;
  }

  reset(): void {
    this.state = 'pending';
  }
}
