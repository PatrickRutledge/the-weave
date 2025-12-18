interface DeploymentInfo {
    method: string;
    target: string;
    status: string;
    lastDeployed?: Date;
    notes: string[];
}
interface DeploymentAnalysis {
    currentDeployments: DeploymentInfo[];
    deploymentStrategy: string;
    recommendations: string[];
    issues: string[];
}
export declare class DeploymentAnalyzer {
    analyze(projectPath: string): Promise<DeploymentAnalysis>;
    private detectDeploymentTypes;
    private analyzeDeploymentType;
    private determineStrategy;
    private generateRecommendations;
    private identifyIssues;
}
export {};
//# sourceMappingURL=deployment-analyzer.d.ts.map