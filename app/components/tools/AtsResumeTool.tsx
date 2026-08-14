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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

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

// ─── Section Collapse Wrapper ─────────────────────────────────────────────────

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

// ─── Field Components ─────────────────────────────────────────────────────────

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

// ─── Preview ──────────────────────────────────────────────────────────────────

const ResumePreview: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { contact, summary, skills, experience, education, projects } = data;

  const fmtDate = (d: string) => {
    if (!d) return '';
    const [year, month] = d.split('-');
    if (!month) return year;
    return new Date(Number(year), Number(month) - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div
      id="ats-resume-preview"
      className="bg-white text-neutral-900 font-sans text-[13px] leading-[1.4] p-[36px] min-h-[900px] print:p-[36px] print:min-h-0"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: 1.4 }}
    >
      {/* Header */}
      <div className="text-center mb-4 border-b border-neutral-300 pb-4">
        <h1 className="text-[22px] font-bold uppercase tracking-wide text-neutral-900 m-0">{contact.name}</h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1.5 text-[12px] text-neutral-600">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <><span>·</span><span>{contact.phone}</span></>}
          {contact.location && <><span>·</span><span>{contact.location}</span></>}
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-0.5 text-[12px] text-neutral-600">
          {contact.linkedin && <span>{contact.linkedin}</span>}
          {contact.github && <><span>·</span><span>{contact.github}</span></>}
          {contact.portfolio && <><span>·</span><span>{contact.portfolio}</span></>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mb-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] border-b border-neutral-400 pb-0.5 mb-1.5 text-neutral-900">
            Summary
          </h2>
          <p className="text-[12.5px] text-neutral-800">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section className="mb-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] border-b border-neutral-400 pb-0.5 mb-1.5 text-neutral-900">
            Technical Skills
          </h2>
          {skills.split('\n').map((line, i) => (
            <p key={i} className="text-[12.5px] text-neutral-800 leading-[1.5]">
              {line}
            </p>
          ))}
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] border-b border-neutral-400 pb-0.5 mb-2 text-neutral-900">
            Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[13px] text-neutral-900">{exp.title}</span>
                <span className="text-[11.5px] text-neutral-600 font-mono shrink-0 ml-2">
                  {fmtDate(exp.start)} – {exp.current ? 'Present' : fmtDate(exp.end)}
                </span>
              </div>
              <div className="text-[12px] text-neutral-700 font-medium mb-1">{exp.company}</div>
              <ul className="list-disc ml-4 space-y-0.5">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="text-[12px] text-neutral-800">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] border-b border-neutral-400 pb-0.5 mb-2 text-neutral-900">
            Projects
          </h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-bold text-[12.5px] text-neutral-900">{proj.name}</span>
                {proj.tech && <span className="text-[11.5px] text-neutral-600">| {proj.tech}</span>}
                {proj.url && <span className="text-[11.5px] text-neutral-600 font-mono">{proj.url}</span>}
              </div>
              <ul className="list-disc ml-4 space-y-0.5 mt-0.5">
                {proj.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="text-[12px] text-neutral-800">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] border-b border-neutral-400 pb-0.5 mb-2 text-neutral-900">
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-baseline">
              <div>
                <span className="font-bold text-[12.5px] text-neutral-900">{edu.institution}</span>
                <span className="text-[12px] text-neutral-700 ml-2">
                  {edu.degree} {edu.field}
                  {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                </span>
              </div>
              <span className="text-[11.5px] text-neutral-600 font-mono shrink-0 ml-2">
                {edu.start}{edu.end ? ` – ${edu.end}` : ''}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

// ─── Main Tool ────────────────────────────────────────────────────────────────

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

  // ── Experience ─────────────────────────────────────────────────────────────
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

  // ── Education ──────────────────────────────────────────────────────────────
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

  // ── Projects ───────────────────────────────────────────────────────────────
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

  // ── Print / PDF Export ─────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Save Progress as JSON ─────────────────────────────────────────────────
  const saveJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Load Progress from JSON ───────────────────────────────────────────────
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
    <div ref={containerRef} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-0.5 bg-neutral-800 rounded-md p-0.5">
          <button
            id="ats-tab-edit"
            onClick={() => setActiveTab('edit')}
            title="Edit only — focus on the form"
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
            title="Split view — edit + live preview side by side"
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
            title="Preview only — see the final resume"
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
            Client-Side · No Upload
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
            <Download className="w-3.5 h-3.5" />
            Save JSON
          </button>

          <button
            id="ats-load-json-btn"
            onClick={() => loadInputRef.current?.click()}
            title="Restore progress from a saved resume-data.json"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 border border-neutral-700 rounded transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Load JSON
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
          <button
            id="ats-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-[#1D9BF0]/10 hover:bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30 rounded transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${
        activeTab === 'split' ? 'xl:grid-cols-[480px_1fr]' : ''
      }`}>

        {/* ── Edit Panel ─────────────────────────────────────────────────── */}
        <div className={`border-r border-neutral-800 overflow-y-auto max-h-[80vh] ats-edit-panel ${
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
              <TextArea id="summary" label="Professional Summary" value={data.summary} onChange={set('summary')} rows={4} placeholder="2–3 sentence professional summary..." />
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

        {/* ── Preview Panel ───────────────────────────────────────────────── */}
        <div className={`overflow-y-auto max-h-[80vh] bg-neutral-800 ats-preview-panel ${activeTab === 'edit' ? 'hidden' : ''}`}>
          <div className="p-4">
            <div className="shadow-2xl rounded overflow-hidden">
              <ResumePreview data={data} />
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
      <div id="ats-print-zone" aria-hidden="true">
        <ResumePreview data={data} />
      </div>

      {/* Print + screen + fullscreen styles */}
      <style>{`
        /* Keep print zone off-screen on all screen sizes */
        #ats-print-zone {
          position: absolute;
          left: -9999px;
          top: 0;
          width: 794px;
          background: white;
          pointer-events: none;
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

        @media print {
          /* Hide the entire page */
          body * { visibility: hidden !important; }

          /* Reveal only the print zone and its children */
          #ats-print-zone,
          #ats-print-zone * { visibility: visible !important; }

          /* Position it at the top-left of the printed page */
          #ats-print-zone {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }

          /* Remove page margins so the resume fills the sheet */
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
};
