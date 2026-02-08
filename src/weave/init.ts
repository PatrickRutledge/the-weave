import * as fs from 'fs/promises';
import * as path from 'path';

const WEAVE_DIR = '.weave';

const DEFAULT_CONFIG = `# The Weaver configuration
# See: https://github.com/PatrickRutledge/the-weave

project:
  name: ""
  description: ""

settings:
  # How many commits to analyze (max)
  maxCommits: 500
  # Which perspectives to include (or "all")
  perspectives: all
  # Auto-save lessons to .weave/lessons/
  autoSave: false
`;

export async function initWeaveDirectory(repoPath: string): Promise<{ created: boolean; path: string }> {
  const weavePath = path.join(repoPath, WEAVE_DIR);

  try {
    await fs.access(weavePath);
    return { created: false, path: weavePath };
  } catch {
    // Doesn't exist, create it
  }

  await fs.mkdir(weavePath, { recursive: true });
  await fs.mkdir(path.join(weavePath, 'lessons'), { recursive: true });
  await fs.mkdir(path.join(weavePath, 'logs'), { recursive: true });

  await fs.writeFile(
    path.join(weavePath, 'config.yaml'),
    DEFAULT_CONFIG,
    'utf-8',
  );

  // Add .weave to .gitignore if it exists and doesn't already include it
  const gitignorePath = path.join(repoPath, '.gitignore');
  try {
    const existing = await fs.readFile(gitignorePath, 'utf-8');
    if (!existing.includes('.weave')) {
      await fs.appendFile(gitignorePath, '\n# The Weaver retrospective data\n.weave/\n');
    }
  } catch {
    // No .gitignore, that's fine
  }

  return { created: true, path: weavePath };
}

export function getWeavePath(repoPath: string): string {
  return path.join(repoPath, WEAVE_DIR);
}
