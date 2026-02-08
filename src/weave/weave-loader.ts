import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import type { Lesson } from '../engine/types.js';

export class WeaveLoader {
  private weavePath: string;

  constructor(repoPath: string) {
    this.weavePath = path.join(repoPath, '.weave');
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.weavePath);
      return true;
    } catch {
      return false;
    }
  }

  async loadConfig(): Promise<Record<string, unknown>> {
    try {
      const raw = await fs.readFile(path.join(this.weavePath, 'config.yaml'), 'utf-8');
      return yaml.parse(raw) ?? {};
    } catch {
      return {};
    }
  }

  async loadLessons(): Promise<Lesson[]> {
    const lessonsDir = path.join(this.weavePath, 'lessons');
    const lessons: Lesson[] = [];

    try {
      const files = await fs.readdir(lessonsDir);
      for (const file of files.filter(f => f.endsWith('.json'))) {
        const raw = await fs.readFile(path.join(lessonsDir, file), 'utf-8');
        lessons.push(JSON.parse(raw));
      }
    } catch {
      // No lessons directory
    }

    return lessons;
  }

  async loadEvolutionLogs(): Promise<string[]> {
    const logsDir = path.join(this.weavePath, 'logs');
    const logs: string[] = [];

    try {
      const files = await fs.readdir(logsDir);
      for (const file of files.filter(f => f.endsWith('.md')).sort().reverse()) {
        const raw = await fs.readFile(path.join(logsDir, file), 'utf-8');
        logs.push(raw);
      }
    } catch {
      // No logs directory
    }

    return logs;
  }
}
