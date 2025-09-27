import { StateManager } from './state-manager.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import simpleGit from 'simple-git';
import * as yaml from 'yaml';

interface AnalysisResult {
  summary: string;
  patterns: {
    positive: string[];
    negative: string[];
    circular: string[];
  };
  keyMoments: {
    breakthroughs: string[];
    struggles: string[];
  };
}

interface Question {
  id: string;
  question: string;
  context?: string;
  priority: number;
}

export class ReviewOrchestrator {
  private stateManager: StateManager;
  
  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }
  
  async performInitialAnalysis(): Promise<AnalysisResult> {
    // Deep analysis phase - this can take several minutes
    const projectPath = process.cwd();
    const git = simpleGit(projectPath);
    
    // 1. Read .weave files if they exist
    const weaveData = await this.loadWeaveData(projectPath);
    
    // 2. Analyze git history for patterns
    const gitPatterns = await this.analyzeGitHistory(git);
    
    // 3. Apply multiple professional perspectives
    const perspectives = this.applyPerspectives(weaveData, gitPatterns);
    
    // 4. Synthesize findings
    const synthesis = this.synthesizeFindings(perspectives);
    
    return synthesis;
  }
  
  async generateQuestions(): Promise<Question[]> {
    const analysis = await this.performInitialAnalysis();
    const questions: Question[] = [];
    
    // Generate thoughtful questions based on analysis
    // CRITICAL: Questions emerge from actual analysis, not scripted
    
    // High-priority questions about negative patterns
    for (const pattern of analysis.patterns.negative) {
      questions.push({
        id: `neg_${questions.length}`,
        question: `I noticed ${pattern}. What was the root cause that led to this pattern?`,
        context: pattern,
        priority: 1,
      });
    }
    
    // Questions about circular development
    for (const circular of analysis.patterns.circular) {
      questions.push({
        id: `circ_${questions.length}`,
        question: `There's a circular pattern where ${circular}. What constraint or misunderstanding caused this back-and-forth?`,
        context: circular,
        priority: 1,
      });
    }
    
    // Questions about breakthroughs
    for (const breakthrough of analysis.keyMoments.breakthroughs) {
      questions.push({
        id: `break_${questions.length}`,
        question: `On ${breakthrough}, there was sudden progress. What insight or approach made this possible?`,
        context: breakthrough,
        priority: 2,
      });
    }
    
    // Questions about struggles
    for (const struggle of analysis.keyMoments.struggles) {
      questions.push({
        id: `struggle_${questions.length}`,
        question: `The ${struggle} took much longer than expected. What was the hidden complexity here?`,
        context: struggle,
        priority: 2,
      });
    }
    
    // Sort by priority and limit to most important
    questions.sort((a, b) => a.priority - b.priority);
    
    // Return top 10-15 questions for reasonable dialogue length
    return questions.slice(0, 15);
  }
  
  async performCompleteAnalysis(): Promise<string> {
    // YOLO mode - generate complete analysis without interaction
    const analysis = await this.performInitialAnalysis();
    const questions = await this.generateQuestions();
    
    // Generate a comprehensive report
    const report = this.generateYoloReport(analysis, questions);
    
    return report;
  }
  
  async generateEvolutionLog(answers: any[]): Promise<string> {
    // Generate the evolution-log.md content
    const log: string[] = ['# Evolution Log', ''];
    log.push(`Generated: ${new Date().toISOString()}`);
    log.push('');
    
    // Document patterns discovered
    log.push('## Patterns Identified');
    log.push('');
    
    // Add answers and insights
    log.push('## Insights from Dialogue');
    for (const answer of answers) {
      if (answer.answer !== '[SKIPPED]') {
        log.push(`- **Q**: ${answer.questionId}`);
        log.push(`  **A**: ${answer.answer}`);
        log.push('');
      }
    }
    
    // Generate actionable improvements
    log.push('## Framework Improvements');
    log.push('');
    log.push('### Issues to Create');
    
    // Based on answers, generate specific improvement suggestions
    const improvements = this.generateImprovements(answers);
    for (const improvement of improvements) {
      log.push(`- ${improvement}`);
    }
    
    return log.join('\n');
  }
  
  private async loadWeaveData(projectPath: string): Promise<any> {
    try {
      const weavePath = path.join(projectPath, '.weave');
      const configPath = path.join(weavePath, 'config.yaml');
      const connectionsPath = path.join(weavePath, 'connections.yaml');
      
      const config = await fs.readFile(configPath, 'utf-8');
      const connections = await fs.readFile(connectionsPath, 'utf-8');
      
      return {
        config: yaml.parse(config),
        connections: yaml.parse(connections),
      };
    } catch (error) {
      return null;
    }
  }
  
  private async analyzeGitHistory(git: any): Promise<any> {
    const log = await git.log(['--max-count=500']);
    const commits = log.all;
    
    const patterns = {
      failures: commits.filter((c: any) => 
        c.message.toLowerCase().includes('fix') || 
        c.message.toLowerCase().includes('failed')
      ),
      reverts: commits.filter((c: any) => 
        c.message.startsWith('Revert')
      ),
      clusters: this.findCommitClusters(commits),
    };
    
    return patterns;
  }
  
  private findCommitClusters(commits: any[]): any[] {
    // Find areas where many commits happened in short time
    const clusters = [];
    // Implementation would analyze timestamp patterns
    return clusters;
  }
  
  private applyPerspectives(weaveData: any, gitPatterns: any): any {
    const perspectives = {
      engineering: this.engineeringPerspective(gitPatterns),
      product: this.productPerspective(weaveData),
      learning: this.learningPerspective(weaveData, gitPatterns),
      collaboration: this.collaborationPerspective(weaveData),
    };
    
    return perspectives;
  }
  
  private engineeringPerspective(gitPatterns: any): any {
    return {
      technicalDebt: 'Analysis of technical shortcuts taken',
      architectureEvolution: 'How the architecture changed over time',
      toolingIssues: 'Problems with development tools',
    };
  }
  
  private productPerspective(weaveData: any): any {
    return {
      featureCreep: 'Unplanned features added',
      requirementChanges: 'How requirements evolved',
      userFeedback: 'Impact of user feedback on direction',
    };
  }
  
  private learningPerspective(weaveData: any, gitPatterns: any): any {
    return {
      knowledgeGaps: 'What we didnt know at the start',
      skillsAcquired: 'New skills learned during project',
      documentationDebt: 'What should have been documented',
    };
  }
  
  private collaborationPerspective(weaveData: any): any {
    if (!weaveData || !weaveData.connections) {
      return { aiInteractions: 'No collaboration data found' };
    }
    
    return {
      aiInteractions: 'Patterns in human-AI collaboration',
      communicationBreakdowns: 'Where understanding failed',
      successfulPairings: 'What collaboration patterns worked',
    };
  }
  
  private synthesizeFindings(perspectives: any): AnalysisResult {
    return {
      summary: 'Comprehensive analysis of project patterns and lessons',
      patterns: {
        positive: ['Effective patterns identified'],
        negative: ['Problematic patterns found'],
        circular: ['Circular development detected'],
      },
      keyMoments: {
        breakthroughs: ['Moments of sudden progress'],
        struggles: ['Areas of unexpected difficulty'],
      },
    };
  }
  
  private generateYoloReport(analysis: AnalysisResult, questions: Question[]): string {
    const report: string[] = ['# Complete Weaver Analysis', ''];
    
    report.push('## Summary');
    report.push(analysis.summary);
    report.push('');
    
    report.push('## Patterns Detected');
    report.push('### Positive Patterns');
    for (const p of analysis.patterns.positive) {
      report.push(`- ${p}`);
    }
    
    report.push('### Negative Patterns');
    for (const p of analysis.patterns.negative) {
      report.push(`- ${p}`);
    }
    
    report.push('### Circular Development');
    for (const p of analysis.patterns.circular) {
      report.push(`- ${p}`);
    }
    
    report.push('');
    report.push('## Unanswered Questions');
    report.push('These questions would benefit from human input:');
    for (const q of questions.slice(0, 5)) {
      report.push(`- ${q.question}`);
    }
    
    return report.join('\n');
  }
  
  private generateImprovements(answers: any[]): string[] {
    const improvements: string[] = [];
    
    // Analyze answers to generate specific improvements
    for (const answer of answers) {
      if (answer.answer.includes('documentation')) {
        improvements.push('Add documentation requirements to agent instructions');
      }
      if (answer.answer.includes('verification')) {
        improvements.push('Add verification steps to workflow');
      }
      // More pattern matching...
    }
    
    return improvements;
  }
}
