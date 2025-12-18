import * as fs from 'fs/promises';
import * as path from 'path';

export class AgentInstructions {
  private agentsPath: string;

  constructor(projectPath?: string) {
    const basePath = projectPath || process.cwd();
    this.agentsPath = path.join(basePath, 'agents');
  }

  async load(agentType: 'review' | 'investigate'): Promise<any> {
    const fileName = agentType === 'review' 
      ? 'weaver-review.md' 
      : 'weaver-investigate.md';
    
    const filePath = path.join(this.agentsPath, fileName);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseInstructions(content);
    } catch (error) {
      // Return default instructions if file not found
      return this.getDefaultInstructions(agentType);
    }
  }

  async loadRaw(fileName: string): Promise<string> {
    const filePath = path.join(this.agentsPath, fileName);
    return await fs.readFile(filePath, 'utf-8');
  }

  async listAgents(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.agentsPath);
      return files.filter(f => f.endsWith('.md'));
    } catch (error) {
      return [];
    }
  }

  private parseInstructions(content: string): any {
    // Parse markdown content into structured instructions
    const instructions: any = {
      raw: content,
      sections: {},
    };

    // Simple parser - split by headers
    const lines = content.split('\n');
    let currentSection = 'preamble';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ')) {
        // Save previous section
        if (currentContent.length > 0) {
          instructions.sections[currentSection] = currentContent.join('\n');
        }
        
        // Start new section
        currentSection = line.replace(/^#+\s+/, '').toLowerCase().replace(/\s+/g, '_');
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      instructions.sections[currentSection] = currentContent.join('\n');
    }

    return instructions;
  }

  private getDefaultInstructions(agentType: 'review' | 'investigate'): any {
    if (agentType === 'review') {
      return {
        raw: this.getDefaultReviewInstructions(),
        sections: {
          purpose: 'Conduct retrospective analysis of project',
          approach: 'Ask thoughtful questions one at a time',
          safety: 'Maintain non-judgmental stance',
        },
      };
    } else {
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

  private getDefaultReviewInstructions(): string {
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

  private getDefaultInvestigateInstructions(): string {
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
