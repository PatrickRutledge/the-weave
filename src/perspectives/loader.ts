import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import type { PerspectiveDefinition } from './types.js';

export class PerspectiveLoader {
  private perspectivesDir: string;
  private cache: Map<string, PerspectiveDefinition> = new Map();

  constructor(perspectivesDir?: string) {
    // Default to perspectives/ relative to package root
    this.perspectivesDir = perspectivesDir ?? path.resolve(
      path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1'),
      '..', '..', 'perspectives'
    );
  }

  async loadAll(): Promise<PerspectiveDefinition[]> {
    if (this.cache.size > 0) return [...this.cache.values()];

    const files = await this.listPerspectiveFiles();
    const perspectives: PerspectiveDefinition[] = [];

    for (const file of files) {
      try {
        const perspective = await this.parsePerspectiveFile(file);
        this.cache.set(perspective.id, perspective);
        perspectives.push(perspective);
      } catch (err) {
        console.error(`Failed to load perspective from ${file}: ${err}`);
      }
    }

    return perspectives;
  }

  async get(id: string): Promise<PerspectiveDefinition | undefined> {
    if (this.cache.has(id)) return this.cache.get(id);
    await this.loadAll();
    return this.cache.get(id);
  }

  async listIds(): Promise<string[]> {
    const perspectives = await this.loadAll();
    return perspectives.map(p => p.id);
  }

  private async listPerspectiveFiles(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.perspectivesDir);
      return entries
        .filter(e => e.endsWith('.md') && e !== 'README.md')
        .map(e => path.join(this.perspectivesDir, e));
    } catch {
      return [];
    }
  }

  private async parsePerspectiveFile(filePath: string): Promise<PerspectiveDefinition> {
    const content = await fs.readFile(filePath, 'utf-8');
    const id = path.basename(filePath, '.md');

    // Parse YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      throw new Error(`No YAML frontmatter found in ${filePath}`);
    }

    const frontmatter = yaml.parse(frontmatterMatch[1]);
    const body = frontmatterMatch[2].trim();

    return {
      id,
      name: frontmatter.name ?? id,
      description: frontmatter.description ?? '',
      triggers: frontmatter.triggers ?? [],
      questionFocus: frontmatter.questionFocus ?? frontmatter.question_focus ?? [],
      antiPatterns: frontmatter.antiPatterns ?? frontmatter.anti_patterns ?? [],
      successPatterns: frontmatter.successPatterns ?? frontmatter.success_patterns ?? [],
      body,
    };
  }
}
