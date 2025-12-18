export declare class AgentInstructions {
    private agentsPath;
    constructor(projectPath?: string);
    load(agentType: 'review' | 'investigate'): Promise<any>;
    loadRaw(fileName: string): Promise<string>;
    listAgents(): Promise<string[]>;
    private parseInstructions;
    private getDefaultInstructions;
    private getDefaultReviewInstructions;
    private getDefaultInvestigateInstructions;
}
//# sourceMappingURL=agent-instructions.d.ts.map