import type { Metadata } from 'next';
import { GitVisualizerPage } from '../../views/GitVisualizerPage';
import { seoConfig, gitVisualizerSchema } from '../../config/seo.config';

const { gitVisualizer } = seoConfig;

export const metadata: Metadata = {
  title: gitVisualizer.title,
  description: gitVisualizer.description,
  keywords: [...gitVisualizer.keywords],
  alternates: { canonical: gitVisualizer.canonical },
  openGraph: gitVisualizer.openGraph,
  twitter: { card: 'summary_large_image', ...gitVisualizer.twitter },
};

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a Git DAG (Directed Acyclic Graph)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Git DAG (Directed Acyclic Graph) is the internal graph data structure Git uses to record history. Commits are vertices (nodes) that point to their ancestor parent commits via directed edges. Because history only moves forward in time, the graph never loops back on itself (it is acyclic).'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the difference between git merge and git rebase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'git merge combines two branch histories by creating a new 3-way merge commit with two parent references, preserving historical context. git rebase rewrites project history by picking commits from the current branch and reapplying them sequentially on top of the target branch, producing a clean linear history.'
      }
    },
    {
      '@type': 'Question',
      name: 'How does git cherry-pick work in this visualizer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'git cherry-pick <commit-hash> takes a specific commit from any branch and creates a new commit containing identical changes directly on top of your current HEAD branch, without merging the entire source branch.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is a detached HEAD state in Git?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A detached HEAD state occurs when HEAD points directly to a specific commit hash rather than a named branch reference. Any new commits made in detached HEAD will not belong to any branch unless a new branch is created to point to them.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is this Git visualizer running 100% locally in the browser?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, 100%. The Git simulation engine, DAG layout generator, and terminal emulator run entirely in-memory inside your browser with zero network requests and zero server uploads.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gitVisualizerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <GitVisualizerPage />
    </>
  );
}
