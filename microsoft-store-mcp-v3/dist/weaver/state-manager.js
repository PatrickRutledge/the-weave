"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
class StateManager {
    state;
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
    initializeAgent(agentType, instructions, config) {
        this.state.agentType = agentType;
        this.state.startTime = new Date();
        // Store any necessary config
    }
    setMode(mode) {
        this.state.mode = mode;
    }
    setQuestions(questions) {
        this.state.questions = questions;
        this.state.totalQuestions = questions.length;
        this.state.currentQuestionIndex = 0;
    }
    setCurrentQuestionIndex(index) {
        this.state.currentQuestionIndex = index;
    }
    recordAnswer(questionIndex, answer) {
        if (questionIndex < this.state.questions.length) {
            this.state.answers.push({
                questionId: this.state.questions[questionIndex].id,
                answer: answer,
                timestamp: new Date(),
            });
        }
    }
    setCurrentInvestigation(pattern, finding, question) {
        this.state.currentInvestigation = {
            pattern,
            finding,
            question,
        };
        this.state.mode = 'investigation';
    }
    captureLesson(lesson) {
        this.state.lessons.push(lesson);
    }
    getState() {
        return { ...this.state };
    }
    getCurrentQuestion() {
        return this.state.questions[this.state.currentQuestionIndex];
    }
    getAnswers() {
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
exports.StateManager = StateManager;
//# sourceMappingURL=state-manager.js.map