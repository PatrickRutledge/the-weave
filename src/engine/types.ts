/**
 * Core types for the git analysis engine.
 */

export interface CommitInfo {
  hash: string;
  date: string;
  message: string;
  author: string;
  files: string[];
}

export interface BranchInfo {
  name: string;
  lastCommitDate: string;
  commitCount: number;
  isMerged: boolean;
  daysSinceLastCommit: number;
}

export interface CommitCluster {
  startDate: string;
  endDate: string;
  commits: CommitInfo[];
  dominantTopic: string;
}

export interface RevertPattern {
  originalCommit: CommitInfo;
  revertCommit: CommitInfo;
  daysBetween: number;
}

export interface FileHotspot {
  path: string;
  changeCount: number;
  uniqueAuthors: number;
  lastChanged: string;
}

export interface CoupledFiles {
  fileA: string;
  fileB: string;
  coChangeCount: number;
  totalChanges: number;
  couplingStrength: number;
}

export interface TimeSink {
  topic: string;
  commitCount: number;
  spanDays: number;
  files: string[];
}

export interface CircularPattern {
  file: string;
  addedIn: string;
  removedIn: string;
  reAddedIn: string;
  description: string;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'production' | 'development';
}

export interface FrameworkDetection {
  name: string;
  confidence: number;
  evidence: string[];
}

export interface ConfigFile {
  path: string;
  type: string;
  description: string;
}

export interface DependencyAnalysis {
  dependencies: DependencyInfo[];
  frameworks: FrameworkDetection[];
  configs: ConfigFile[];
  buildTools: string[];
  testFrameworks: string[];
  linters: string[];
}

export interface PivotSignal {
  hash: string;
  date: string;
  message: string;
  kind: 'rewrite' | 'migrate' | 'switch' | 'overhaul';
  filesChanged?: number;
}

export interface PhaseMarker {
  hash: string;
  date: string;
  message: string;
  phase: string;
}

export interface FixSequence {
  startHash: string;
  endHash: string;
  commitCount: number;
  topic: string;
  messages: string[];
}

export interface MessageSignals {
  pivots: PivotSignal[];
  phaseMarkers: PhaseMarker[];
  fixSequences: FixSequence[];
}

export interface BranchInsights {
  deployTargets: string[];
  intents: Record<string, string>;
}

export interface RepositoryAnalysis {
  path: string;
  analyzedAt: string;
  totalCommits: number;
  activeBranches: BranchInfo[];
  dateRange: { first: string; last: string };
  authors: string[];
  commitFrequency: {
    daily: Map<string, number>;
    weekday: number[];
    hourly: number[];
  };
  clusters: CommitCluster[];
  reverts: RevertPattern[];
  hotspots: FileHotspot[];
  coupledFiles: CoupledFiles[];
  timeSinks: TimeSink[];
  circularPatterns: CircularPattern[];
  burstPeriods: { start: string; end: string; commitCount: number }[];
  dependencies?: DependencyAnalysis;
  messageSignals?: MessageSignals;
  branchInsights?: BranchInsights;
  firstCommit?: CommitInfo;
  lastCommit?: CommitInfo;
}

export interface Finding {
  id: string;
  perspectives: string[];
  title: string;
  description: string;
  evidence: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'pattern' | 'antipattern' | 'insight' | 'question';
  relatedFindings?: string[];
}

export interface Lesson {
  id: string;
  findingId: string;
  title: string;
  insight: string;
  actionItems: string[];
  perspectives: string[];
  capturedAt: string;
  userResponse?: string;
}

export interface SessionState {
  id: string;
  mode: 'retrospective' | 'investigation' | 'quick-scan';
  status: 'initializing' | 'analyzing' | 'dialogue' | 'capturing' | 'synthesizing' | 'complete' | 'paused' | 'stopped';
  repositoryPath: string;
  startedAt: string;
  findings: Finding[];
  currentFindingIndex: number;
  lessons: Lesson[];
  consentGranted: boolean;
  comfortLevel: 'surface' | 'exploring' | 'deep';
  rehearsalMode: boolean;
}
