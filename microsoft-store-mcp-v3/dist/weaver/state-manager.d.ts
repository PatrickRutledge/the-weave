interface Question {
    id: string;
    question: string;
    context?: string;
    priority: number;
}
interface Answer {
    questionId: string;
    answer: string;
    timestamp: Date;
}
interface AgentState {
    mode: 'interactive' | 'yolo' | 'investigation';
    agentType: 'review' | 'investigate';
    questions: Question[];
    currentQuestionIndex: number;
    totalQuestions: number;
    answers: Answer[];
    currentInvestigation?: {
        pattern: string;
        finding: any;
        question: string;
    };
    lessons: string[];
    startTime: Date;
    projectPath?: string;
}
export declare class StateManager {
    private state;
    constructor();
    initializeAgent(agentType: 'review' | 'investigate', instructions: any, config: any): void;
    setMode(mode: 'interactive' | 'yolo' | 'investigation'): void;
    setQuestions(questions: Question[]): void;
    setCurrentQuestionIndex(index: number): void;
    recordAnswer(questionIndex: number, answer: string): void;
    setCurrentInvestigation(pattern: string, finding: any, question: string): void;
    captureLesson(lesson: string): void;
    getState(): AgentState;
    getCurrentQuestion(): Question | undefined;
    getAnswers(): Answer[];
    reset(): void;
}
export {};
//# sourceMappingURL=state-manager.d.ts.map