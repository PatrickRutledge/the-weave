interface BranchInfo {
    name: string;
    lastCommitDate: Date;
    lastCommitMessage: string;
    daysSinceLastCommit: number;
    purpose: string;
    status: 'active' | 'stale' | 'abandoned';
}
interface BranchAnalysis {
    branches: BranchInfo[];
    summary: {
        total: number;
        active: number;
        stale: number;
        abandoned: number;
    };
    recommendations: string[];
}
export declare class BranchChecker {
    analyzeBranches(projectPath: string): Promise<BranchAnalysis>;
    private analyzeBranch;
    private determineBranchPurpose;
    private generateRecommendations;
}
export {};
//# sourceMappingURL=branch-checker.d.ts.map