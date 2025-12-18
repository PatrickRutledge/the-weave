import { StateManager } from './state-manager.js';
interface Finding {
    pattern: string;
    description: string;
    evidence: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
}
export declare class InvestigationOrchestrator {
    private stateManager;
    private investigatedPatterns;
    constructor(stateManager: StateManager);
    investigate(pattern: string): Promise<Finding>;
    generateQuestion(finding: Finding): Promise<string>;
    processAnswer(answer: string): Promise<string>;
    getNextPattern(): Promise<string | null>;
    generateReport(): Promise<string>;
    private investigateBuildFailures;
    private investigateCircularCommits;
    private investigateTimeSinks;
    private investigateAbandonedBranches;
    private investigateCustomPattern;
    private findFailureClusters;
    private findCircularPatterns;
    private findTimeSinks;
}
export {};
//# sourceMappingURL=investigation-orchestrator.d.ts.map