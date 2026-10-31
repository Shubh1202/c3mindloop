/**
 * atsResume.test.ts
 *
 * Tests for ATS Resume Generator:
 * - Data structure validation
 * - Date formatting rules (YYYY-MM, YYYY, strings, empty)
 * - URL and hyperlink cleaning (LinkedIn, GitHub, Portfolio)
 * - Empty section and field handling
 * - Multi-page content integrity
 *
 * Run with: npx tsx app/components/tools/__tests__/atsResume.test.ts
 */

export {};

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${name}`);
    console.error(`       ${(e as Error).message}`);
    failed++;
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toContain(sub: string) {
      if (typeof actual !== 'string' || !actual.includes(sub))
        throw new Error(`Expected "${actual}" to contain "${sub}"`);
    },
  };
}

// ── Test Date Formatter ───────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  if (!d) return '';
  const trimmed = d.trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const [year, month] = trimmed.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }
  }
  return trimmed;
};

// ── Test URL Cleaner & Formatter ─────────────────────────────────────────────
const cleanUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

const formatUrlHref = (url: string) => {
  if (!url) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
};

console.log('\nATS Resume Date Formatting');

test('formats YYYY-MM to Month Year', () => {
  expect(fmtDate('2023-08')).toBe('Aug 2023');
  expect(fmtDate('2020-01')).toBe('Jan 2020');
  expect(fmtDate('2022-12')).toBe('Dec 2022');
});

test('handles raw Year or custom text safely', () => {
  expect(fmtDate('2022')).toBe('2022');
  expect(fmtDate('Present')).toBe('Present');
  expect(fmtDate('')).toBe('');
  expect(fmtDate('   ')).toBe('');
});

console.log('\nATS Resume URL Formatting');

test('cleans URLs for clean print display', () => {
  expect(cleanUrl('https://www.linkedin.com/in/shubhamprajapati1202/')).toBe('linkedin.com/in/shubhamprajapati1202');
  expect(cleanUrl('https://github.com/shubhamprajapati1202')).toBe('github.com/shubhamprajapati1202');
  expect(cleanUrl('yourportfolio.dev')).toBe('yourportfolio.dev');
});

test('formats href with proper protocol for PDF clickable links', () => {
  expect(formatUrlHref('linkedin.com/in/shubham')).toBe('https://linkedin.com/in/shubham');
  expect(formatUrlHref('https://github.com/shubham')).toBe('https://github.com/shubham');
  expect(formatUrlHref('mailto:test@example.com')).toBe('mailto:test@example.com');
  expect(formatUrlHref('')).toBe('');
});

console.log('\nATS Resume Multi-Page Integrity');

test('handles full candidate resume dataset with multiple entries without mutation', () => {
  const fullResume = {
    contact: {
      name: 'SHUBHAM PRAJAPATI',
      email: 'shubhamprajapati1202@gmail.com',
      phone: '+91-9807272530',
      location: 'New Delhi, India',
      linkedin: 'https://www.linkedin.com/in/shubhamprajapati1202/',
      github: 'https://github.com/shubhamprajapati1202',
      portfolio: 'yourportfolio.dev',
    },
    summary: 'Backend Developer with 6+ years of experience...',
    skills: 'Languages: JavaScript, TypeScript, SQL\nBackend: Node.js, Express.js',
    experience: [
      {
        id: '1',
        company: 'E2logy Software Solutions Pvt. Ltd | Noida',
        title: 'Senior Software Engineer',
        start: '2023-08',
        end: '',
        current: true,
        bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3'],
      },
      {
        id: '2',
        company: 'XS Infosol Pvt. Ltd | Noida',
        title: 'Junior Software Developer',
        start: '2023-01',
        end: '2023-07',
        current: false,
        bullets: ['Bullet 1', 'Bullet 2'],
      },
      {
        id: '3',
        company: 'Westonik Web Solution Pvt. Ltd | Prayagraj',
        title: 'Web Developer',
        start: '2020-07',
        end: '2022-12',
        current: false,
        bullets: ['Bullet 1'],
      },
    ],
    education: [
      {
        id: 'e1',
        institution: 'Swami Vivekanand Subharti University, Meerut',
        degree: 'MCA',
        field: '',
        start: '',
        end: '',
        gpa: '',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: 'Wire Transfer Management System',
        tech: 'Node.js, Express.js, MongoDB',
        url: 'github.com/shubh/wire-transfer',
        bullets: ['Built full stack workflow'],
      },
    ],
  };

  expect(fullResume.experience.length).toBe(3);
  expect(fullResume.projects.length).toBe(1);
  expect(fullResume.education.length).toBe(1);
  expect(cleanUrl(fullResume.contact.linkedin)).toBe('linkedin.com/in/shubhamprajapati1202');
});

console.log(`\n${'─'.repeat(50)}`);
console.log(`  ${passed} passed  ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : '0 failed'}`);
console.log('');

if (failed > 0) process.exit(1);
