import type { CommitInfo, FileHotspot, CoupledFiles } from './types.js';

export class FileAnalyzer {
  analyzeHotspots(commits: CommitInfo[], minChanges = 3): FileHotspot[] {
    const fileData = new Map<string, { count: number; authors: Set<string>; lastDate: string }>();

    for (const commit of commits) {
      for (const file of commit.files) {
        const existing = fileData.get(file);
        if (existing) {
          existing.count++;
          existing.authors.add(commit.author);
          if (commit.date > existing.lastDate) existing.lastDate = commit.date;
        } else {
          fileData.set(file, {
            count: 1,
            authors: new Set([commit.author]),
            lastDate: commit.date,
          });
        }
      }
    }

    return [...fileData.entries()]
      .filter(([, data]) => data.count >= minChanges)
      .map(([filePath, data]) => ({
        path: filePath,
        changeCount: data.count,
        uniqueAuthors: data.authors.size,
        lastChanged: data.lastDate,
      }))
      .sort((a, b) => b.changeCount - a.changeCount);
  }

  analyzeCoupledFiles(commits: CommitInfo[], minCoChanges = 3): CoupledFiles[] {
    // Track which files change together in the same commit
    const coChanges = new Map<string, number>();
    const fileChangeCounts = new Map<string, number>();

    for (const commit of commits) {
      const files = commit.files;

      // Count individual file changes
      for (const file of files) {
        fileChangeCounts.set(file, (fileChangeCounts.get(file) ?? 0) + 1);
      }

      // Count co-changes (pairs of files in same commit)
      for (let i = 0; i < files.length; i++) {
        for (let j = i + 1; j < files.length; j++) {
          const key = [files[i], files[j]].sort().join('|||');
          coChanges.set(key, (coChanges.get(key) ?? 0) + 1);
        }
      }
    }

    return [...coChanges.entries()]
      .filter(([, count]) => count >= minCoChanges)
      .map(([key, count]) => {
        const [fileA, fileB] = key.split('|||');
        const totalChanges = Math.max(
          fileChangeCounts.get(fileA) ?? 0,
          fileChangeCounts.get(fileB) ?? 0,
        );
        return {
          fileA,
          fileB,
          coChangeCount: count,
          totalChanges,
          couplingStrength: totalChanges > 0 ? count / totalChanges : 0,
        };
      })
      .sort((a, b) => b.couplingStrength - a.couplingStrength)
      .slice(0, 20);
  }

  analyzeChurn(commits: CommitInfo[]): { file: string; additions: number; deletions: number; churn: number }[] {
    // Simplified churn analysis based on commit frequency
    const fileData = new Map<string, { changes: number; firstSeen: string; lastSeen: string }>();

    for (const commit of commits) {
      for (const file of commit.files) {
        const existing = fileData.get(file);
        if (existing) {
          existing.changes++;
          if (commit.date < existing.firstSeen) existing.firstSeen = commit.date;
          if (commit.date > existing.lastSeen) existing.lastSeen = commit.date;
        } else {
          fileData.set(file, { changes: 1, firstSeen: commit.date, lastSeen: commit.date });
        }
      }
    }

    return [...fileData.entries()]
      .map(([file, data]) => ({
        file,
        additions: data.changes,
        deletions: 0,
        churn: data.changes,
      }))
      .sort((a, b) => b.churn - a.churn)
      .slice(0, 20);
  }
}
