import type { Metadata } from 'next';
import { JsonGraphPage } from '@/app/views/JsonGraphPage';
import { seoConfig, BASE_URL } from './../../config/seo.config';

const { jsonGraphVisualizer } = seoConfig;

const jsonGraphAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JSON Graph Visualizer',
  url: `${BASE_URL}/tools/json-graph`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Interactive JSON graph visualizer. Pan, zoom, expand/collapse nodes, switch to tree view, and export as PNG. 100% client-side, zero server upload.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Interactive node-graph visualization from JSON input',
    'Hierarchical left-to-right automatic layout',
    'Pan and zoom with mouse wheel, drag, and touch pinch',
    'Click to expand or collapse nodes',
    'Tree view mode for indented JSON exploration',
    'Export full graph as PNG',
    'Viewport culling for large graph performance',
    '100% client-side processing- zero data transmission',
    'No login required',
  ],
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

const jsonGraphFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a JSON Graph Visualizer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A JSON Graph Visualizer converts a JSON document into an interactive node graph where each object and array is represented as a visual node connected to its children by directed edges. This makes it easy to understand the shape, depth, and relationships within a JSON structure without reading raw text.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my JSON data uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All processing- JSON parsing, graph construction, layout computation, and PNG export- runs entirely inside your browser using client-side JavaScript. Nothing is transmitted to any server. You can safely visualize API keys, database schemas, authentication payloads, or any other sensitive JSON.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is the JSON Graph Visualizer different from a JSON Tree View?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A tree view displays JSON as collapsible indented text. The graph view renders each object and array as a spatially positioned node on a zoomable canvas so you can see the full hierarchy at once. The C³ MindLoop tool offers both views- switch between Graph and Tree using the toggle at the top.',
      },
    },
    {
      '@type': 'Question',
      name: 'How large a JSON file can I visualize?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool shows a performance warning for payloads with more than 500 keys and skips graph construction for payloads exceeding 2000 keys. Within those limits, the graph renders the first 200 nodes in breadth-first order. For very large payloads, the Tree View mode is more efficient.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I export the graph as an image?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Click the Export as PNG button in the toolbar at the bottom-left of the canvas. The tool captures the entire graph- all nodes and edges- and triggers a browser download of json-graph.png with the dark background preserved.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: jsonGraphVisualizer.title,
  description: jsonGraphVisualizer.description,
  keywords: [...jsonGraphVisualizer.keywords],
  alternates: { canonical: jsonGraphVisualizer.canonical },
  openGraph: {
    ...jsonGraphVisualizer.openGraph,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    ...jsonGraphVisualizer.twitter,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonGraphAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonGraphFaqSchema) }}
      />
      <JsonGraphPage />
    </>
  );
}
