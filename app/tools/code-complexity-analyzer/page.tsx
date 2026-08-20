import type { Metadata } from 'next';
import { CodeComplexityAnalyzerPage } from '@/app/views/CodeComplexityAnalyzerPage';
import { seoConfig, BASE_URL } from '../../config/seo.config';

const { codeComplexityAnalyzer } = seoConfig;

const codeComplexityFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is cyclomatic complexity?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cyclomatic complexity is a software metric that counts the number of linearly independent paths through a function. It starts at 1 and increments by 1 for each branching construct: if, else if, for, while, switch case, catch, logical AND (&&), logical OR (||), and ternary operators. A score of 1–5 is Low risk; 6–10 is Medium; 11–20 is High; above 20 is Critical.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is cognitive complexity and how is it different from cyclomatic complexity?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cognitive complexity measures how hard a function is to read and understand, not just how many paths it has. Unlike cyclomatic complexity, it adds a nesting depth penalty — an if statement inside two nested loops scores higher than an if at the top level with the same number of branches. This catches code that is technically not too complex but is genuinely difficult to reason about.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which programming languages are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The analyzer supports JavaScript, TypeScript, Python, Java, Go, C, and C++. Language detection is automatic — file extension is used when uploading a file, and code heuristics are used when pasting code. You can always override the detected language manually.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my source code uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, never. All parsing and metric computation runs entirely inside your browser using JavaScript. Your source code, function names, and analysis results are never transmitted to any server, remote endpoint, or cloud service. The tool works completely offline after the initial page load.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do the risk levels Low, Medium, High, and Critical mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Risk levels are derived from both cyclomatic and cognitive scores using priority order. Critical means cyclomatic > 20 or cognitive > 24. High means cyclomatic > 10 or cognitive > 15. Medium means cyclomatic > 5 or cognitive > 7. Low means both scores are within safe bounds.',
      },
    },
    {
      '@type': 'Question',
      name: 'What refactor suggestions are generated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Suggestions are pattern-specific: extract deeply nested blocks into helper functions (nesting depth > 3), replace long if/else chains with a lookup table or strategy pattern (more than 4 branches at the same level), extract boolean expressions into named predicate functions (cognitive > 15 with multiple logical sequences), split large functions by responsibility (more than 50 lines), and add unit tests for high-path-count code (cyclomatic > 10).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I sort and export the analysis results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The results table can be sorted by Function Name, Cyclomatic score, Cognitive score, or Risk Level. Results can be exported as a JSON array via Copy JSON, or downloaded as a CSV file named complexity-report-YYYYMMDDTHHMMSS.csv for integration into code review workflows.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the analyzer handle nested functions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nested functions are detected and scored independently. Decision points belonging to an inner function are not counted toward the outer function\'s scores. Each function receives its own cyclomatic score, cognitive score, risk level, and suggestions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if my code has a syntax error?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The analyzer performs graceful partial analysis. If a syntax error prevents parsing beyond a certain point, results for all successfully parsed functions before the error are still returned and displayed. An inline warning message indicates that the analysis is partial.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is this different from linters like ESLint or tools like SonarQube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Linters enforce code style rules and flag specific patterns. SonarQube requires a build environment and server infrastructure. The C³ MindLoop Code Complexity Analyzer is a lightweight, instant, browser-based tool focused specifically on complexity metrics and refactor guidance — no installation, no configuration, no account, and no data leaving your device.',
      },
    },
  ],
};

const codeComplexityAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Code Complexity Analyzer',
  url: `${BASE_URL}/tools/code-complexity-analyzer`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free browser-based code complexity analyzer. Compute cyclomatic complexity and cognitive complexity per function for JavaScript, TypeScript, Python, Java, Go, C, and C++. Get actionable refactor suggestions. 100% client-side, zero server upload.',
  featureList: [
    'Cyclomatic complexity per function (base 1 + branching constructs)',
    'Cognitive complexity per function (nesting-depth-weighted scoring)',
    'Risk classification: Low, Medium, High, Critical',
    'Refactor suggestions targeted to detected complexity patterns',
    'Supports JavaScript, TypeScript, Python, Java, Go, C, and C++',
    'Auto language detection from file extension or code heuristics',
    'Sortable results table by name, cyclomatic, cognitive, or risk level',
    'Export results as JSON or CSV',
    '100% client-side — zero server upload, works offline',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const metadata: Metadata = {
  title: codeComplexityAnalyzer.title,
  description: codeComplexityAnalyzer.description,
  keywords: [...codeComplexityAnalyzer.keywords],
  alternates: { canonical: codeComplexityAnalyzer.canonical },
  openGraph: {
    ...codeComplexityAnalyzer.openGraph,
    title: codeComplexityAnalyzer.title,
    description: codeComplexityAnalyzer.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: codeComplexityAnalyzer.twitter.title,
    description: codeComplexityAnalyzer.twitter.description,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(codeComplexityAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(codeComplexityFaqSchema) }}
      />
      <CodeComplexityAnalyzerPage />
    </>
  );
}
