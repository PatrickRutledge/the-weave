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
exports.AgentInstructions = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class AgentInstructions {
    agentsPath;
    constructor(projectPath) {
        const basePath = projectPath || process.cwd();
        this.agentsPath = path.join(basePath, 'agents');
    }
    async load(agentType) {
        const fileName = agentType === 'review'
            ? 'weaver-review.md'
            : 'weaver-investigate.md';
        const filePath = path.join(this.agentsPath, fileName);
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return this.parseInstructions(content);
        }
        catch (error) {
            // Return default instructions if file not found
            return this.getDefaultInstructions(agentType);
        }
    }
    async loadRaw(fileName) {
        const filePath = path.join(this.agentsPath, fileName);
        return await fs.readFile(filePath, 'utf-8');
    }
    async listAgents() {
        try {
            const files = await fs.readdir(this.agentsPath);
            return files.filter(f => f.endsWith('.md'));
        }
        catch (error) {
            return [];
        }
    }
    parseInstructions(content) {
        // Parse markdown content into structured instructions
        const instructions = {
            raw: content,
            sections: {},
        };
        // Simple parser - split by headers
        const lines = content.split('\n');
        let currentSection = 'preamble';
        let currentContent = [];
        for (const line of lines) {
            if (line.startsWith('# ') || line.startsWith('## ')) {
                // Save previous section
                if (currentContent.length > 0) {
                    instructions.sections[currentSection] = currentContent.join('\n');
                }
                // Start new section
                currentSection = line.replace(/^#+\s+/, '').toLowerCase().replace(/\s+/g, '_');
                currentContent = [];
            }
            else {
                currentContent.push(line);
            }
        }
        // Save last section
        if (currentContent.length > 0) {
            instructions.sections[currentSection] = currentContent.join('\n');
        }
        return instructions;
    }
    getDefaultInstructions(agentType) {
        if (agentType === 'review') {
            return {
                raw: this.getDefaultReviewInstructions(),
                sections: {
                    purpose: 'Conduct retrospective analysis of project',
                    approach: 'Ask thoughtful questions one at a time',
                    safety: 'Maintain non-judgmental stance',
                },
            };
        }
        else {
            return {
                raw: this.getDefaultInvestigateInstructions(),
                sections: {
                    purpose: 'Investigate failure patterns',
                    approach: 'Deep dive into specific issues',
                    safety: 'Focus on learning, not blame',
                },
            };
        }
    }
    getDefaultReviewInstructions() {
        return `# Weaver Review Agent

## Purpose
Conduct thoughtful retrospective analysis of a project to capture lessons learned.

## Approach
1. Analyze project thoroughly before asking questions
2. Ask ONE question at a time
3. Wait for answers
4. Build on previous answers
5. Generate actionable insights

## Safety Protocols
- No judgmental language
- Focus on situations, not people
- Always allow skipping questions
- Maintain psychological safety

## Question Guidelines
- Questions emerge from actual analysis
- Prioritize by impact
- Limit to 10-15 questions total
- Each question should uncover root causes

## Output
Generate evolution-log.md with:
- Patterns discovered
- Lessons learned
- Actionable improvements
- Framework enhancements
`;
    }
    getDefaultInvestigateInstructions() {
        return `# Weaver Investigation Agent

## Purpose
Deep dive into specific failure patterns to uncover undocumented problems.

## Investigation Types
1. Build failures - recurring build issues
2. Circular commits - code added/removed/re-added
3. Time sinks - features taking much longer than expected
4. Abandoned work - started but never completed

## Approach
1. Detect pattern automatically
2. Provide specific evidence
3. Ask targeted question about root cause
4. Capture lesson learned
5. Move to next pattern or generate report

## Safety Protocols
- No blame for abandoned work
- Focus on systemic issues
- Treat failures as learning opportunities

## Output
Investigation report with:
- Patterns investigated
- Root causes identified
- Lessons captured
- Preventive measures
`;
    }
}
exports.AgentInstructions = AgentInstructions;
//# sourceMappingURL=agent-instructions.js.map