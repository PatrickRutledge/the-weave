import { describe, it, expect } from 'vitest';
import { ComfortMeter } from '../../src/trust/comfort-meter.js';

describe('ComfortMeter', () => {
  it('starts at surface depth', () => {
    const meter = new ComfortMeter();
    expect(meter.getDepth()).toBe('surface');
  });

  it('returns surface for fast responses', () => {
    const meter = new ComfortMeter();
    meter.recordResponse(2000);
    meter.recordResponse(3000);
    expect(meter.getDepth()).toBe('surface');
  });

  it('returns exploring for medium responses', () => {
    const meter = new ComfortMeter();
    meter.recordResponse(8000);
    meter.recordResponse(10000);
    expect(meter.getDepth()).toBe('exploring');
  });

  it('returns deep for slow responses', () => {
    const meter = new ComfortMeter();
    meter.recordResponse(20000);
    meter.recordResponse(25000);
    expect(meter.getDepth()).toBe('deep');
  });

  it('reports comfortable by default', () => {
    const meter = new ComfortMeter();
    expect(meter.isComfortable()).toBe(true);
  });

  it('detects discomfort from many pauses', () => {
    const meter = new ComfortMeter();
    meter.recordPause();
    meter.recordPause();
    meter.recordPause();
    expect(meter.isComfortable()).toBe(false);
  });

  it('detects discomfort from high skip rate', () => {
    const meter = new ComfortMeter();
    meter.recordSkip();
    meter.recordSkip();
    meter.recordSkip();
    meter.recordResponse(5000);
    // 3 skips out of 4 total = 75% skip rate
    expect(meter.isComfortable()).toBe(false);
  });

  it('calculates skip rate correctly', () => {
    const meter = new ComfortMeter();
    meter.recordSkip();
    meter.recordResponse(5000);
    meter.recordResponse(5000);
    meter.recordResponse(5000);
    // 1 skip out of 4 total = 25%
    expect(meter.getSkipRate()).toBeCloseTo(0.25);
  });

  it('resets all signals', () => {
    const meter = new ComfortMeter();
    meter.recordResponse(20000);
    meter.recordPause();
    meter.recordSkip();
    meter.reset();
    expect(meter.getDepth()).toBe('surface');
    expect(meter.isComfortable()).toBe(true);
    expect(meter.getSkipRate()).toBe(0);
  });

  it('provides local signals snapshot', () => {
    const meter = new ComfortMeter();
    meter.recordResponse(5000);
    const signals = meter.getLocalSignals();
    expect(signals.depth).toBeDefined();
    expect(signals.comfortable).toBeDefined();
    expect(signals.responseTime.length).toBe(1);
  });
});
