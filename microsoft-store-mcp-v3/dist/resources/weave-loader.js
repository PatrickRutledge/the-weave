"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaveLoader = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
class WeaveLoader {
    weavePath;
    constructor(projectPath) {
        const basePath = projectPath || process.cwd();
        this.weavePath = path.join(basePath, '.weave');
    }
    async loadConfig() {
        try {
            const configPath = path.join(this.weavePath, 'config.yaml');
            const content = await fs.readFile(configPath, 'utf-8');
            return yaml.parse(content);
        }
        catch (error) {
            // No config found - project may not be initialized
            return null;
        }
    }
    async loadConnections() {
        try {
            const connectionsPath = path.join(this.weavePath, 'connections.yaml');
            const content = await fs.readFile(connectionsPath, 'utf-8');
            return yaml.parse(content);
        }
        catch (error) {
            return null;
        }
    }
    async loadEvolutionLog() {
        try {
            const logPath = path.join(this.weavePath, 'evolution-log.md');
            return await fs.readFile(logPath, 'utf-8');
        }
        catch (error) {
            return null;
        }
    }
    async listWeaveFiles() {
        try {
            const files = await fs.readdir(this.weavePath);
            return files.filter(f => f.endsWith('.yaml') ||
                f.endsWith('.yml') ||
                f.endsWith('.md'));
        }
        catch (error) {
            return [];
        }
    }
    async loadFile(fileName) {
        const filePath = path.join(this.weavePath, fileName);
        return await fs.readFile(filePath, 'utf-8');
    }
    async saveConfig(config) {
        await this.ensureWeaveDirectory();
        const configPath = path.join(this.weavePath, 'config.yaml');
        await fs.writeFile(configPath, yaml.stringify(config), 'utf-8');
    }
    async saveConnections(connections) {
        await this.ensureWeaveDirectory();
        const connectionsPath = path.join(this.weavePath, 'connections.yaml');
        await fs.writeFile(connectionsPath, yaml.stringify(connections), 'utf-8');
    }
    async saveEvolutionLog(content) {
        await this.ensureWeaveDirectory();
        const logPath = path.join(this.weavePath, 'evolution-log.md');
        await fs.writeFile(logPath, content, 'utf-8');
    }
    async appendToEvolutionLog(content) {
        await this.ensureWeaveDirectory();
        const logPath = path.join(this.weavePath, 'evolution-log.md');
        try {
            // Try to read existing content
            const existing = await fs.readFile(logPath, 'utf-8');
            await fs.writeFile(logPath, existing + '\n\n' + content, 'utf-8');
        }
        catch (error) {
            // File doesn't exist, create it
            await fs.writeFile(logPath, content, 'utf-8');
        }
    }
    async weaveExists() {
        try {
            await fs.access(this.weavePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async initializeWeave(projectName) {
        await this.ensureWeaveDirectory();
        // Create initial config
        const config = {
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
    async ensureWeaveDirectory() {
        try {
            await fs.mkdir(this.weavePath, { recursive: true });
        }
        catch (error) {
            // Directory already exists or can't be created
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
}
exports.WeaveLoader = WeaveLoader;
//# sourceMappingURL=weave-loader.js.map