import { GitCommit, GitBranch, GitTag, GitLogItem, GitGraphState } from './types';

const BRANCH_COLORS = [
  '#1D9BF0', // Blue (main)
  '#10B981', // Emerald (feature)
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
];

export class GitSimulationEngine {
  private state: GitGraphState;
  private commitCounter = 0;
  private colorIndex = 0;

  constructor() {
    this.state = {
      commits: {},
      branches: {
        main: {
          name: 'main',
          targetCommitId: '',
          color: BRANCH_COLORS[0],
        },
      },
      tags: {},
      head: {
        type: 'branch',
        name: 'main',
      },
      logs: [],
    };
  }

  public getState(): GitGraphState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public reset(): void {
    this.commitCounter = 0;
    this.colorIndex = 0;
    this.state = {
      commits: {},
      branches: {
        main: {
          name: 'main',
          targetCommitId: '',
          color: BRANCH_COLORS[0],
        },
      },
      tags: {},
      head: {
        type: 'branch',
        name: 'main',
      },
      logs: [],
    };
  }

  // Generate short pseudo-hash
  private generateHash(): { hash: string; shortHash: string } {
    this.commitCounter++;
    const chars = '0123456789abcdef';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    const shortHash = `${this.commitCounter.toString(16).padStart(2, '0')}${rand.slice(0, 5)}`;
    const hash = `${shortHash}${rand}${rand}${rand}${rand}`.slice(0, 40);
    return { hash, shortHash };
  }

  private getBranchColor(branchName: string): string {
    if (this.state.branches[branchName]) {
      return this.state.branches[branchName].color;
    }
    this.colorIndex++;
    return BRANCH_COLORS[this.colorIndex % BRANCH_COLORS.length];
  }

  private getCurrentCommitId(): string | null {
    if (this.state.head.type === 'branch') {
      const b = this.state.branches[this.state.head.name];
      return b ? b.targetCommitId : null;
    }
    return this.state.head.name || null;
  }

  // Execute terminal input command
  public execute(commandStr: string): { success: boolean; output: string } {
    const raw = commandStr.trim();
    if (!raw) return { success: true, output: '' };

    const parts = raw.split(/\s+/);
    if (parts[0] !== 'git') {
      const err = `git: '${parts[0]}' is not a git command.`;
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    const sub = parts[1];

    try {
      switch (sub) {
        case 'commit':
          return this.handleCommit(raw);
        case 'branch':
          return this.handleBranch(raw, parts);
        case 'checkout':
          return this.handleCheckout(raw, parts);
        case 'switch':
          return this.handleSwitch(raw, parts);
        case 'merge':
          return this.handleMerge(raw, parts);
        case 'rebase':
          return this.handleRebase(raw, parts);
        case 'cherry-pick':
          return this.handleCherryPick(raw, parts);
        case 'reset':
          return this.handleReset(raw, parts);
        case 'tag':
          return this.handleTag(raw, parts);
        case 'status':
          return this.handleStatus(raw);
        case 'log':
          return this.handleLog(raw);
        case 'help':
          return this.handleHelp(raw);
        default: {
          const err = `git: '${sub}' is not a valid command. Type 'git help' for list of commands.`;
          this.log(raw, err, 'error');
          return { success: false, output: err };
        }
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Unknown git command error.';
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }
  }

  // 1. git commit -m "message"
  private handleCommit(raw: string): { success: boolean; output: string } {
    let message = 'Commit changes';
    const match = raw.match(/-m\s+["']([^"']+)["']/);
    if (match && match[1]) {
      message = match[1];
    } else {
      const mIdx = raw.indexOf('-m');
      if (mIdx !== -1) {
        message = raw.substring(mIdx + 2).trim().replace(/^["']|["']$/g, '');
      }
    }

    const parentId = this.getCurrentCommitId();
    const parents = parentId && this.state.commits[parentId] ? [parentId] : [];
    const { hash, shortHash } = this.generateHash();
    const currentBranchName = this.state.head.type === 'branch' ? this.state.head.name : 'detached';
    const color = this.getBranchColor(currentBranchName);

    const newCommit: GitCommit = {
      id: shortHash,
      hash,
      shortHash,
      message,
      parents,
      branch: currentBranchName,
      timestamp: Date.now(),
      author: 'developer <dev@c3mindloop.com>',
      color,
    };

    this.state.commits[shortHash] = newCommit;

    // Update branch pointer
    if (this.state.head.type === 'branch') {
      const b = this.state.branches[this.state.head.name];
      if (b) {
        b.targetCommitId = shortHash;
      }
    } else {
      this.state.head.name = shortHash;
    }

    const out = `[${currentBranchName} ${shortHash}] ${message}\n 1 file changed, 1 insertion(+)`;
    this.log(raw, out, 'success');
    return { success: true, output: out };
  }

  // 2. git branch <name>
  private handleBranch(raw: string, parts: string[]): { success: boolean; output: string } {
    if (parts.length === 2) {
      // List branches
      const list = Object.keys(this.state.branches)
        .map(b => (this.state.head.type === 'branch' && this.state.head.name === b ? `* ${b}` : `  ${b}`))
        .join('\n');
      this.log(raw, list, 'info');
      return { success: true, output: list };
    }

    const branchName = parts[2];
    if (this.state.branches[branchName]) {
      const err = `fatal: A branch named '${branchName}' already exists.`;
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    const currentCommitId = this.getCurrentCommitId() || '';
    const color = this.getBranchColor(branchName);

    this.state.branches[branchName] = {
      name: branchName,
      targetCommitId: currentCommitId,
      color,
    };

    const out = `Created branch '${branchName}' pointing to ${currentCommitId || 'HEAD'}.`;
    this.log(raw, out, 'success');
    return { success: true, output: out };
  }

  // 3. git checkout <branch|hash> or git checkout -b <name>
  private handleCheckout(raw: string, parts: string[]): { success: boolean; output: string } {
    if (parts[2] === '-b') {
      const newBranchName = parts[3];
      if (!newBranchName) {
        const err = 'fatal: Missing branch name for -b flag.';
        this.log(raw, err, 'error');
        return { success: false, output: err };
      }
      if (this.state.branches[newBranchName]) {
        const err = `fatal: A branch named '${newBranchName}' already exists.`;
        this.log(raw, err, 'error');
        return { success: false, output: err };
      }
      const currentCommitId = this.getCurrentCommitId() || '';
      this.state.branches[newBranchName] = {
        name: newBranchName,
        targetCommitId: currentCommitId,
        color: this.getBranchColor(newBranchName),
      };
      this.state.head = { type: 'branch', name: newBranchName };
      const out = `Switched to a new branch '${newBranchName}'`;
      this.log(raw, out, 'success');
      return { success: true, output: out };
    }

    const target = parts[2];
    if (!target) {
      const err = 'fatal: Branch or commit target required.';
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    // Check if target is branch
    if (this.state.branches[target]) {
      this.state.head = { type: 'branch', name: target };
      const out = `Switched to branch '${target}'`;
      this.log(raw, out, 'success');
      return { success: true, output: out };
    }

    // Check if target is commit hash (detached HEAD)
    if (this.state.commits[target]) {
      this.state.head = { type: 'detached', name: target };
      const out = `Note: switching to '${target}'.\nYou are in 'detached HEAD' state.`;
      this.log(raw, out, 'info');
      return { success: true, output: out };
    }

    const err = `error: pathspec '${target}' did not match any file(s) or branch known to git.`;
    this.log(raw, err, 'error');
    return { success: false, output: err };
  }

  // 4. git switch <branch> or git switch -c <name>
  private handleSwitch(raw: string, parts: string[]): { success: boolean; output: string } {
    if (parts[2] === '-c' || parts[2] === '-C') {
      return this.handleCheckout(raw, ['git', 'checkout', '-b', parts[3]]);
    }
    return this.handleCheckout(raw, ['git', 'checkout', parts[2]]);
  }

  // 5. git merge <branch>
  private handleMerge(raw: string, parts: string[]): { success: boolean; output: string } {
    const targetBranchName = parts[2];
    if (!targetBranchName || !this.state.branches[targetBranchName]) {
      const err = `merge: ${targetBranchName} - not something we can merge`;
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    const currentBranchName = this.state.head.type === 'branch' ? this.state.head.name : null;
    if (!currentBranchName) {
      const err = 'fatal: You are in detached HEAD state. Switch to a branch before merging.';
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    const currentCommitId = this.state.branches[currentBranchName].targetCommitId;
    const targetCommitId = this.state.branches[targetBranchName].targetCommitId;

    if (!targetCommitId) {
      const out = 'Already up to date.';
      this.log(raw, out, 'info');
      return { success: true, output: out };
    }

    if (currentCommitId === targetCommitId) {
      const out = 'Already up to date.';
      this.log(raw, out, 'info');
      return { success: true, output: out };
    }

    // Fast-Forward Check: If current branch has no commits or is an ancestor of target
    if (!currentCommitId) {
      this.state.branches[currentBranchName].targetCommitId = targetCommitId;
      const out = `Updating HEAD...\nFast-forward merge to ${targetCommitId}`;
      this.log(raw, out, 'success');
      return { success: true, output: out };
    }

    // Create 3-Way Merge Commit
    const { hash, shortHash } = this.generateHash();
    let message = `Merge branch '${targetBranchName}' into ${currentBranchName}`;
    const mMatch = raw.match(/-m\s+["']([^"']+)["']/);
    if (mMatch && mMatch[1]) message = mMatch[1];

    const mergeCommit: GitCommit = {
      id: shortHash,
      hash,
      shortHash,
      message,
      parents: [currentCommitId, targetCommitId],
      branch: currentBranchName,
      timestamp: Date.now(),
      author: 'developer <dev@c3mindloop.com>',
      color: this.state.branches[currentBranchName].color,
    };

    this.state.commits[shortHash] = mergeCommit;
    this.state.branches[currentBranchName].targetCommitId = shortHash;

    const out = `Merge made by the 'ort' strategy.\n ${shortHash} Merge branch '${targetBranchName}' into ${currentBranchName}`;
    this.log(raw, out, 'success');
    return { success: true, output: out };
  }

  // 6. git rebase <targetBranch>
  private handleRebase(raw: string, parts: string[]): { success: boolean; output: string } {
    const targetBranch = parts[2];
    if (!targetBranch || !this.state.branches[targetBranch]) {
      const err = `fatal: invalid upstream '${targetBranch}'`;
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    const currentBranchName = this.state.head.type === 'branch' ? this.state.head.name : null;
    if (!currentBranchName) {
      const err = 'fatal: Cannot rebase in detached HEAD state.';
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    const targetCommitId = this.state.branches[targetBranch].targetCommitId;
    let currentCommitId = this.state.branches[currentBranchName].targetCommitId;

    if (!currentCommitId || currentCommitId === targetCommitId) {
      const out = `Current branch ${currentBranchName} is up to date.`;
      this.log(raw, out, 'info');
      return { success: true, output: out };
    }

    // Collect commits on current branch up to divergence
    const commitsToReplay: GitCommit[] = [];
    const visited = new Set<string>();
    let curr: string | undefined = currentCommitId;

    while (curr && this.state.commits[curr] && curr !== targetCommitId && !visited.has(curr)) {
      visited.add(curr);
      const commit: GitCommit = this.state.commits[curr];
      commitsToReplay.unshift(commit);
      curr = commit.parents[0];
    }

    // Replay commits onto targetCommitId
    let lastParentId = targetCommitId;
    for (const oldCommit of commitsToReplay) {
      const { hash, shortHash } = this.generateHash();
      const replayedCommit: GitCommit = {
        id: shortHash,
        hash,
        shortHash,
        message: `${oldCommit.message}`,
        parents: [lastParentId],
        branch: currentBranchName,
        timestamp: Date.now(),
        author: oldCommit.author,
        color: this.state.branches[currentBranchName].color,
      };
      this.state.commits[shortHash] = replayedCommit;
      lastParentId = shortHash;
    }

    this.state.branches[currentBranchName].targetCommitId = lastParentId;

    const out = `Successfully rebased and updated refs/heads/${currentBranchName}. Replayed ${commitsToReplay.length} commits.`;
    this.log(raw, out, 'success');
    return { success: true, output: out };
  }

  // 7. git cherry-pick <commitHash>
  private handleCherryPick(raw: string, parts: string[]): { success: boolean; output: string } {
    const targetHash = parts[2];
    const sourceCommit = this.state.commits[targetHash];
    if (!sourceCommit) {
      const err = `fatal: bad revision '${targetHash}'`;
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    const currentCommitId = this.getCurrentCommitId() || '';
    const currentBranchName = this.state.head.type === 'branch' ? this.state.head.name : 'detached';
    const { hash, shortHash } = this.generateHash();

    const cherryCommit: GitCommit = {
      id: shortHash,
      hash,
      shortHash,
      message: `${sourceCommit.message} (cherry-picked from ${targetHash})`,
      parents: currentCommitId ? [currentCommitId] : [],
      branch: currentBranchName,
      timestamp: Date.now(),
      author: sourceCommit.author,
      color: this.getBranchColor(currentBranchName),
    };

    this.state.commits[shortHash] = cherryCommit;
    if (this.state.head.type === 'branch') {
      this.state.branches[currentBranchName].targetCommitId = shortHash;
    } else {
      this.state.head.name = shortHash;
    }

    const out = `[${currentBranchName} ${shortHash}] ${cherryCommit.message}\n 1 file changed, 1 insertion(+)`;
    this.log(raw, out, 'success');
    return { success: true, output: out };
  }

  // 8. git reset [--hard|--soft] <target>
  private handleReset(raw: string, parts: string[]): { success: boolean; output: string } {
    let target = parts[2];
    if (parts[2] === '--hard' || parts[2] === '--soft' || parts[2] === '--mixed') {
      target = parts[3];
    }

    if (!target || !this.state.commits[target]) {
      const err = `fatal: Cannot reset to '${target}' - commit not found.`;
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    if (this.state.head.type === 'branch') {
      this.state.branches[this.state.head.name].targetCommitId = target;
    } else {
      this.state.head.name = target;
    }

    const out = `HEAD is now at ${target} ${this.state.commits[target].message}`;
    this.log(raw, out, 'success');
    return { success: true, output: out };
  }

  // 9. git tag <name> [<hash>]
  private handleTag(raw: string, parts: string[]): { success: boolean; output: string } {
    const tagName = parts[2];
    if (!tagName) {
      const list = Object.keys(this.state.tags).join('\n') || '(no tags created)';
      this.log(raw, list, 'info');
      return { success: true, output: list };
    }

    const targetCommit = parts[3] || this.getCurrentCommitId() || '';
    if (!targetCommit || !this.state.commits[targetCommit]) {
      const err = `fatal: Cannot tag empty commit or bad revision '${targetCommit}'`;
      this.log(raw, err, 'error');
      return { success: false, output: err };
    }

    this.state.tags[tagName] = { name: tagName, targetCommitId: targetCommit };
    if (!this.state.commits[targetCommit].tags) {
      this.state.commits[targetCommit].tags = [];
    }
    this.state.commits[targetCommit].tags!.push(tagName);

    const out = `Created tag '${tagName}' at ${targetCommit}.`;
    this.log(raw, out, 'success');
    return { success: true, output: out };
  }

  // 10. git status
  private handleStatus(raw: string): { success: boolean; output: string } {
    const headInfo =
      this.state.head.type === 'branch'
        ? `On branch ${this.state.head.name}`
        : `HEAD detached at ${this.state.head.name}`;
    const out = `${headInfo}\nnothing to commit, working tree clean`;
    this.log(raw, out, 'info');
    return { success: true, output: out };
  }

  // 11. git log
  private handleLog(raw: string): { success: boolean; output: string } {
    const commits = Object.values(this.state.commits).reverse();
    if (commits.length === 0) {
      const out = 'fatal: your current branch does not have any commits yet';
      this.log(raw, out, 'info');
      return { success: true, output: out };
    }

    const out = commits
      .map(
        c =>
          `commit ${c.hash}\nAuthor: ${c.author}\nDate: ${new Date(c.timestamp).toUTCString()}\n\n    ${c.message}\n`
      )
      .join('\n');
    this.log(raw, out, 'info');
    return { success: true, output: out };
  }

  // 12. git help
  private handleHelp(raw: string): { success: boolean; output: string } {
    const out = `Supported Git Commands:
 • git commit -m "your message"
 • git branch <branch-name>
 • git checkout <branch-name> | git checkout -b <new-branch>
 • git switch <branch-name> | git switch -c <new-branch>
 • git merge <branch-name> [-m "message"]
 • git rebase <target-branch>
 • git cherry-pick <commit-hash>
 • git reset [--hard|--soft] <commit-hash>
 • git tag <tag-name> [<commit-hash>]
 • git status
 • git log`;
    this.log(raw, out, 'info');
    return { success: true, output: out };
  }

  private log(command: string, output: string, type: 'success' | 'error' | 'info'): void {
    this.state.logs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      command,
      output,
      type,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  // Calculate Layout Coordinates for SVG Rendering
  public calculateDAGLayout(): {
    nodes: (GitCommit & { x: number; y: number; isHead: boolean; branchesHere: string[] })[];
    links: { from: { x: number; y: number }; to: { x: number; y: number }; color: string; id: string }[];
    bounds: { width: number; height: number };
  } {
    const commitList = Object.values(this.state.commits);
    if (commitList.length === 0) {
      return { nodes: [], links: [], bounds: { width: 600, height: 300 } };
    }

    // Topological Sort (Ancestors first)
    const sorted: GitCommit[] = [];
    const visited = new Set<string>();

    const visit = (cId: string) => {
      if (visited.has(cId)) return;
      visited.add(cId);
      const commit: GitCommit | undefined = this.state.commits[cId];
      if (commit && commit.parents) {
        for (const p of commit.parents) {
          if (this.state.commits[p]) {
            visit(p);
          }
        }
      }
      if (commit) sorted.push(commit);
    };

    for (const c of commitList) {
      visit(c.id);
    }

    // Assign branch lanes (columns/y coordinates)
    const branchLanes: Record<string, number> = { main: 0 };
    let maxLane = 0;

    for (const b of Object.keys(this.state.branches)) {
      if (branchLanes[b] === undefined) {
        maxLane++;
        branchLanes[b] = maxLane;
      }
    }

    const LANE_HEIGHT = 70;
    const NODE_SPACING_X = 140;
    const PADDING_X = 80;
    const PADDING_Y = 60;

    const currentHeadCommitId = this.getCurrentCommitId();

    const nodesWithPos = sorted.map((commit, index) => {
      const lane = branchLanes[commit.branch] !== undefined ? branchLanes[commit.branch] : 0;
      const x = PADDING_X + index * NODE_SPACING_X;
      const y = PADDING_Y + lane * LANE_HEIGHT;

      // Find branches pointing to this commit
      const branchesHere = Object.values(this.state.branches)
        .filter(b => b.targetCommitId === commit.id)
        .map(b => b.name);

      const isHead = currentHeadCommitId === commit.id;

      return {
        ...commit,
        x,
        y,
        lane,
        isHead,
        branchesHere,
      };
    });

    const nodeMap = new Map(nodesWithPos.map(n => [n.id, n]));
    const links: { from: { x: number; y: number }; to: { x: number; y: number }; color: string; id: string }[] = [];

    for (const node of nodesWithPos) {
      if (node.parents && node.parents.length > 0) {
        for (const pId of node.parents) {
          const parentNode = nodeMap.get(pId);
          if (parentNode) {
            links.push({
              id: `${parentNode.id}->${node.id}`,
              from: { x: parentNode.x, y: parentNode.y },
              to: { x: node.x, y: node.y },
              color: node.color || '#1D9BF0',
            });
          }
        }
      }
    }

    const totalWidth = Math.max(800, PADDING_X * 2 + (sorted.length - 1) * NODE_SPACING_X + 180);
    const totalHeight = Math.max(360, PADDING_Y * 2 + (maxLane + 1) * LANE_HEIGHT + 60);

    return {
      nodes: nodesWithPos,
      links,
      bounds: { width: totalWidth, height: totalHeight },
    };
  }
}
