import * as fs from 'fs/promises';
import * as path from 'path';
import type { Lesson } from '../engine/types.js';
import { initWeaveDirectory } from './init.js';

export class WeaveWriter {
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  private get weavePath(): string {
    return path.join(this.repoPath, '.weave');
  }

  async ensureDirectory(): Promise<void> {
    await initWeaveDirectory(this.repoPath);
  }

  async saveLesson(lesson: Lesson): Promise<string> {
    await this.ensureDirectory();
    const lessonsDir = path.join(this.weavePath, 'lessons');
    await fs.mkdir(lessonsDir, { recursive: true });

    const filename = `${lesson.id}.json`;
    const filePath = path.join(lessonsDir, filename);
    await fs.writeFile(filePath, JSON.stringify(lesson, null, 2), 'utf-8');
    return filePath;
  }

  async saveEvolutionLog(content: string, sessionId: string): Promise<string> {
    await this.ensureDirectory();
    const logsDir = path.join(this.weavePath, 'logs');
    await fs.mkdir(logsDir, { recursive: true });

    const date = new Date().toISOString().slice(0, 10);
    const filename = `${date}-${sessionId}.md`;
    const filePath = path.join(logsDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
  }

  async saveLessons(lessons: Lesson[]): Promise<string[]> {
    const paths: string[] = [];
    for (const lesson of lessons) {
      paths.push(await this.saveLesson(lesson));
    }
    return paths;
  }
}
