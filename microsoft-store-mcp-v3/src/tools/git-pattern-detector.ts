import simpleGit from 'simple-git';

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

export class GitPatternDetector {
  async detectPatterns(projectPath: string): Promise<PatternAnalysis> {
    const git = simpleGit(projectPath);
    const analysis: PatternAnalysis = {
      patterns: [],
      summary: '',
      recommendations: [],
    };

    try {
      // Get commit history
      const log = await git.log(['--max-count=500']);
      const commits = log.all;

      // Detect various patterns
      const buildFailures = this.detectBuildFailures(commits);
      const circularCommits = this.detectCircularCommits(commits);
      const commitClusters = this.detectCommitClusters(commits);
      const revertPattern = this.detectRevertPattern(commits);
      const fixPattern = this.detectFixPattern(commits);

      // Add detected patterns
      if (buildFailures.occurrences > 0) {
        analysis.patterns.push(buildFailures);
      }
      if (circularCommits.occurrences > 0) {
        analysis.patterns.push(circularCommits);
      }
      if (commitClusters.occurrences > 0) {
        analysis.patterns.push(commitClusters);
      }
      if (revertPattern.occurrences > 0) {
        analysis.patterns.push(revertPattern);
      }
      if (fixPattern.occurrences > 0) {
        analysis.patterns.push(fixPattern);
      }

      // Generate summary
      analysis.summary = this.generateSummary(analysis.patterns);

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis.patterns);

    } catch (error) {
      console.error('Error detecting patterns:', error);
      analysis.summary = 'Error analyzing commit patterns';
    }

    return analysis;
  }

  private detectBuildFailures(commits: readonly any[]): Pattern {
    const buildKeywords = ['build failed', 'fix build', 'build error', 'build issue'];
    const matches = commits.filter(c => 
      buildKeywords.some(kw => c.message.toLowerCase().includes(kw))
    );

    return {
      type: 'build_failures',
      description: 'Build failure and recovery pattern',
      occurrences: matches.length,
      examples: matches.slice(0, 3).map(m => m.message),
      severity: matches.length > 5 ? 'high' : matches.length > 2 ? 'medium' : 'low',
    };
  }

  private detectCircularCommits(commits: readonly any[]): Pattern {
    const reverts = commits.filter(c => c.message.toLowerCase().startsWith('revert'));
    const undos = commits.filter(c => 
      c.message.toLowerCase().includes('undo') ||
      c.message.toLowerCase().includes('rollback')
    );

    const total = reverts.length + undos.length;

    return {
      type: 'circular_commits',
      description: 'Code added, removed, and re-added pattern',
      occurrences: total,
      examples: [...reverts, ...undos].slice(0, 3).map(m => m.message),
      severity: total > 5 ? 'high' : total > 2 ? 'medium' : 'low',
    };
  }

  private detectCommitClusters(commits: readonly any[]): Pattern {
    const clusters: any[] = [];
    let currentCluster: any[] = [];
    let lastDate: Date | null = null;

    for (const commit of commits) {
      const date = new Date(commit.date);
      
      if (!lastDate) {
        currentCluster = [commit];
        lastDate = date;
        continue;
      }

      // If commits are within 1 hour of each other, they're part of a cluster
      const hoursDiff = (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff <= 1) {
        currentCluster.push(commit);
      } else {
        if (currentCluster.length >= 5) {
          clusters.push([...currentCluster]);
        }
        currentCluster = [commit];
      }
      
      lastDate = date;
    }

    if (currentCluster.length >= 5) {
      clusters.push(currentCluster);
    }

    return {
      type: 'commit_clusters',
      description: 'Many commits in short time period (potential struggle)',
      occurrences: clusters.length,
      examples: clusters.slice(0, 2).map(cluster => 
        `${cluster.length} commits: ${cluster[0].message}`
      ),
      severity: clusters.length > 3 ? 'high' : clusters.length > 1 ? 'medium' : 'low',
    };
  }

  private detectRevertPattern(commits: readonly any[]): Pattern {
    const reverts = commits.filter(c => 
      c.message.toLowerCase().startsWith('revert')
    );

    return {
      type: 'reverts',
      description: 'Commits that were reverted',
      occurrences: reverts.length,
      examples: reverts.slice(0, 3).map(m => m.message),
      severity: reverts.length > 5 ? 'medium' : 'low',
    };
  }

  private detectFixPattern(commits: readonly any[]): Pattern {
    const fixes = commits.filter(c => {
      const lower = c.message.toLowerCase();
      return lower.startsWith('fix') || 
             lower.includes('fixed') || 
             lower.includes('fixing');
    });

    const ratio = commits.length > 0 ? fixes.length / commits.length : 0;

    return {
      type: 'fix_pattern',
      description: 'High ratio of fix commits',
      occurrences: fixes.length,
      examples: fixes.slice(0, 3).map(m => m.message),
      severity: ratio > 0.3 ? 'high' : ratio > 0.2 ? 'medium' : 'low',
    };
  }

  private generateSummary(patterns: Pattern[]): string {
    if (patterns.length === 0) {
      return 'No significant patterns detected in commit history';
    }

    const highSeverity = patterns.filter(p => p.severity === 'high');
    if (highSeverity.length > 0) {
      return `Found ${patterns.length} patterns, ${highSeverity.length} require attention`;
    }

    return `Found ${patterns.length} patterns in commit history`;
  }

  private generateRecommendations(patterns: Pattern[]): string[] {
    const recommendations: string[] = [];

    const buildFailures = patterns.find(p => p.type === 'build_failures');
    if (buildFailures && buildFailures.severity !== 'low') {
      recommendations.push(
        'Consider adding pre-commit hooks to catch build errors early'
      );
    }

    const circular = patterns.find(p => p.type === 'circular_commits');
    if (circular && circular.severity !== 'low') {
      recommendations.push(
        'High number of reverts suggests unclear requirements or testing gaps'
      );
    }

    const clusters = patterns.find(p => p.type === 'commit_clusters');
    if (clusters && clusters.severity === 'high') {
      recommendations.push(
        'Commit clusters suggest areas of struggle - consider retrospective analysis'
      );
    }

    const fixes = patterns.find(p => p.type === 'fix_pattern');
    if (fixes && fixes.severity === 'high') {
      recommendations.push(
        'High ratio of fix commits - consider improving testing strategy'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Commit history looks healthy - good practices observed');
    }

    return recommendations;
  }
}
