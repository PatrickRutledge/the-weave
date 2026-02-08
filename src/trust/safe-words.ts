const SAFE_WORDS = ['STOP', 'PAUSE', 'BREAK', 'EXIT'] as const;
export type SafeWord = typeof SAFE_WORDS[number];

export interface SafeWordDetection {
  detected: boolean;
  word?: SafeWord;
  action: 'stop' | 'pause' | 'none';
}

export function detectSafeWord(input: string): SafeWordDetection {
  const upper = input.toUpperCase().trim();

  for (const word of SAFE_WORDS) {
    if (upper === word || upper.startsWith(word + ' ') || upper.startsWith(word + '.') || upper.startsWith(word + '!')) {
      const action = (word === 'PAUSE' || word === 'BREAK') ? 'pause' : 'stop';
      return { detected: true, word, action };
    }
  }

  return { detected: false, action: 'none' };
}
