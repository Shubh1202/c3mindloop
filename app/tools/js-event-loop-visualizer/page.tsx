import type { Metadata } from 'next';
import { JsEventLoopVisualizerPage } from '../../views/JsEventLoopVisualizerPage';
import { seoConfig, jsEventLoopVisualizerSchema } from '../../config/seo.config';

const { jsEventLoopVisualizer } = seoConfig;

export const metadata: Metadata = {
  title: jsEventLoopVisualizer.title,
  description: jsEventLoopVisualizer.description,
  keywords: [...jsEventLoopVisualizer.keywords],
  alternates: { canonical: jsEventLoopVisualizer.canonical },
  openGraph: jsEventLoopVisualizer.openGraph,
  twitter: { card: 'summary_large_image', ...jsEventLoopVisualizer.twitter },
};

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the JavaScript Event Loop work in web browsers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The JavaScript Event Loop coordinates execution across a single-threaded runtime using 4 continuous stages: 1. Evaluate Script (synchronous Call Stack execution), 2. Run a Task (processes one callback from the Task Queue like setTimeout), 3. Run all Microtasks (flushes Promise.then and queueMicrotask callbacks until completely empty), and 4. Rerender (executes requestAnimationFrame callbacks and browser layout/paint calculations).'
      }
    },
    {
      '@type': 'Question',
      name: 'Why do Promise microtasks execute before setTimeout(fn, 0) macrotasks?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Promise resolution handlers (and queueMicrotask) enter the Microtask Queue, while setTimeout registers callbacks into the Task Queue (Macrotasks). Per the W3C/HTML5 Event Loop specification, the runtime completely drains the entire Microtask Queue immediately after synchronous code finishes and after every individual macrotask, before the next macrotask is allowed to run.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the difference between the Task Queue (Macrotasks) and Microtask Queue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Task Queue holds callbacks from timers (setTimeout, setInterval), DOM events, and I/O operations. The Event Loop processes only one Task Queue item per loop iteration. In contrast, the Microtask Queue holds high-priority Promise and queueMicrotask callbacks, and the engine drains every single item in the Microtask Queue before moving forward.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is Microtask Starvation and how does it happen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Microtask Starvation occurs when microtasks continuously schedule additional microtasks recursively (e.g. infinite Promise.then or queueMicrotask loops). Because the Event Loop will not proceed to the Task Queue or Rerender phase until the Microtask Queue is completely empty, the browser UI freezes and macrotasks (like timers and user clicks) never execute.'
      }
    },
    {
      '@type': 'Question',
      name: 'When does requestAnimationFrame execute relative to the Event Loop?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'requestAnimationFrame callbacks run during the Rerender phase of the browser Event Loop, right before layout recalculations and pixel painting, ensuring smooth 60fps/120fps visual updates synchronized with the display monitor refresh rate.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is this JavaScript Event Loop visualizer secure and private for sensitive code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, 100%. All AST parsing and Event Loop simulation executes strictly client-side inside your browser via local JavaScript. No code, scripts, or debug data are ever transmitted to external servers.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsEventLoopVisualizerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <JsEventLoopVisualizerPage />
    </>
  );
}
