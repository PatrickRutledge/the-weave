interface WeaveConfig {
    projectName?: string;
    initialized?: Date;
    version?: string;
    [key: string]: any;
}
export declare class WeaveLoader {
    private weavePath;
    constructor(projectPath?: string);
    loadConfig(): Promise<WeaveConfig | null>;
    loadConnections(): Promise<any>;
    loadEvolutionLog(): Promise<string | null>;
    listWeaveFiles(): Promise<string[]>;
    loadFile(fileName: string): Promise<string>;
    saveConfig(config: WeaveConfig): Promise<void>;
    saveConnections(connections: any): Promise<void>;
    saveEvolutionLog(content: string): Promise<void>;
    appendToEvolutionLog(content: string): Promise<void>;
    weaveExists(): Promise<boolean>;
    initializeWeave(projectName: string): Promise<void>;
    private ensureWeaveDirectory;
}
export {};
//# sourceMappingURL=weave-loader.d.ts.map