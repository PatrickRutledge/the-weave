interface Pattern {
    type: string;
    description: string;
    occurrences: number;
    examples: string[];
    severity: 'low' | 'medium' | 'high';
}
interface PatternAnalysis {
    patterns: Pattern[];
    summary: string;
    recommendations: string[];
}
export declare class GitPatternDetector {
    detectPatterns(projectPath: string): Promise<PatternAnalysis>;
    private detectBuildFailures;
    private detectCircularCommits;
    private detectCommitClusters;
    private detectRevertPattern;
    private detectFixPattern;
    private generateSummary;
    private generateRecommendations;
}
export {};
//# sourceMappingURL=git-pattern-detector.d.ts.map