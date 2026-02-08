import { simpleGit, type SimpleGit, type LogResult, type DefaultLogFields } from 'simple-git';
import type { CommitInfo, BranchInfo, CommitCluster, RevertPattern, FileHotspot, RepositoryAnalysis } from './types.js';

export class GitAnalyzer {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async analyze(maxCommits = 500): Promise<RepositoryAnalysis> {
    await this.assertIsRepo();

    const [log, branches] = await Promise.all([
      this.git.log(['--max-count', String(maxCommits), '--stat']),
      this.git.branchLocal(),
    ]);

    const commits = this.parseCommits(log);
    const branchInfos = await this.analyzeBranches(branches);
    const clusters = this.findCommitClusters(commits);
    const reverts = this.findReverts(commits);
    const hotspots = this.findHotspots(commits);
    const burstPeriods = this.findBurstPeriods(commits);

    const authors = [...new Set(commits.map(c => c.author))];
    const dates = commits.map(c => c.date).sort();

    return {
      path: this.repoPath,
      analyzedAt: new Date().toISOString(),
      totalCommits: commits.length,
      activeBranches: branchInfos,
      dateRange: {
        first: dates[0] ?? '',
        last: dates[dates.length - 1] ?? '',
      },
      authors,
      commitFrequency: this.calculateFrequency(commits),
      clusters,
      reverts,
      hotspots,
      coupledFiles: [],
      timeSinks: [],
      circularPatterns: [],
      burstPeriods,
    };
  }

  private async assertIsRepo(): Promise<void> {
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error(`${this.repoPath} is not a git repository`);
    }
  }

  private parseCommits(log: LogResult<DefaultLogFields>): CommitInfo[] {
    return log.all.map(entry => ({
      hash: entry.hash,
      date: entry.date,
      message: entry.message,
      author: entry.author_name,
      files: (entry as any).diff?.files?.map((f: any) => f.file) ?? [],
    }));
  }

  private async analyzeBranches(branches: { all: string[]; current: string }): Promise<BranchInfo[]> {
    const results: BranchInfo[] = [];

    for (const branch of branches.all) {
      try {
        const log = await this.git.log([branch, '--max-count', '1']);
        const commitCount = await this.git.raw(['rev-list', '--count', branch]);
        const lastDate = log.latest?.date ?? '';
        const daysSince = lastDate
          ? (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
          : 0;

        // Check if merged into current branch
        let isMerged = false;
        if (branch !== branches.current) {
          try {
            const merged = await this.git.raw(['branch', '--merged', branches.current]);
            isMerged = merged.split('\n').some(b => b.trim() === branch);
          } catch { /* ignore */ }
        }

        results.push({
          name: branch,
          lastCommitDate: lastDate,
          commitCount: parseInt(commitCount.trim(), 10) || 0,
          isMerged,
          daysSinceLastCommit: Math.floor(daysSince),
        });
      } catch {
        // Branch might be invalid
      }
    }

    return results;
  }

  private findCommitClusters(commits: CommitInfo[], gapHours = 4): CommitCluster[] {
    if (commits.length === 0) return [];

    const sorted = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const clusters: CommitCluster[] = [];
    let current: CommitInfo[] = [sorted[0]];
    const gapMs = gapHours * 60 * 60 * 1000;

    for (let i = 1; i < sorted.length; i++) {
      const prevTime = new Date(sorted[i - 1].date).getTime();
      const curTime = new Date(sorted[i].date).getTime();

      if (curTime - prevTime <= gapMs) {
        current.push(sorted[i]);
      } else {
        if (current.length >= 3) {
          clusters.push(this.makeCluster(current));
        }
        current = [sorted[i]];
      }
    }
    if (current.length >= 3) {
      clusters.push(this.makeCluster(current));
    }

    return clusters;
  }

  private makeCluster(commits: CommitInfo[]): CommitCluster {
    // Find most common words in commit messages to determine topic
    const words = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'it', 'fix', 'add', 'update', 'with']);

    for (const c of commits) {
      for (const w of c.message.toLowerCase().split(/\W+/)) {
        if (w.length > 2 && !stopWords.has(w)) {
          words.set(w, (words.get(w) ?? 0) + 1);
        }
      }
    }

    const dominantTopic = [...words.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general';

    return {
      startDate: commits[0].date,
      endDate: commits[commits.length - 1].date,
      commits,
      dominantTopic,
    };
  }

  private findReverts(commits: CommitInfo[]): RevertPattern[] {
    const reverts: RevertPattern[] = [];

    for (const commit of commits) {
      if (commit.message.startsWith('Revert')) {
        // Try to find the original commit message
        const match = commit.message.match(/Revert "(.+)"/);
        if (match) {
          const original = commits.find(c => c.message === match[1]);
          if (original) {
            const daysBetween = Math.abs(
              new Date(commit.date).getTime() - new Date(original.date).getTime()
            ) / (1000 * 60 * 60 * 24);

            reverts.push({ originalCommit: original, revertCommit: commit, daysBetween });
          }
        }
      }
    }

    return reverts;
  }

  private findHotspots(commits: CommitInfo[]): FileHotspot[] {
    const fileChanges = new Map<string, { count: number; authors: Set<string>; lastDate: string }>();

    for (const commit of commits) {
      for (const file of commit.files) {
        const existing = fileChanges.get(file);
        if (existing) {
          existing.count++;
          existing.authors.add(commit.author);
          if (commit.date > existing.lastDate) existing.lastDate = commit.date;
        } else {
          fileChanges.set(file, {
            count: 1,
            authors: new Set([commit.author]),
            lastDate: commit.date,
          });
        }
      }
    }

    return [...fileChanges.entries()]
      .filter(([, data]) => data.count >= 3)
      .map(([path, data]) => ({
        path,
        changeCount: data.count,
        uniqueAuthors: data.authors.size,
        lastChanged: data.lastDate,
      }))
      .sort((a, b) => b.changeCount - a.changeCount)
      .slice(0, 20);
  }

  private findBurstPeriods(commits: CommitInfo[]): { start: string; end: string; commitCount: number }[] {
    // Find days with unusually high commit counts
    const dailyCounts = new Map<string, CommitInfo[]>();
    for (const c of commits) {
      const day = c.date.slice(0, 10);
      const existing = dailyCounts.get(day) ?? [];
      existing.push(c);
      dailyCounts.set(day, existing);
    }

    const counts = [...dailyCounts.values()].map(v => v.length);
    if (counts.length === 0) return [];

    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const threshold = Math.max(avg * 2, 5);

    return [...dailyCounts.entries()]
      .filter(([, commits]) => commits.length >= threshold)
      .map(([day, commits]) => ({
        start: day,
        end: day,
        commitCount: commits.length,
      }))
      .sort((a, b) => b.commitCount - a.commitCount);
  }

  private calculateFrequency(commits: CommitInfo[]) {
    const daily = new Map<string, number>();
    const weekday = new Array(7).fill(0);
    const hourly = new Array(24).fill(0);

    for (const c of commits) {
      const d = new Date(c.date);
      const dayKey = c.date.slice(0, 10);
      daily.set(dayKey, (daily.get(dayKey) ?? 0) + 1);
      weekday[d.getDay()]++;
      hourly[d.getHours()]++;
    }

    return { daily, weekday, hourly };
  }
}
