import { StateManager } from './state-manager.js';
import { ReviewOrchestrator } from './review-orchestrator.js';
import { InvestigationOrchestrator } from './investigation-orchestrator.js';

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

export class WeaverOrchestrator {
  private stateManager: StateManager;
  private reviewOrchestrator: ReviewOrchestrator;
  private investigationOrchestrator: InvestigationOrchestrator;
  
  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.reviewOrchestrator = new ReviewOrchestrator(stateManager);
    this.investigationOrchestrator = new InvestigationOrchestrator(stateManager);
  }
  
  async startReview(mode: 'interactive' | 'yolo'): Promise<ReviewResult> {
    this.stateManager.setMode(mode);
    
    if (mode === 'interactive') {
      // CRITICAL: Following BMAD pattern - analyze, then ask ONE question
      const analysis = await this.reviewOrchestrator.performInitialAnalysis();
      const questions = await this.reviewOrchestrator.generateQuestions();
      
      // Store questions in state
      this.stateManager.setQuestions(questions);
      
      return {
        initialAnalysis: analysis.summary,
        nextQuestion: questions[0].question,
        totalQuestions: questions.length,
      };
    } else {
      // YOLO mode - complete analysis at once
      const fullAnalysis = await this.reviewOrchestrator.performCompleteAnalysis();
      return {
        completeAnalysis: fullAnalysis,
      };
    }
  }
  
  async startInvestigation(pattern: string): Promise<InvestigationResult> {
    const finding = await this.investigationOrchestrator.investigate(pattern);
    const question = await this.investigationOrchestrator.generateQuestion(finding);
    
    this.stateManager.setCurrentInvestigation(pattern, finding, question);
    
    return {
      finding: finding.description,
      question: question,
    };
  }
  
  async processAnswer(answer: string): Promise<ProcessResult> {
    const state = this.stateManager.getState();
    
    if (state.mode === 'investigation') {
      // Process investigation answer
      const lesson = await this.investigationOrchestrator.processAnswer(answer);
      this.stateManager.captureLesson(lesson);
      
      // Check for more investigations
      const nextPattern = await this.investigationOrchestrator.getNextPattern();
      if (nextPattern) {
        const finding = await this.investigationOrchestrator.investigate(nextPattern);
        const question = await this.investigationOrchestrator.generateQuestion(finding);
        
        return {
          captured: lesson,
          nextQuestion: question,
          currentQuestion: state.currentQuestionIndex + 1,
          totalQuestions: state.totalQuestions,
        };
      } else {
        const report = await this.investigationOrchestrator.generateReport();
        return {
          captured: lesson,
          finalReport: report,
        };
      }
    } else {
      // Process review answer
      this.stateManager.recordAnswer(state.currentQuestionIndex, answer);
      
      // Move to next question
      const nextIndex = state.currentQuestionIndex + 1;
      this.stateManager.setCurrentQuestionIndex(nextIndex);
      
      if (nextIndex < state.questions.length) {
        return {
          captured: `Answer recorded: ${answer.substring(0, 100)}...`,
          nextQuestion: state.questions[nextIndex].question,
          currentQuestion: nextIndex + 1,
          totalQuestions: state.questions.length,
        };
      } else {
        // All questions answered, generate report
        const report = await this.reviewOrchestrator.generateEvolutionLog(state.answers);
        return {
          captured: `Final answer recorded`,
          finalReport: report,
        };
      }
    }
  }
  
  async skipQuestion(): Promise<ProcessResult> {
    const state = this.stateManager.getState();
    const skippedIndex = state.currentQuestionIndex;
    
    // Record skip
    this.stateManager.recordAnswer(skippedIndex, '[SKIPPED]');
    
    // Move to next
    const nextIndex = skippedIndex + 1;
    this.stateManager.setCurrentQuestionIndex(nextIndex);
    
    if (nextIndex < state.questions.length) {
      return {
        skipped: skippedIndex + 1,
        nextQuestion: state.questions[nextIndex].question,
        currentQuestion: nextIndex + 1,
        totalQuestions: state.questions.length,
      };
    } else {
      // Generate report with skipped questions noted
      const report = await this.reviewOrchestrator.generateEvolutionLog(state.answers);
      return {
        skipped: skippedIndex + 1,
        finalReport: report,
      };
    }
  }
}
