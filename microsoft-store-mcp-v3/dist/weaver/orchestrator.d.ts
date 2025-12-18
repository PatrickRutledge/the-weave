import { StateManager } from './state-manager.js';
interface ReviewResult {
    initialAnalysis?: string;
    nextQuestion?: string;
    totalQuestions?: number;
    completeAnalysis?: string;
}
interface InvestigationResult {
    finding: string;
    question: string;
}
interface ProcessResult {
    captured?: string;
    nextQuestion?: string;
    currentQuestion?: number;
    totalQuestions?: number;
    finalReport?: string;
    skipped?: number;
}
export declare class WeaverOrchestrator {
    private stateManager;
    private reviewOrchestrator;
    private investigationOrchestrator;
    constructor(stateManager: StateManager);
    startReview(mode: 'interactive' | 'yolo'): Promise<ReviewResult>;
    startInvestigation(pattern: string): Promise<InvestigationResult>;
    processAnswer(answer: string): Promise<ProcessResult>;
    skipQuestion(): Promise<ProcessResult>;
}
export {};
//# sourceMappingURL=orchestrator.d.ts.map