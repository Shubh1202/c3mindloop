export interface GitCommit {
  id: string;
  hash: string;
  shortHash: string;
  message: string;
  parents: string[];
  branch: string;
  timestamp: number;
  author: string;
  tags?: string[];
  x?: number;
  y?: number;
  lane?: number;
  color?: string;
}

export interface GitBranch {
  name: string;
  targetCommitId: string;
  color: string;
}

export interface GitTag {
  name: string;
  targetCommitId: string;
}

export interface GitLogItem {
  id: string;
  command: string;
  output: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
}

export interface GitGraphState {
  commits: Record<string, GitCommit>;
  branches: Record<string, GitBranch>;
  tags: Record<string, GitTag>;
  head: {
    type: 'branch' | 'detached';
    name: string; // branch name or commit hash
  };
  logs: GitLogItem[];
}

export interface GitPreset {
  id: string;
  name: string;
  description: string;
  initialCommands: string[];
}
