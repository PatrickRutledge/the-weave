import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

interface WeaveConfig {
  projectName?: string;
  initialized?: Date;
  version?: string;
  [key: string]: any;
}

export class WeaveLoader {
  private weavePath: string;

  constructor(projectPath?: string) {
    const basePath = projectPath || process.cwd();
    this.weavePath = path.join(basePath, '.weave');
  }

  async loadConfig(): Promise<WeaveConfig | null> {
    try {
      const configPath = path.join(this.weavePath, 'config.yaml');
      const content = await fs.readFile(configPath, 'utf-8');
      return yaml.parse(content);
    } catch (error) {
      // No config found - project may not be initialized
      return null;
    }
  }

  async loadConnections(): Promise<any> {
    try {
      const connectionsPath = path.join(this.weavePath, 'connections.yaml');
      const content = await fs.readFile(connectionsPath, 'utf-8');
      return yaml.parse(content);
    } catch (error) {
      return null;
    }
  }

  async loadEvolutionLog(): Promise<string | null> {
    try {
      const logPath = path.join(this.weavePath, 'evolution-log.md');
      return await fs.readFile(logPath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  async listWeaveFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.weavePath);
      return files.filter(f => 
        f.endsWith('.yaml') || 
        f.endsWith('.yml') || 
        f.endsWith('.md')
      );
    } catch (error) {
      return [];
    }
  }

  async loadFile(fileName: string): Promise<string> {
    const filePath = path.join(this.weavePath, fileName);
    return await fs.readFile(filePath, 'utf-8');
  }

  async saveConfig(config: WeaveConfig): Promise<void> {
    await this.ensureWeaveDirectory();
    const configPath = path.join(this.weavePath, 'config.yaml');
    await fs.writeFile(configPath, yaml.stringify(config), 'utf-8');
  }

  async saveConnections(connections: any): Promise<void> {
    await this.ensureWeaveDirectory();
    const connectionsPath = path.join(this.weavePath, 'connections.yaml');
    await fs.writeFile(connectionsPath, yaml.stringify(connections), 'utf-8');
  }

  async saveEvolutionLog(content: string): Promise<void> {
    await this.ensureWeaveDirectory();
    const logPath = path.join(this.weavePath, 'evolution-log.md');
    await fs.writeFile(logPath, content, 'utf-8');
  }

  async appendToEvolutionLog(content: string): Promise<void> {
    await this.ensureWeaveDirectory();
    const logPath = path.join(this.weavePath, 'evolution-log.md');
    
    try {
      // Try to read existing content
      const existing = await fs.readFile(logPath, 'utf-8');
      await fs.writeFile(logPath, existing + '\n\n' + content, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      await fs.writeFile(logPath, content, 'utf-8');
    }
  }

  async weaveExists(): Promise<boolean> {
    try {
      await fs.access(this.weavePath);
      return true;
    } catch {
      return false;
    }
  }

  async initializeWeave(projectName: string): Promise<void> {
    await this.ensureWeaveDirectory();

    // Create initial config
    const config: WeaveConfig = {
      projectName,
      initialized: new Date(),
      version: '1.0.0',
    };
    await this.saveConfig(config);

    // Create initial connections file
    const connections = {
      sessions: [],
      notes: 'Track human-AI collaboration moments here',
    };
    await this.saveConnections(connections);

    // Create initial evolution log
    const log = `# Evolution Log - ${projectName}\n\nInitialized: ${new Date().toISOString()}\n\n## Purpose\n\nThis log captures lessons learned and patterns discovered during development.\n`;
    await this.saveEvolutionLog(log);
  }

  private async ensureWeaveDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.weavePath, { recursive: true });
    } catch (error) {
      // Directory already exists or can't be created
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }
  }
}
