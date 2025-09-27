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

export class StateManager {
  private state: AgentState;
  
  constructor() {
    this.state = {
      mode: 'interactive',
      agentType: 'review',
      questions: [],
      currentQuestionIndex: 0,
      totalQuestions: 0,
      answers: [],
      lessons: [],
      startTime: new Date(),
    };
  }
  
  initializeAgent(agentType: 'review' | 'investigate', instructions: any, config: any) {
    this.state.agentType = agentType;
    this.state.startTime = new Date();
    // Store any necessary config
  }
  
  setMode(mode: 'interactive' | 'yolo' | 'investigation') {
    this.state.mode = mode;
  }
  
  setQuestions(questions: Question[]) {
    this.state.questions = questions;
    this.state.totalQuestions = questions.length;
    this.state.currentQuestionIndex = 0;
  }
  
  setCurrentQuestionIndex(index: number) {
    this.state.currentQuestionIndex = index;
  }
  
  recordAnswer(questionIndex: number, answer: string) {
    if (questionIndex < this.state.questions.length) {
      this.state.answers.push({
        questionId: this.state.questions[questionIndex].id,
        answer: answer,
        timestamp: new Date(),
      });
    }
  }
  
  setCurrentInvestigation(pattern: string, finding: any, question: string) {
    this.state.currentInvestigation = {
      pattern,
      finding,
      question,
    };
    this.state.mode = 'investigation';
  }
  
  captureLesson(lesson: string) {
    this.state.lessons.push(lesson);
  }
  
  getState(): AgentState {
    return { ...this.state };
  }
  
  getCurrentQuestion(): Question | undefined {
    return this.state.questions[this.state.currentQuestionIndex];
  }
  
  getAnswers(): Answer[] {
    return this.state.answers;
  }
  
  reset() {
    this.state = {
      mode: 'interactive',
      agentType: 'review',
      questions: [],
      currentQuestionIndex: 0,
      totalQuestions: 0,
      answers: [],
      lessons: [],
      startTime: new Date(),
    };
  }
}
