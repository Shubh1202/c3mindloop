import { MetadataRoute } from 'next';
import { BASE_URL } from './config/seo.config';
import { getPublishedGuides } from './lib/constants';

// Use static dates per page — dynamic new Date() tells Google every page
// changed today, every single day, which erodes crawl budget trust over time.
const TODAY = '2026-10-06';
const TOOL_DATE = '2026-10-05';

export default function sitemap(): MetadataRoute.Sitemap {
  const publishedGuides = getPublishedGuides('en').map((guide) => ({
    url: `${BASE_URL}/guides/${guide.slug}`,
    lastModified: guide.updatedAt || guide.publishedAt || TOOL_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    // ── Core pages ──────────────────────────────────────────────────────────
    { url: `${BASE_URL}`,       lastModified: TODAY,     changeFrequency: 'daily',  priority: 1.0  },
    { url: `${BASE_URL}/tools`, lastModified: TODAY,     changeFrequency: 'daily',  priority: 0.95 },

    // ── Tool pages ───────────────────────────────────────────────────────────
    { url: `${BASE_URL}/tools/json-formatter`,              lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/office-editor`,               lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/jwt-inspector`,               lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/regex-tester`,                lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/base64-encoder`,              lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/hash-generator`,              lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/sql-to-json`,                 lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/cron-visualizer`,             lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/curl-converter`,              lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/ats-resume-generator`,        lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/diff-checker`,                lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/ai-prompt-builder`,           lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/pdf-suite`,                   lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/edit-pdf`,                    lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/json-graph`,                  lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/password-shuffle-generator`,  lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/code-complexity-analyzer`,    lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/pipeline`,                    lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/node-event-loop-visualizer`,  lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/js-event-loop-visualizer`,    lastModified: TODAY,     changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/git-visualizer`,              lastModified: TODAY,     changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/qr-code-generator`,           lastModified: TODAY,     changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/regex-railroad-generator`,    lastModified: TODAY,     changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/tools/workflow-builder`,            lastModified: TODAY,     changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/compiler`,                         lastModified: TODAY,     changeFrequency: 'weekly', priority: 0.95 },

    // ── Content pages ────────────────────────────────────────────────────────
    { url: `${BASE_URL}/guides`,         lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE_URL}/es/guides`,      lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.7  },
    { url: `${BASE_URL}/de/guides`,      lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.7  },
    { url: `${BASE_URL}/ja/guides`,      lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.7  },
    ...publishedGuides,
    { url: `${BASE_URL}/about`,          lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.7  },
    { url: `${BASE_URL}/projects`,       lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.7  },
    { url: `${BASE_URL}/services`,       lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.65 },
    { url: `${BASE_URL}/community`,      lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.65 },
    { url: `${BASE_URL}/reviews`,        lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.65 },
    { url: `${BASE_URL}/contact`,        lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.6  },
    { url: `${BASE_URL}/careers`,        lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.6  },
    { url: `${BASE_URL}/privacy-policy`, lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.4  },
    { url: `${BASE_URL}/terms`,          lastModified: TOOL_DATE, changeFrequency: 'weekly', priority: 0.4  },
  ];
}
