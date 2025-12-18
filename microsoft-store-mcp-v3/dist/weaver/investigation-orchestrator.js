"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestigationOrchestrator = void 0;
const simple_git_1 = __importDefault(require("simple-git"));
class InvestigationOrchestrator {
    stateManager;
    investigatedPatterns = new Set();
    constructor(stateManager) {
        this.stateManager = stateManager;
    }
    async investigate(pattern) {
        const projectPath = process.cwd();
        const git = (0, simple_git_1.default)(projectPath);
        this.investigatedPatterns.add(pattern);
        switch (pattern) {
            case 'build_failures':
                return await this.investigateBuildFailures(git);
            case 'circular_commits':
                return await this.investigateCircularCommits(git);
            case 'time_sinks':
                return await this.investigateTimeSinks(git);
            case 'abandoned_work':
                return await this.investigateAbandonedBranches(git);
            default:
                return await this.investigateCustomPattern(git, pattern);
        }
    }
    async generateQuestion(finding) {
        // Generate a thoughtful question based on the finding
        const questions = {
            critical: `This ${finding.pattern} pattern appears critical. What was happening in the project that led to this situation?`,
            high: `I found ${finding.evidence.length} instances of ${finding.pattern}. What was the underlying challenge you were facing?`,
            medium: `There's a pattern of ${finding.pattern}. What made this more complex than initially expected?`,
            low: `I noticed ${finding.pattern}. Was there a specific constraint or requirement causing this?`,
        };
        return questions[finding.severity];
    }
    async processAnswer(answer) {
        // Extract the lesson from the answer
        const lesson = `Learning: ${answer}`;
        // This would be saved to evolution-log.md
        return lesson;
    }
    async getNextPattern() {
        const patterns = ['build_failures', 'circular_commits', 'time_sinks', 'abandoned_work'];
        for (const pattern of patterns) {
            if (!this.investigatedPatterns.has(pattern)) {
                return pattern;
            }
        }
        return null;
    }
    async generateReport() {
        const state = this.stateManager.getState();
        const report = ['# Investigation Report', ''];
        report.push(`Investigation completed: ${new Date().toISOString()}`);
        report.push('');
        report.push('## Patterns Investigated');
        for (const pattern of this.investigatedPatterns) {
            report.push(`- ${pattern}`);
        }
        report.push('');
        report.push('## Lessons Captured');
        for (const lesson of state.lessons) {
            report.push(`- ${lesson}`);
        }
        report.push('');
        report.push('## Recommended Actions');
        report.push('- Update development workflow to prevent identified patterns');
        report.push('- Add checks for circular development');
        report.push('- Implement early warning system for time sinks');
        return report.join('\n');
    }
    async investigateBuildFailures(git) {
        const log = await git.log(['--grep=build failed', '--grep=fix build', '--max-count=100']);
        const failures = log.all;
        // Group failures by time period
        const clusters = this.findFailureClusters(failures);
        return {
            pattern: 'build_failures',
            description: `Found ${failures.length} build-related commits with ${clusters.length} failure clusters`,
            evidence: failures.slice(0, 5).map((f) => f.message),
            severity: clusters.length > 3 ? 'critical' : 'high',
        };
    }
    async investigateCircularCommits(git) {
        const log = await git.log(['--max-count=500']);
        const reverts = log.all.filter((c) => c.message.startsWith('Revert'));
        // Find patterns of adding/removing same code
        const circular = this.findCircularPatterns(log.all);
        return {
            pattern: 'circular_commits',
            description: `Found ${reverts.length} reverts and ${circular.length} circular patterns`,
            evidence: circular.slice(0, 5),
            severity: circular.length > 5 ? 'high' : 'medium',
        };
    }
    async investigateTimeSinks(git) {
        const log = await git.log(['--max-count=500']);
        // Find features that took many commits
        const sinks = this.findTimeSinks(log.all);
        return {
            pattern: 'time_sinks',
            description: `Found ${sinks.length} features that took excessive time`,
            evidence: sinks.map((s) => s.feature),
            severity: sinks.length > 2 ? 'high' : 'medium',
        };
    }
    async investigateAbandonedBranches(git) {
        const branches = await git.branchLocal();
        const abandoned = [];
        // Check for branches with no recent activity
        for (const branch of branches.all) {
            if (branch === branches.current)
                continue;
            const log = await git.log([branch, '--max-count=1']);
            if (log.latest) {
                const date = new Date(log.latest.date);
                const daysSince = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSince > 30) {
                    abandoned.push(`${branch} (${Math.floor(daysSince)} days old)`);
                }
            }
        }
        return {
            pattern: 'abandoned_work',
            description: `Found ${abandoned.length} abandoned branches`,
            evidence: abandoned,
            severity: abandoned.length > 3 ? 'medium' : 'low',
        };
    }
    async investigateCustomPattern(git, pattern) {
        return {
            pattern: pattern,
            description: `Custom pattern investigation: ${pattern}`,
            evidence: [],
            severity: 'medium',
        };
    }
    findFailureClusters(commits) {
        const clusters = [];
        let currentCluster = [];
        let lastDate = null;
        for (const commit of commits) {
            const date = new Date(commit.date);
            if (!lastDate || (date.getTime() - lastDate.getTime()) < 24 * 60 * 60 * 1000) {
                currentCluster.push(commit);
            }
            else {
                if (currentCluster.length > 3) {
                    clusters.push(currentCluster);
                }
                currentCluster = [commit];
            }
            lastDate = date;
        }
        if (currentCluster.length > 3) {
            clusters.push(currentCluster);
        }
        return clusters;
    }
    findCircularPatterns(commits) {
        const patterns = [];
        const fileChanges = new Map();
        // Track files that were changed multiple times
        for (const commit of commits) {
            // This would parse commit details for file changes
            // Simplified for example
            if (commit.message.includes('Revert') || commit.message.includes('undo')) {
                patterns.push(commit.message);
            }
        }
        return patterns;
    }
    findTimeSinks(commits) {
        const features = new Map();
        // Group commits by feature/module
        for (const commit of commits) {
            // Extract feature from commit message
            const match = commit.message.match(/\[(.*?)\]/);
            if (match) {
                const feature = match[1];
                if (!features.has(feature)) {
                    features.set(feature, []);
                }
                features.get(feature).push(commit);
            }
        }
        // Find features with many commits
        const sinks = [];
        for (const [feature, commits] of features.entries()) {
            if (commits.length > 10) {
                sinks.push({ feature, commits: commits.length });
            }
        }
        return sinks;
    }
}
exports.InvestigationOrchestrator = InvestigationOrchestrator;
//# sourceMappingURL=investigation-orchestrator.js.map