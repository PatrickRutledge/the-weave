import simpleGit from 'simple-git';

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

export class BranchChecker {
  async analyzeBranches(projectPath: string): Promise<BranchAnalysis> {
    const git = simpleGit(projectPath);
    const analysis: BranchAnalysis = {
      branches: [],
      summary: {
        total: 0,
        active: 0,
        stale: 0,
        abandoned: 0,
      },
      recommendations: [],
    };

    try {
      // Get all local branches
      const branchSummary = await git.branchLocal();
      
      for (const branchName of branchSummary.all) {
        const info = await this.analyzeBranch(git, branchName);
        analysis.branches.push(info);
        
        // Update summary
        analysis.summary[info.status]++;
      }

      analysis.summary.total = analysis.branches.length;

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

    } catch (error) {
      console.error('Error analyzing branches:', error);
    }

    return analysis;
  }

  private async analyzeBranch(git: any, branchName: string): Promise<BranchInfo> {
    // Get last commit on this branch
    const log = await git.log([branchName, '--max-count=1']);
    const lastCommit = log.latest;

    const lastCommitDate = new Date(lastCommit?.date || Date.now());
    const daysSinceLastCommit = Math.floor(
      (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine branch status
    let status: 'active' | 'stale' | 'abandoned';
    if (daysSinceLastCommit <= 7) {
      status = 'active';
    } else if (daysSinceLastCommit <= 30) {
      status = 'stale';
    } else {
      status = 'abandoned';
    }

    // Try to determine purpose from branch name
    const purpose = this.determineBranchPurpose(branchName);

    return {
      name: branchName,
      lastCommitDate,
      lastCommitMessage: lastCommit?.message || 'No commits',
      daysSinceLastCommit,
      purpose,
      status,
    };
  }

  private determineBranchPurpose(branchName: string): string {
    const lower = branchName.toLowerCase();

    if (lower === 'main' || lower === 'master') {
      return 'Main branch';
    }

    if (lower.startsWith('feature/') || lower.startsWith('feat/')) {
      return 'Feature development';
    }

    if (lower.startsWith('bugfix/') || lower.startsWith('fix/')) {
      return 'Bug fix';
    }

    if (lower.startsWith('hotfix/')) {
      return 'Hotfix';
    }

    if (lower.startsWith('release/')) {
      return 'Release preparation';
    }

    if (lower.startsWith('develop') || lower === 'dev') {
      return 'Development branch';
    }

    if (lower.includes('test') || lower.includes('experiment')) {
      return 'Testing/Experimental';
    }

    return 'Unknown purpose';
  }

  private generateRecommendations(analysis: BranchAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.summary.abandoned > 0) {
      recommendations.push(
        `Consider cleaning up ${analysis.summary.abandoned} abandoned branch(es)`
      );
    }

    if (analysis.summary.stale > 2) {
      recommendations.push(
        `Review ${analysis.summary.stale} stale branch(es) - merge or archive`
      );
    }

    if (analysis.summary.total > 10) {
      recommendations.push(
        'Many branches detected - consider adopting a branch cleanup policy'
      );
    }

    // Check for missing standard branches
    const hasDevelop = analysis.branches.some(b => 
      b.name.toLowerCase() === 'develop' || b.name.toLowerCase() === 'dev'
    );
    
    if (!hasDevelop && analysis.summary.total > 3) {
      recommendations.push(
        'Consider using a develop branch for feature integration'
      );
    }

    return recommendations;
  }
}
