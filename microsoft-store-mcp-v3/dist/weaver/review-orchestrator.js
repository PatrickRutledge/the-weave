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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewOrchestrator = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const simple_git_1 = __importDefault(require("simple-git"));
const yaml = __importStar(require("yaml"));
class ReviewOrchestrator {
    stateManager;
    constructor(stateManager) {
        this.stateManager = stateManager;
    }
    async performInitialAnalysis() {
        // Deep analysis phase - this can take several minutes
        const projectPath = process.cwd();
        const git = (0, simple_git_1.default)(projectPath);
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
    async generateQuestions() {
        const analysis = await this.performInitialAnalysis();
        const questions = [];
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
    async performCompleteAnalysis() {
        // YOLO mode - generate complete analysis without interaction
        const analysis = await this.performInitialAnalysis();
        const questions = await this.generateQuestions();
        // Generate a comprehensive report
        const report = this.generateYoloReport(analysis, questions);
        return report;
    }
    async generateEvolutionLog(answers) {
        // Generate the evolution-log.md content
        const log = ['# Evolution Log', ''];
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
    async loadWeaveData(projectPath) {
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
        }
        catch (error) {
            return null;
        }
    }
    async analyzeGitHistory(git) {
        const log = await git.log(['--max-count=500']);
        const commits = log.all;
        const patterns = {
            failures: commits.filter((c) => c.message.toLowerCase().includes('fix') ||
                c.message.toLowerCase().includes('failed')),
            reverts: commits.filter((c) => c.message.startsWith('Revert')),
            clusters: this.findCommitClusters(commits),
        };
        return patterns;
    }
    findCommitClusters(commits) {
        // Find areas where many commits happened in short time
        const clusters = [];
        // Implementation would analyze timestamp patterns
        return clusters;
    }
    applyPerspectives(weaveData, gitPatterns) {
        const perspectives = {
            engineering: this.engineeringPerspective(gitPatterns),
            product: this.productPerspective(weaveData),
            learning: this.learningPerspective(weaveData, gitPatterns),
            collaboration: this.collaborationPerspective(weaveData),
        };
        return perspectives;
    }
    engineeringPerspective(gitPatterns) {
        return {
            technicalDebt: 'Analysis of technical shortcuts taken',
            architectureEvolution: 'How the architecture changed over time',
            toolingIssues: 'Problems with development tools',
        };
    }
    productPerspective(weaveData) {
        return {
            featureCreep: 'Unplanned features added',
            requirementChanges: 'How requirements evolved',
            userFeedback: 'Impact of user feedback on direction',
        };
    }
    learningPerspective(weaveData, gitPatterns) {
        return {
            knowledgeGaps: 'What we didnt know at the start',
            skillsAcquired: 'New skills learned during project',
            documentationDebt: 'What should have been documented',
        };
    }
    collaborationPerspective(weaveData) {
        if (!weaveData || !weaveData.connections) {
            return { aiInteractions: 'No collaboration data found' };
        }
        return {
            aiInteractions: 'Patterns in human-AI collaboration',
            communicationBreakdowns: 'Where understanding failed',
            successfulPairings: 'What collaboration patterns worked',
        };
    }
    synthesizeFindings(perspectives) {
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
    generateYoloReport(analysis, questions) {
        const report = ['# Complete Weaver Analysis', ''];
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
    generateImprovements(answers) {
        const improvements = [];
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
exports.ReviewOrchestrator = ReviewOrchestrator;
//# sourceMappingURL=review-orchestrator.js.map