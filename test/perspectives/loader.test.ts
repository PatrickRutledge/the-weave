import { describe, it, expect } from 'vitest';
import { PerspectiveLoader } from '../../src/perspectives/loader.js';
import * as path from 'path';

// Point to the actual perspectives directory in the project
const perspectivesDir = path.resolve(process.cwd(), 'perspectives');

describe('PerspectiveLoader', () => {
  it('loads all 11 perspectives', async () => {
    const loader = new PerspectiveLoader(perspectivesDir);
    const perspectives = await loader.loadAll();
    expect(perspectives.length).toBe(11);
  });

  it('each perspective has required fields', async () => {
    const loader = new PerspectiveLoader(perspectivesDir);
    const perspectives = await loader.loadAll();

    for (const p of perspectives) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(Array.isArray(p.triggers)).toBe(true);
      expect(p.triggers.length).toBeGreaterThan(0);
      expect(Array.isArray(p.questionFocus)).toBe(true);
      expect(p.questionFocus.length).toBeGreaterThan(0);
      expect(Array.isArray(p.antiPatterns)).toBe(true);
      expect(Array.isArray(p.successPatterns)).toBe(true);
      expect(p.body.length).toBeGreaterThan(0);
    }
  });

  it('gets a specific perspective by id', async () => {
    const loader = new PerspectiveLoader(perspectivesDir);
    const security = await loader.get('security');
    expect(security).toBeDefined();
    expect(security!.name.toLowerCase()).toContain('security');
  });

  it('returns undefined for unknown perspective', async () => {
    const loader = new PerspectiveLoader(perspectivesDir);
    const result = await loader.get('nonexistent-perspective');
    expect(result).toBeUndefined();
  });

  it('lists all perspective IDs', async () => {
    const loader = new PerspectiveLoader(perspectivesDir);
    const ids = await loader.listIds();
    expect(ids).toContain('security');
    expect(ids).toContain('architecture-design');
    expect(ids).toContain('development-coding');
    expect(ids).toContain('learning-growth');
  });

  it('caches results on second load', async () => {
    const loader = new PerspectiveLoader(perspectivesDir);
    const first = await loader.loadAll();
    const second = await loader.loadAll();
    expect(first.length).toBe(second.length);
    // Same references since cached
    expect(first[0]).toBe(second[0]);
  });
});
