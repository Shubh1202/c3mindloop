'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string[];
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  gpa: string;
}

interface ProjectEntry {
  id: string;
  name: string;
  tech: string;
  url: string;
  bullets: string[];
}

interface ResumeData {
  contact: ContactInfo;
  summary: string;
  skills: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const uid = () => Math.random().toString(36).slice(2, 9);

const cleanUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

const formatUrlHref = (url: string) => {
  if (!url) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
};

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

const defaultResume: ResumeData = {
  contact: {
    name: 'Your Name',
    email: 'you@email.com',
    phone: '+1 (555) 000-0000',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/yourprofile',
    github: 'github.com/yourhandle',
    portfolio: 'yourportfolio.dev',
  },
  summary:
    'Full-stack software engineer with 4+ years building scalable web applications. Experienced in React, Node.js, and cloud-native microservices. Strong focus on developer experience and shipping reliable software.',
  skills:
    'Languages: TypeScript, Python, Go, SQL\nFrameworks: React, Next.js, Node.js, FastAPI\nCloud & DevOps: AWS, Docker, Kubernetes, Terraform, CI/CD\nDatabases: PostgreSQL, Redis, MongoDB',
  experience: [
    {
      id: 'default-exp-1',
      company: 'Acme Corp',
      title: 'Senior Software Engineer',
      start: '2022-01',
      end: '',
      current: true,
      bullets: [
        'Architected a microservices migration cutting p99 latency by 40%',
        'Led a team of 4 engineers to deliver a real-time analytics dashboard used by 200k+ users',
        'Reduced CI build time by 60% by implementing incremental Docker layer caching',
      ],
    },
  ],
  education: [
    {
      id: 'default-edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      field: 'Computer Science',
      start: '2016',
      end: '2020',
      gpa: '3.8',
    },
  ],
  projects: [
    {
      id: 'default-proj-1',
      name: 'OpenMetrics Dashboard',
      tech: 'React, Go, InfluxDB',
      url: 'github.com/you/openmetrics',
      bullets: [
        'Built a real-time infrastructure metrics dashboard with sub-100ms update cycles',
        'Used WebSockets for live data streaming; achieved 95+ Lighthouse performance score',
      ],
    },
  ],
};

// Section Collapse Wrapper

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900 hover:bg-neutral-800/80 transition-colors"
        id={`section-toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <span className="text-neutral-400">{icon}</span>
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
      </button>
      {open && <div className="p-4 space-y-4 bg-neutral-950">{children}</div>}
    </div>
  );
};

// Field Components

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
}> = ({ label, value, onChange, placeholder, id }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0]/50 transition-colors font-mono"
    />
  </div>
);

const TextArea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  id: string;
  placeholder?: string;
}> = ({ label, value, onChange, rows = 3, id, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0]/50 transition-colors font-mono resize-y"
    />
  </div>
);

// Preview Component

const ResumePreview: React.FC<{ data: ResumeData; isPrint?: boolean }> = ({ data, isPrint = false }) => {
  const { contact, summary, skills, experience, education, projects } = data;

  const contactItems: React.ReactNode[] = [];
  if (contact.email) {
    contactItems.push(
      <a
        key="email"
        href={`mailto:${contact.email}`}
        className="text-neutral-800 hover:text-black no-underline"
      >
        {contact.email}
      </a>
    );
  }
  if (contact.phone) {
    contactItems.push(
      <a
        key="phone"
        href={`tel:${contact.phone.replace(/[\s()-]/g, '')}`}
        className="text-neutral-800 hover:text-black no-underline"
      >
        {contact.phone}
      </a>
    );
  }
  if (contact.location) {
    contactItems.push(
      <span key="location" className="text-neutral-800">
        {contact.location}
      </span>
    );
  }

  const linkItems: React.ReactNode[] = [];
  if (contact.linkedin) {
    linkItems.push(
      <a
        key="linkedin"
        href={formatUrlHref(contact.linkedin)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-800 hover:text-black no-underline"
      >
        {cleanUrl(contact.linkedin)}
      </a>
    );
  }
  if (contact.github) {
    linkItems.push(
      <a
        key="github"
        href={formatUrlHref(contact.github)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-800 hover:text-black no-underline"
      >
        {cleanUrl(contact.github)}
      </a>
    );
  }
  if (contact.portfolio) {
    linkItems.push(
      <a
        key="portfolio"
        href={formatUrlHref(contact.portfolio)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-800 hover:text-black no-underline"
      >
        {cleanUrl(contact.portfolio)}
      </a>
    );
  }

  const renderSeparated = (items: React.ReactNode[]) =>
    items.map((item, idx) => (
      <React.Fragment key={idx}>
        {idx > 0 && <span className="text-neutral-400 select-none">{" • "}</span>}
        {item}
      </React.Fragment>
    ));

  return (
    <div
      className={`bg-white text-neutral-900 font-sans ${
        isPrint
          ? 'w-full p-0 m-0 min-h-0'
          : 'p-8 sm:p-10 min-h-[900px] w-full max-w-[794px] mx-auto'
      }`}
      style={{
        fontFamily: 'Arial, Helvetica, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.35,
        color: '#111111',
      }}
    >
      {/* Header */}
      <header className="ats-resume-header text-center mb-3 pb-2.5 border-b border-neutral-400">
        <h1 className="text-[20px] sm:text-[22px] font-bold uppercase tracking-wider text-black m-0 leading-tight">
          {contact.name || 'Your Name'}
        </h1>
        {contactItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 mt-1.5 text-[11.5px] text-neutral-800">
            {renderSeparated(contactItems)}
          </div>
        )}
        {linkItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11.5px] text-neutral-800">
            {renderSeparated(linkItems)}
          </div>
        )}
      </header>

      {/* Summary */}
      {summary && summary.trim() && (
        <section className="ats-section mb-3">
          <h2 className="ats-section-title text-[12px] font-bold uppercase tracking-[0.08em] border-b border-neutral-900 pb-0.5 mb-1 text-black leading-normal">
            Summary
          </h2>
          <p className="text-[11.5px] text-neutral-800 leading-[1.4] text-justify">
            {summary}
          </p>
        </section>
      )}

      {/* Technical Skills */}
      {skills && skills.trim() && (
        <section className="ats-section mb-3">
          <h2 className="ats-section-title text-[12px] font-bold uppercase tracking-[0.08em] border-b border-neutral-900 pb-0.5 mb-1 text-black leading-normal">
            Technical Skills
          </h2>
          <div className="space-y-0.5">
            {skills.split('\n').filter(Boolean).map((line, i) => {
              const colonIdx = line.indexOf(':');
              if (colonIdx > 0) {
                const category = line.slice(0, colonIdx + 1);
                const list = line.slice(colonIdx + 1);
                return (
                  <p key={i} className="text-[11.5px] text-neutral-800 leading-[1.4]">
                    <strong className="font-semibold text-black">{category}</strong>
                    {list}
                  </p>
                );
              }
              return (
                <p key={i} className="text-[11.5px] text-neutral-800 leading-[1.4]">
                  {line}
                </p>
              );
            })}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.filter((e) => e.company || e.title || e.bullets.some(Boolean)).length > 0 && (
        <section className="ats-section mb-3">
          <h2 className="ats-section-title text-[12px] font-bold uppercase tracking-[0.08em] border-b border-neutral-900 pb-0.5 mb-1.5 text-black leading-normal">
            Experience
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => {
              const hasContent = exp.company || exp.title || exp.bullets.some(Boolean);
              if (!hasContent) return null;
              const validBullets = exp.bullets.filter((b) => b && b.trim().length > 0);
              const dateStr = [
                fmtDate(exp.start),
                exp.current ? 'Present' : fmtDate(exp.end),
              ].filter(Boolean).join(' – ');

              return (
                <div key={exp.id} className="ats-entry">
                  <div className="flex justify-between items-baseline gap-2 leading-tight">
                    <span className="font-bold text-[12.5px] text-black">
                      {exp.title}
                    </span>
                    {dateStr && (
                      <span className="text-[11px] text-neutral-700 font-mono shrink-0">
                        {dateStr}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <div className="text-[11.5px] text-neutral-800 font-medium leading-tight mt-0.5">
                      {exp.company}
                    </div>
                  )}
                  {validBullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-0.5 mt-1">
                      {validBullets.map((b, i) => (
                        <li key={i} className="ats-bullet text-[11.5px] leading-[1.38] text-neutral-800">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.filter((p) => p.name || p.bullets.some(Boolean)).length > 0 && (
        <section className="ats-section mb-3">
          <h2 className="ats-section-title text-[12px] font-bold uppercase tracking-[0.08em] border-b border-neutral-900 pb-0.5 mb-1.5 text-black leading-normal">
            Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => {
              const hasContent = proj.name || proj.tech || proj.bullets.some(Boolean);
              if (!hasContent) return null;
              const validBullets = proj.bullets.filter((b) => b && b.trim().length > 0);

              return (
                <div key={proj.id} className="ats-entry">
                  <div className="flex justify-between items-baseline gap-2 leading-tight">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      {proj.name && (
                        <span className="font-bold text-[12px] text-black">
                          {proj.name}
                        </span>
                      )}
                      {proj.tech && (
                        <span className="text-[11px] text-neutral-600">
                          — <span className="italic">{proj.tech}</span>
                        </span>
                      )}
                    </div>
                    {proj.url && (
                      <a
                        href={formatUrlHref(proj.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-neutral-700 font-mono no-underline hover:underline hover:text-black shrink-0"
                      >
                        {cleanUrl(proj.url)}
                      </a>
                    )}
                  </div>
                  {validBullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-0.5 mt-1">
                      {validBullets.map((b, i) => (
                        <li key={i} className="ats-bullet text-[11.5px] leading-[1.38] text-neutral-800">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Education */}
      {education.filter((e) => e.institution || e.degree || e.field).length > 0 && (
        <section className="ats-section mb-3">
          <h2 className="ats-section-title text-[12px] font-bold uppercase tracking-[0.08em] border-b border-neutral-900 pb-0.5 mb-1.5 text-black leading-normal">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu) => {
              const hasContent = edu.institution || edu.degree || edu.field;
              if (!hasContent) return null;
              const dateStr = [edu.start, edu.end].filter(Boolean).join(' – ');
              const degreeField = [edu.degree, edu.field].filter(Boolean).join(' in ');

              return (
                <div key={edu.id} className="ats-entry flex justify-between items-baseline gap-2 leading-tight">
                  <div>
                    <span className="font-bold text-[12px] text-black">
                      {edu.institution}
                    </span>
                    {degreeField && (
                      <span className="text-[11.5px] text-neutral-800 ml-2 font-medium">
                        • {degreeField}
                      </span>
                    )}
                    {edu.gpa && (
                      <span className="text-[11px] text-neutral-600 ml-2">
                        (GPA: {edu.gpa})
                      </span>
                    )}
                  </div>
                  {dateStr && (
                    <span className="text-[11px] text-neutral-700 font-mono shrink-0">
                      {dateStr}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

// â”€â”€â”€ Main Tool â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const AtsResumeTool: React.FC = () => {
  const [data, setData] = useState<ResumeData>(defaultResume);
  const [activeTab, setActiveTab] = useState<'edit' | 'split' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadInputRef = useRef<HTMLInputElement>(null);

  // Sync fullscreen state with browser Escape key / API events
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const set = useCallback(
    <K extends keyof ResumeData>(key: K) =>
      (val: ResumeData[K]) =>
        setData((d) => ({ ...d, [key]: val })),
    []
  );

  const setContact = (field: keyof ContactInfo) => (val: string) =>
    setData((d) => ({ ...d, contact: { ...d.contact, [field]: val } }));

  // â”€â”€ Experience â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addExp = () =>
    setData((d) => ({
      ...d,
      experience: [
        ...d.experience,
        { id: uid(), company: '', title: '', start: '', end: '', current: false, bullets: [''] },
      ],
    }));

  const removeExp = (id: string) =>
    setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));

  const setExp = (id: string, field: keyof ExperienceEntry, val: unknown) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    }));

  const setExpBullet = (id: string, idx: number, val: string) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) =>
        e.id === id ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? val : b)) } : e
      ),
    }));

  const addExpBullet = (id: string) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, bullets: [...e.bullets, ''] } : e)),
    }));

  const removeExpBullet = (id: string, idx: number) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) =>
        e.id === id ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
      ),
    }));

  // â”€â”€ Education â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addEdu = () =>
    setData((d) => ({
      ...d,
      education: [
        ...d.education,
        { id: uid(), institution: '', degree: '', field: '', start: '', end: '', gpa: '' },
      ],
    }));

  const removeEdu = (id: string) =>
    setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));

  const setEdu = (id: string, field: keyof EducationEntry, val: string) =>
    setData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    }));

  // â”€â”€ Projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addProj = () =>
    setData((d) => ({
      ...d,
      projects: [...d.projects, { id: uid(), name: '', tech: '', url: '', bullets: [''] }],
    }));

  const removeProj = (id: string) =>
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));

  const setProj = (id: string, field: keyof ProjectEntry, val: unknown) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    }));

  const setProjBullet = (id: string, idx: number, val: string) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === id ? { ...p, bullets: p.bullets.map((b, i) => (i === idx ? val : b)) } : p
      ),
    }));

  const addProjBullet = (id: string) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, bullets: [...p.bullets, ''] } : p)),
    }));

  const removeProjBullet = (id: string, idx: number) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === id ? { ...p, bullets: p.bullets.filter((_, i) => i !== idx) } : p
      ),
    }));

  // Print / PDF Export
  const handlePrint = () => {
    const htmlEl = document.documentElement;
    const wasDark = htmlEl.classList.contains('dark');

    // Force light mode so browser print preview draws pure white margins
    if (wasDark) {
      htmlEl.classList.remove('dark');
      htmlEl.classList.add('light');
    }

    window.print();

    if (wasDark) {
      const restoreDark = () => {
        htmlEl.classList.remove('light');
        htmlEl.classList.add('dark');
        window.removeEventListener('afterprint', restoreDark);
      };
      window.addEventListener('afterprint', restoreDark, { once: true });
      setTimeout(restoreDark, 2000);
    }
  };

  // â”€â”€ Save Progress as JSON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const saveJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // â”€â”€ Load Progress from JSON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string) as ResumeData;
        // Basic shape check before applying
        if (parsed && parsed.contact && Array.isArray(parsed.experience)) {
          setData(parsed);
        }
      } catch {
        // Silently ignore malformed files
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-loaded if needed
    e.target.value = '';
  };

  return (
    <div ref={containerRef} className="developer-tool-container border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 no-print ats-screen-ui">
        <div className="flex items-center gap-0.5 bg-neutral-800 rounded-md p-0.5">
          <button
            id="ats-tab-edit"
            onClick={() => setActiveTab('edit')}
            title="Edit only - focus on the form"
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              activeTab === 'edit'
                ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Edit
          </button>
          <button
            id="ats-tab-split"
            onClick={() => setActiveTab('split')}
            title="Split view - edit + live preview side by side"
            className={`hidden xl:flex px-3 py-1.5 text-xs font-mono rounded transition-colors items-center gap-1.5 ${
              activeTab === 'split'
                ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Split
          </button>
          <button
            id="ats-tab-preview"
            onClick={() => setActiveTab('preview')}
            title="Preview only - see the final resume"
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              activeTab === 'preview'
                ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
            Client-Side {" • "} No Upload
          </span>

          {/* Hidden file input for JSON restore */}
          <input
            ref={loadInputRef}
            id="ats-load-json-input"
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={loadJson}
          />

          <button
            id="ats-save-json-btn"
            onClick={saveJson}
            title="Save progress as resume-data.json"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 border border-neutral-700 rounded transition-colors"
          >
            {/* <Download className="w-3.5 h-3.5" /> */}
            Save JSON
          </button>

          <button
            id="ats-load-json-btn"
            onClick={() => loadInputRef.current?.click()}
            title="Restore progress from a saved resume-data.json"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 border border-neutral-700 rounded transition-colors"
          >
            {/* <Upload className="w-3.5 h-3.5" /> */}
            Load JSON
          </button>

          <button
            id="ats-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-[#1D9BF0]/10 hover:bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30 rounded transition-colors"
          >
            {/* <Printer className="w-3.5 h-3.5" /> */}
            Export PDF
          </button>
          <button
            id="ats-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="flex items-center justify-center w-7 h-7 text-neutral-500 hover:text-neutral-200 border border-neutral-700 hover:border-neutral-500 rounded transition-colors"
          >
            {isFullscreen
              ? <Minimize2 className="w-3.5 h-3.5" />
              : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 no-print ats-screen-ui ${
        activeTab === 'split' ? 'xl:grid-cols-[480px_1fr]' : ''
      }`}>

        {/* â”€â”€ Edit Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className={`border-r border-neutral-800 overflow-y-auto max-h-[120vh] ats-edit-panel ${
          activeTab === 'preview' ? 'hidden' : ''
        }`}>
          <div className="p-4 space-y-3">

            {/* Contact */}
            <Section icon={<User className="w-4 h-4" />} title="Contact Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="contact-name" label="Full Name" value={data.contact.name} onChange={setContact('name')} />
                <Field id="contact-email" label="Email" value={data.contact.email} onChange={setContact('email')} />
                <Field id="contact-phone" label="Phone" value={data.contact.phone} onChange={setContact('phone')} />
                <Field id="contact-location" label="Location" value={data.contact.location} onChange={setContact('location')} />
                <Field id="contact-linkedin" label="LinkedIn" value={data.contact.linkedin} onChange={setContact('linkedin')} placeholder="linkedin.com/in/..." />
                <Field id="contact-github" label="GitHub" value={data.contact.github} onChange={setContact('github')} placeholder="github.com/..." />
                <Field id="contact-portfolio" label="Portfolio" value={data.contact.portfolio} onChange={setContact('portfolio')} placeholder="yoursite.dev" />
              </div>
            </Section>

            {/* Summary */}
            <Section icon={<User className="w-4 h-4" />} title="Summary">
              <TextArea id="summary" label="Professional Summary" value={data.summary} onChange={set('summary')} rows={4} placeholder="2-3 sentence professional summary..." />
            </Section>

            {/* Skills */}
            <Section icon={<Code2 className="w-4 h-4" />} title="Technical Skills">
              <TextArea
                id="skills"
                label="Skills (one category per line)"
                value={data.skills}
                onChange={set('skills')}
                rows={5}
                placeholder={"Languages: TypeScript, Python\nFrameworks: React, Node.js"}
              />
            </Section>

            {/* Experience */}
            <Section icon={<Briefcase className="w-4 h-4" />} title="Experience">
              {data.experience.map((exp, ei) => (
                <div key={exp.id} className="border border-neutral-800 rounded-lg p-3 space-y-3 relative">
                  <button
                    id={`remove-exp-${exp.id}`}
                    onClick={() => removeExp(exp.id)}
                    className="absolute top-2 right-2 text-neutral-600 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field id={`exp-title-${exp.id}`} label="Job Title" value={exp.title} onChange={(v) => setExp(exp.id, 'title', v)} />
                    <Field id={`exp-company-${exp.id}`} label="Company" value={exp.company} onChange={(v) => setExp(exp.id, 'company', v)} />
                    <Field id={`exp-start-${exp.id}`} label="Start (YYYY-MM)" value={exp.start} onChange={(v) => setExp(exp.id, 'start', v)} placeholder="2022-01" />
                    {!exp.current && (
                      <Field id={`exp-end-${exp.id}`} label="End (YYYY-MM)" value={exp.end} onChange={(v) => setExp(exp.id, 'end', v)} placeholder="2024-06" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-xs font-mono text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      id={`exp-current-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => setExp(exp.id, 'current', e.target.checked)}
                      className="rounded"
                    />
                    Currently working here
                  </label>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">Bullets</span>
                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2 items-start">
                        <input
                          id={`exp-bullet-${exp.id}-${bi}`}
                          type="text"
                          value={b}
                          onChange={(e) => setExpBullet(exp.id, bi, e.target.value)}
                          placeholder="Describe a measurable achievement..."
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0]/50 transition-colors font-mono"
                        />
                        <button
                          id={`remove-exp-bullet-${exp.id}-${bi}`}
                          onClick={() => removeExpBullet(exp.id, bi)}
                          className="mt-1 text-neutral-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      id={`add-exp-bullet-${exp.id}`}
                      onClick={() => addExpBullet(exp.id)}
                      className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-[#1D9BF0] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                id="add-experience-btn"
                onClick={addExp}
                className="flex items-center gap-2 text-xs font-mono px-3 py-2 text-neutral-400 hover:text-[#1D9BF0] border border-dashed border-neutral-700 hover:border-[#1D9BF0]/40 rounded-lg w-full justify-center transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </Section>

            {/* Projects */}
            <Section icon={<FolderGit2 className="w-4 h-4" />} title="Projects">
              {data.projects.map((proj) => (
                <div key={proj.id} className="border border-neutral-800 rounded-lg p-3 space-y-3 relative">
                  <button
                    id={`remove-proj-${proj.id}`}
                    onClick={() => removeProj(proj.id)}
                    className="absolute top-2 right-2 text-neutral-600 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field id={`proj-name-${proj.id}`} label="Project Name" value={proj.name} onChange={(v) => setProj(proj.id, 'name', v)} />
                    <Field id={`proj-tech-${proj.id}`} label="Tech Stack" value={proj.tech} onChange={(v) => setProj(proj.id, 'tech', v)} placeholder="React, Go, Postgres" />
                    <Field id={`proj-url-${proj.id}`} label="URL / Repo" value={proj.url} onChange={(v) => setProj(proj.id, 'url', v)} placeholder="github.com/you/project" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">Bullets</span>
                    {proj.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2 items-start">
                        <input
                          id={`proj-bullet-${proj.id}-${bi}`}
                          type="text"
                          value={b}
                          onChange={(e) => setProjBullet(proj.id, bi, e.target.value)}
                          placeholder="What did you build or achieve?"
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0]/50 transition-colors font-mono"
                        />
                        <button
                          id={`remove-proj-bullet-${proj.id}-${bi}`}
                          onClick={() => removeProjBullet(proj.id, bi)}
                          className="mt-1 text-neutral-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      id={`add-proj-bullet-${proj.id}`}
                      onClick={() => addProjBullet(proj.id)}
                      className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-[#1D9BF0] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                id="add-project-btn"
                onClick={addProj}
                className="flex items-center gap-2 text-xs font-mono px-3 py-2 text-neutral-400 hover:text-[#1D9BF0] border border-dashed border-neutral-700 hover:border-[#1D9BF0]/40 rounded-lg w-full justify-center transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </Section>

            {/* Education */}
            <Section icon={<GraduationCap className="w-4 h-4" />} title="Education">
              {data.education.map((edu) => (
                <div key={edu.id} className="border border-neutral-800 rounded-lg p-3 space-y-2 relative">
                  <button
                    id={`remove-edu-${edu.id}`}
                    onClick={() => removeEdu(edu.id)}
                    className="absolute top-2 right-2 text-neutral-600 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field id={`edu-inst-${edu.id}`} label="Institution" value={edu.institution} onChange={(v) => setEdu(edu.id, 'institution', v)} />
                    <Field id={`edu-degree-${edu.id}`} label="Degree (e.g. B.S.)" value={edu.degree} onChange={(v) => setEdu(edu.id, 'degree', v)} />
                    <Field id={`edu-field-${edu.id}`} label="Field of Study" value={edu.field} onChange={(v) => setEdu(edu.id, 'field', v)} />
                    <Field id={`edu-gpa-${edu.id}`} label="GPA (optional)" value={edu.gpa} onChange={(v) => setEdu(edu.id, 'gpa', v)} />
                    <Field id={`edu-start-${edu.id}`} label="Start Year" value={edu.start} onChange={(v) => setEdu(edu.id, 'start', v)} placeholder="2016" />
                    <Field id={`edu-end-${edu.id}`} label="End Year" value={edu.end} onChange={(v) => setEdu(edu.id, 'end', v)} placeholder="2020" />
                  </div>
                </div>
              ))}
              <button
                id="add-education-btn"
                onClick={addEdu}
                className="flex items-center gap-2 text-xs font-mono px-3 py-2 text-neutral-400 hover:text-[#1D9BF0] border border-dashed border-neutral-700 hover:border-[#1D9BF0]/40 rounded-lg w-full justify-center transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </Section>
          </div>
        </div>

        {/* â”€â”€ Preview Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className={`overflow-y-auto max-h-[120vh] bg-neutral-800 p-4 ats-preview-panel ${activeTab === 'edit' ? 'hidden' : ''}`}>
          <div className="flex justify-center">
            <div className="shadow-2xl rounded overflow-hidden w-full max-w-[794px]">
              <ResumePreview data={data} isPrint={false} />
            </div>
          </div>
        </div>
      </div>

      {/*
        Always-rendered off-screen print zone.
        Lives outside the tab-switching divs so it is always in the DOM
        regardless of which tab is active. Hidden on screen via CSS,
        made the only visible element during print.
      */}
      <div id="ats-resume-print-root" aria-hidden="true">
        <ResumePreview data={data} isPrint={true} />
      </div>

      {/* Print + screen + fullscreen styles */}
      <style>{`
        /* Screen: hide print-only container */
        #ats-resume-print-root {
          display: none;
        }

        /* Fullscreen layout overrides */
        :fullscreen .ats-edit-panel,
        :-webkit-full-screen .ats-edit-panel {
          max-height: calc(100vh - 48px) !important;
        }

        :fullscreen .ats-preview-panel,
        :-webkit-full-screen .ats-preview-panel {
          max-height: calc(100vh - 48px) !important;
        }

        /* Fullscreen: fill entire viewport */
        :fullscreen,
        :-webkit-full-screen {
          background: #0a0a0a;
          overflow: auto;
        }

        /* Print Stylesheet */
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }

        @media print {
          *,
          *::before,
          *::after {
            color-scheme: light !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            text-shadow: none !important;
            filter: none !important;
          }

          /* Hide all non-printable website elements */
          nav,
          header:not(.ats-resume-header),
          footer,
          aside,
          .no-print,
          [data-no-print],
          .ats-screen-ui {
            display: none !important;
            visibility: hidden !important;
          }

          /* Force document root and body to clean printable canvas */
          :root,
          html,
          html.dark,
          html.light,
          body {
            color-scheme: light !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }

          /* Reset all parent containers to avoid scrolling / pagination bugs */
          body > div,
          #main-content,
          .developer-tool-container,
          main,
          div {
            background: #ffffff !important;
            background-color: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-height: none !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          .developer-tool-container {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Screen UI hidden during print */
          .ats-edit-panel,
          .ats-preview-panel,
          .ats-screen-ui {
            display: none !important;
          }

          /* Print root becomes visible in normal block document flow */
          #ats-resume-print-root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
          }

          /* Page break controls */
          .ats-resume-header {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .ats-section {
            break-inside: auto !important;
            page-break-inside: auto !important;
            margin-bottom: 10px !important;
          }

          .ats-section-title {
            break-after: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .ats-entry {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .ats-bullet {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          p, li {
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
    </div>
  );
};
