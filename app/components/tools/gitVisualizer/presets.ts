import { GitPreset } from './types';

export const GIT_PRESETS: GitPreset[] = [
  {
    id: 'feature-merge',
    name: 'Feature Branch & Merge Workflow',
    description: 'Create a feature branch, make commits, and merge it back into main.',
    initialCommands: [
      'git commit -m "Initial commit"',
      'git commit -m "Add core project structure"',
      'git checkout -b feature/auth',
      'git commit -m "Implement login UI"',
      'git commit -m "Add JWT authentication logic"',
      'git checkout main',
      'git commit -m "Update README & documentation"',
      'git merge feature/auth -m "Merge branch \'feature/auth\' into main"',
    ],
  },
  {
    id: 'git-rebase',
    name: 'Rebase Feature Branch Workflow',
    description: 'Demonstrates how git rebase replays feature commits on top of the latest main branch.',
    initialCommands: [
      'git commit -m "Initial commit"',
      'git commit -m "Setup CI/CD pipeline"',
      'git checkout -b feature/search',
      'git commit -m "Add search bar component"',
      'git commit -m "Implement fuzzy search filter"',
      'git checkout main',
      'git commit -m "Fix mobile navbar layout"',
      'git checkout feature/search',
    ],
  },
  {
    id: 'cherry-pick',
    name: 'Cherry-Pick Specific Commits',
    description: 'Pick and apply an isolated commit from an experimental branch onto main.',
    initialCommands: [
      'git commit -m "Initial commit"',
      'git commit -m "Release v1.0.0"',
      'git checkout -b experiment/ai-model',
      'git commit -m "Experiment with local AI"',
      'git commit -m "Fix critical security bug in parser"',
      'git commit -m "Add experimental prompt engine"',
      'git checkout main',
    ],
  },
  {
    id: 'hotfix-multi-branch',
    name: 'Production Hotfix & Release Flow',
    description: 'Simulates a multi-branch environment: main, develop, and urgent production hotfix.',
    initialCommands: [
      'git commit -m "Release v1.0.0"',
      'git checkout -b develop',
      'git commit -m "Start v1.1.0 feature development"',
      'git checkout main',
      'git checkout -b hotfix/payment-gateway',
      'git commit -m "Fix payment webhook timeout bug"',
      'git checkout main',
      'git merge hotfix/payment-gateway -m "Merge hotfix/payment-gateway into main"',
      'git checkout develop',
      'git merge hotfix/payment-gateway -m "Merge hotfix/payment-gateway into develop"',
    ],
  },
  {
    id: 'fresh-repo',
    name: 'Fresh Repository (Clean Canvas)',
    description: 'Start with a fresh repository containing just an initial commit to write your own commands.',
    initialCommands: [
      'git commit -m "Initial commit"',
    ],
  },
];
