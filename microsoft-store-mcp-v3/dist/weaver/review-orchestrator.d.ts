import { StateManager } from './state-manager.js';
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
export declare class ReviewOrchestrator {
    private stateManager;
    constructor(stateManager: StateManager);
    performInitialAnalysis(): Promise<AnalysisResult>;
    generateQuestions(): Promise<Question[]>;
    performCompleteAnalysis(): Promise<string>;
    generateEvolutionLog(answers: any[]): Promise<string>;
    private loadWeaveData;
    private analyzeGitHistory;
    private findCommitClusters;
    private applyPerspectives;
    private engineeringPerspective;
    private productPerspective;
    private learningPerspective;
    private collaborationPerspective;
    private synthesizeFindings;
    private generateYoloReport;
    private generateImprovements;
}
export {};
//# sourceMappingURL=review-orchestrator.d.ts.map