import * as fs from 'fs/promises';
import * as path from 'path';
import type { DependencyAnalysis, DependencyInfo, FrameworkDetection, ConfigFile } from './types.js';

const FRAMEWORK_SIGNATURES: Record<string, { files: string[]; deps: string[] }> = {
  'React': { files: [], deps: ['react', 'react-dom'] },
  'Next.js': { files: ['next.config.js', 'next.config.mjs', 'next.config.ts'], deps: ['next'] },
  'Vue': { files: [], deps: ['vue'] },
  'Nuxt': { files: ['nuxt.config.ts', 'nuxt.config.js'], deps: ['nuxt'] },
  'Angular': { files: ['angular.json'], deps: ['@angular/core'] },
  'Svelte': { files: ['svelte.config.js'], deps: ['svelte'] },
  'Express': { files: [], deps: ['express'] },
  'Fastify': { files: [], deps: ['fastify'] },
  'Electron': { files: [], deps: ['electron'] },
  'React Native': { files: [], deps: ['react-native'] },
  'Astro': { files: ['astro.config.mjs'], deps: ['astro'] },
  'Remix': { files: [], deps: ['@remix-run/node', '@remix-run/react'] },
  'Gatsby': { files: ['gatsby-config.js', 'gatsby-config.ts'], deps: ['gatsby'] },
  'Nest.js': { files: ['nest-cli.json'], deps: ['@nestjs/core'] },
  'Hono': { files: [], deps: ['hono'] },
};

const CONFIG_FILE_TYPES: Record<string, string> = {
  '.eslintrc': 'ESLint configuration',
  '.eslintrc.js': 'ESLint configuration',
  '.eslintrc.json': 'ESLint configuration',
  'eslint.config.js': 'ESLint flat config',
  'eslint.config.mjs': 'ESLint flat config',
  '.prettierrc': 'Prettier configuration',
  'prettier.config.js': 'Prettier configuration',
  'tsconfig.json': 'TypeScript configuration',
  'jest.config.js': 'Jest test configuration',
  'jest.config.ts': 'Jest test configuration',
  'vitest.config.ts': 'Vitest test configuration',
  'vitest.config.js': 'Vitest test configuration',
  'webpack.config.js': 'Webpack bundler config',
  'vite.config.ts': 'Vite build config',
  'vite.config.js': 'Vite build config',
  'rollup.config.js': 'Rollup bundler config',
  'tailwind.config.js': 'Tailwind CSS config',
  'tailwind.config.ts': 'Tailwind CSS config',
  'postcss.config.js': 'PostCSS config',
  '.babelrc': 'Babel transpiler config',
  'babel.config.js': 'Babel transpiler config',
  'Dockerfile': 'Docker container definition',
  'docker-compose.yml': 'Docker Compose config',
  'docker-compose.yaml': 'Docker Compose config',
  '.github/workflows': 'GitHub Actions CI/CD',
  '.env': 'Environment variables',
  '.env.example': 'Environment variables template',
};

const BUILD_TOOL_DEPS = ['webpack', 'vite', 'rollup', 'esbuild', 'parcel', 'turbopack', 'tsup', 'tsc', 'swc'];
const TEST_FRAMEWORK_DEPS = ['jest', 'vitest', 'mocha', 'ava', 'tap', '@testing-library/react', 'cypress', 'playwright', '@playwright/test'];
const LINTER_DEPS = ['eslint', 'prettier', 'stylelint', 'biome', '@biomejs/biome', 'oxlint'];

export class DependencyAnalyzer {
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  async analyze(): Promise<DependencyAnalysis> {
    const [deps, configs] = await Promise.all([
      this.parseDependencies(),
      this.scanConfigFiles(),
    ]);

    const allDepNames = deps.map(d => d.name);
    const frameworks = this.detectFrameworks(allDepNames, configs);
    const buildTools = allDepNames.filter(d => BUILD_TOOL_DEPS.some(bt => d.includes(bt)));
    const testFrameworks = allDepNames.filter(d => TEST_FRAMEWORK_DEPS.some(tf => d.includes(tf)));
    const linters = allDepNames.filter(d => LINTER_DEPS.some(l => d.includes(l)));

    return {
      dependencies: deps,
      frameworks,
      configs,
      buildTools,
      testFrameworks,
      linters,
    };
  }

  private async parseDependencies(): Promise<DependencyInfo[]> {
    const pkgPath = path.join(this.repoPath, 'package.json');
    const results: DependencyInfo[] = [];

    try {
      const raw = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(raw);

      if (pkg.dependencies) {
        for (const [name, version] of Object.entries(pkg.dependencies)) {
          results.push({ name, version: String(version), type: 'production' });
        }
      }
      if (pkg.devDependencies) {
        for (const [name, version] of Object.entries(pkg.devDependencies)) {
          results.push({ name, version: String(version), type: 'development' });
        }
      }
    } catch {
      // No package.json or invalid
    }

    return results;
  }

  private async scanConfigFiles(): Promise<ConfigFile[]> {
    const found: ConfigFile[] = [];

    for (const [filename, description] of Object.entries(CONFIG_FILE_TYPES)) {
      const fullPath = path.join(this.repoPath, filename);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isFile() || stat.isDirectory()) {
          found.push({
            path: filename,
            type: filename.split('.').pop() ?? 'unknown',
            description,
          });
        }
      } catch {
        // File doesn't exist
      }
    }

    return found;
  }

  private detectFrameworks(depNames: string[], configs: ConfigFile[]): FrameworkDetection[] {
    const detected: FrameworkDetection[] = [];
    const configPaths = configs.map(c => c.path);

    for (const [framework, sig] of Object.entries(FRAMEWORK_SIGNATURES)) {
      const evidence: string[] = [];
      let confidence = 0;

      // Check dependencies
      for (const dep of sig.deps) {
        if (depNames.includes(dep)) {
          evidence.push(`Found dependency: ${dep}`);
          confidence += 0.5;
        }
      }

      // Check config files
      for (const file of sig.files) {
        if (configPaths.includes(file)) {
          evidence.push(`Found config file: ${file}`);
          confidence += 0.3;
        }
      }

      if (confidence > 0) {
        detected.push({
          name: framework,
          confidence: Math.min(confidence, 1),
          evidence,
        });
      }
    }

    return detected.sort((a, b) => b.confidence - a.confidence);
  }
}
