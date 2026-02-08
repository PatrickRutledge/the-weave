import { describe, it, expect } from 'vitest';
import { detectSafeWord } from '../../src/trust/safe-words.js';

describe('detectSafeWord', () => {
  it('detects STOP', () => {
    const result = detectSafeWord('STOP');
    expect(result.detected).toBe(true);
    expect(result.word).toBe('STOP');
    expect(result.action).toBe('stop');
  });

  it('detects EXIT', () => {
    const result = detectSafeWord('EXIT');
    expect(result.detected).toBe(true);
    expect(result.word).toBe('EXIT');
    expect(result.action).toBe('stop');
  });

  it('detects PAUSE as pause action', () => {
    const result = detectSafeWord('PAUSE');
    expect(result.detected).toBe(true);
    expect(result.word).toBe('PAUSE');
    expect(result.action).toBe('pause');
  });

  it('detects BREAK as pause action', () => {
    const result = detectSafeWord('BREAK');
    expect(result.detected).toBe(true);
    expect(result.action).toBe('pause');
  });

  it('is case insensitive', () => {
    expect(detectSafeWord('stop').detected).toBe(true);
    expect(detectSafeWord('Stop').detected).toBe(true);
    expect(detectSafeWord('sToP').detected).toBe(true);
  });

  it('detects safe word with trailing text', () => {
    expect(detectSafeWord('STOP please').detected).toBe(true);
    expect(detectSafeWord('PAUSE.').detected).toBe(true);
    expect(detectSafeWord('EXIT!').detected).toBe(true);
  });

  it('does not trigger on words containing safe words', () => {
    expect(detectSafeWord('nonstop').detected).toBe(false);
    expect(detectSafeWord('I was stopping').detected).toBe(false);
    expect(detectSafeWord('breakfast').detected).toBe(false);
  });

  it('returns none for normal input', () => {
    const result = detectSafeWord('The build failed because of a dependency issue');
    expect(result.detected).toBe(false);
    expect(result.action).toBe('none');
    expect(result.word).toBeUndefined();
  });

  it('handles empty input', () => {
    expect(detectSafeWord('').detected).toBe(false);
  });

  it('handles whitespace', () => {
    expect(detectSafeWord('  STOP  ').detected).toBe(true);
  });
});
