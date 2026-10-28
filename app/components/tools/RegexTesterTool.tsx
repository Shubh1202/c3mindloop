'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { trackEvent, GA_EVENTS } from '../../lib/analytics';
import { Copy, Check, Trash2, ShieldCheck, AlertCircle, Info, BookOpen, Maximize2, Minimize2, FileText, Code } from 'lucide-react';
import { LocalAIPanel } from './LocalAIPanel';
import { useCollaborationRoom, useCollaborativeText } from '../../lib/collaboration';
import { CollabToolbarButton } from '../collaboration';

interface MatchGroup {
  index: number;
  match: string;
  groups: { value: string; start?: number; end?: number }[];
  namedGroups: Record<string, { value: string; start?: number; end?: number }>;
}

const PRESETS = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'gm', sample: 'test@example.com\ninvalid-email@\nuser.name+tag@domain.co.uk' },
  { name: 'URL / Domain', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'gi', sample: 'Visit https://www.c3mindloop.com/tools or http://localhost:3000' },
  { name: 'IPv4 / IPv6', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b|([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}', flags: 'gi', sample: 'IPv4: 192.168.1.1\nIPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334' },
  { name: 'Phone Numbers', pattern: '\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}', flags: 'g', sample: '+1 (555) 123-4567\n555-987-6543\n+44 20 7123 1234' },
  { name: 'Strong Password', pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$', flags: 'gm', sample: 'Password123! (Valid)\nweakpass (Invalid)\nNoSpecialChar123 (Invalid)' },
];

const SAMPLE_PATTERN = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
const SAMPLE_TEST_STRING = 'Contact hello@c3mindloop.com or support@example.org for developer inquiries.\nInvalid: notanemail, also-bad@, @nodomain.com';
const SAMPLE_FLAGS = { g: true, i: true, m: true, s: false, u: false, y: false };

interface RegexStep {
  token: string;
  desc: string;
}

function analyzeRegex(pattern: string) {
  let isCatastrophic = false;
  if (/(\([^)]*[*+?]\)[*+?])|(\([^)]*\|[^)]*\)[*+?])/.test(pattern)) {
    isCatastrophic = true;
  }

  const steps: RegexStep[] = [];
  let i = 0;
  while (i < pattern.length && steps.length < 15) {
    const c = pattern[i];
    if (c === '^') { steps.push({ token: '^', desc: 'Start of string/line' }); i++; }
    else if (c === '$') { steps.push({ token: '$', desc: 'End of string/line' }); i++; }
    else if (c === '\\') {
      const next = pattern[i+1];
      if (next === 'd') steps.push({ token: '\\d', desc: 'Digit [0-9]' });
      else if (next === 'w') steps.push({ token: '\\w', desc: 'Word char' });
      else if (next === 's') steps.push({ token: '\\s', desc: 'Whitespace' });
      else if (next === 'b') steps.push({ token: '\\b', desc: 'Word boundary' });
      else steps.push({ token: '\\' + next, desc: 'Escaped character' });
      i += 2;
    }
    else if (c === '[') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== ']') j++;
      steps.push({ token: pattern.slice(i, j + 1), desc: 'Character class' });
      i = j + 1;
    }
    else if (c === '(') {
      if (pattern.substring(i, i+3) === '(?:') {
        steps.push({ token: '(?:', desc: 'Non-capturing start' });
        i += 3;
      } else if (pattern.substring(i, i+3) === '(?<') {
        let j = i + 3;
        while(j < pattern.length && pattern[j] !== '>') j++;
        steps.push({ token: pattern.slice(i, j + 1), desc: 'Named group start' });
        i = j + 1;
      } else {
        steps.push({ token: '(', desc: 'Group start' });
        i++;
      }
    }
    else if (c === ')') { steps.push({ token: ')', desc: 'Group end' }); i++; }
    else if (c === '*') { steps.push({ token: '*', desc: '0 or more' }); i++; }
    else if (c === '+') { steps.push({ token: '+', desc: '1 or more' }); i++; }
    else if (c === '?') { steps.push({ token: '?', desc: '0 or 1' }); i++; }
    else if (c === '{') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== '}') j++;
      steps.push({ token: pattern.slice(i, j + 1), desc: 'Quantifier' });
      i = j + 1;
    }
    else {
      let j = i + 1;
      while (j < pattern.length && !'\\^$[]()*+?{}'.includes(pattern[j])) j++;
      steps.push({ token: pattern.slice(i, j), desc: 'Literal match' });
      i = j;
    }
  }
  if (i < pattern.length) {
    steps.push({ token: '...', desc: 'Complex/unsupported construct' });
  }

  return { isCatastrophic, steps };
}

export const RegexTesterTool: React.FC = () => {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState(SAMPLE_FLAGS);
  const [testString, setTestString] = useState(SAMPLE_TEST_STRING);

  // Real-Time WebRTC Peer-to-Peer Collaboration
  const collab = useCollaborationRoom({
    toolId: 'regex-tester',
    autoConnectFromUrl: true,
  });

  useCollaborativeText({
    ydoc: collab.ydoc,
    field: 'pattern',
    value: pattern,
    onChange: setPattern,
    enabled: collab.isCollaborating,
    isHost: collab.isHost,
  });

  useCollaborativeText({
    ydoc: collab.ydoc,
    field: 'testString',
    value: testString,
    onChange: setTestString,
    enabled: collab.isCollaborating,
    isHost: collab.isHost,
  });
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Exporter states
  const [rightViewMode, setRightViewMode] = useState<'matches' | 'code'>('matches');
  const [activeLang, setActiveLang] = useState<'js' | 'python' | 'go' | 'php'>('js');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
    const navbar = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  const activeFlagsStr = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, active]) => active)
      .map(([f]) => f)
      .join('');
  }, [flags]);

  const regexResult = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, count: 0, analysis: null };
    }
    try {
      const analysis = analyzeRegex(pattern);
      
      let execFlags = activeFlagsStr;
      let supportsIndices = false;
      try {
        new RegExp('', 'd');
        if (!execFlags.includes('d')) execFlags += 'd';
        supportsIndices = true;
      } catch (e) {}

      const rx = new RegExp(pattern, execFlags);
      const matches: MatchGroup[] = [];
      let match: RegExpExecArray | null;

      const extractGroups = (m: RegExpExecArray) => {
        const groups = [];
        for (let i = 1; i < m.length; i++) {
          const val = m[i];
          let start, end;
          if (supportsIndices && (m as any).indices && (m as any).indices[i]) {
            start = (m as any).indices[i][0];
            end = (m as any).indices[i][1];
          }
          groups.push({ value: val === undefined ? 'Unmatched optional group' : val, start, end });
        }
        const namedGroups: Record<string, any> = {};
        if (m.groups) {
           for (const key of Object.keys(m.groups)) {
              const val = m.groups[key];
              let start, end;
              if (supportsIndices && (m as any).indices && (m as any).indices.groups && (m as any).indices.groups[key]) {
                start = (m as any).indices.groups[key][0];
                end = (m as any).indices.groups[key][1];
              }
              namedGroups[key] = { value: val === undefined ? 'Unmatched optional group' : val, start, end };
           }
        }
        return { groups, namedGroups };
      };

      if (activeFlagsStr.includes('g')) {
        let maxSafety = 500;
        while ((match = rx.exec(testString)) !== null && maxSafety > 0) {
          maxSafety--;
          const extracted = extractGroups(match);
          matches.push({ index: match.index, match: match[0], groups: extracted.groups, namedGroups: extracted.namedGroups });
          if (match[0].length === 0) rx.lastIndex++;
        }
      } else {
        match = rx.exec(testString);
        if (match) {
          const extracted = extractGroups(match);
          matches.push({ index: match.index, match: match[0], groups: extracted.groups, namedGroups: extracted.namedGroups });
        }
      }
      return { matches, error: null, count: matches.length, analysis };
    } catch (err: any) {
      return { matches: [], error: err.message || 'Invalid Regular Expression syntax', count: 0, analysis: null };
    }
  }, [pattern, activeFlagsStr, testString]);

  const toggleFlag = (f: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  };

  const copyRegex = () => {
    const full = `/${pattern}/${activeFlagsStr}`;
    navigator.clipboard.writeText(full);
    trackEvent(GA_EVENTS.COPY_OUTPUT, { tool_name: 'regex_tester', type: 'regex_pattern' });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLoadSample = () => {
    setPattern(SAMPLE_PATTERN);
    setTestString(SAMPLE_TEST_STRING);
    setFlags(SAMPLE_FLAGS);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setPattern(preset.pattern);
    setTestString(preset.sample);
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
  };

  // Called by LocalAIPanel when the user hits "Apply Pattern to Tester"
  const handleApplyRegex = useCallback((newPattern: string, newFlags: string) => {
    setPattern(newPattern);
    // Reconstruct flags object from the flags string so the toggle UI stays in sync
    const validFlags = ['g', 'i', 'm', 's', 'u', 'y'] as const;
    setFlags((prev) => {
      const next = { ...prev };
      for (const f of validFlags) {
        next[f] = newFlags.includes(f);
      }
      return next;
    });
  }, []);

  // Code Snippet Builders
  const generatedCode = useMemo(() => {
    const cleanPattern = pattern || '.*';
    switch (activeLang) {
      case 'python':
        return `import re\n\npattern = re.compile(r'${cleanPattern.replace(/'/g, "\\'")}')\nmatches = pattern.findall(text)`;
      case 'go':
        return `package main\n\nimport (\n\t"fmt"\n\t"regexp"\n)\n\nfunc main() {\n\tre := regexp.MustCompile(\`${cleanPattern.replace(/`/g, "\\`").replace(/\\/g, "\\\\")}\`)\n\tfmt.Println(re.MatchString(text))\n}`;
      case 'php':
        return `<?php\n\n$pattern = '/${cleanPattern.replace(/\//g, "\\/")}/${activeFlagsStr}';\npreg_match($pattern, $input, $matches);\nprint_r($matches);`;
      case 'js':
      default:
        return `const regex = /${cleanPattern}/${activeFlagsStr};\nconst isMatch = regex.test(str);\nconst matches = str.match(regex);`;
    }
  }, [pattern, activeFlagsStr, activeLang]);

  const copyCodeSnippet = () => {
    navigator.clipboard.writeText(generatedCode);
    trackEvent(GA_EVENTS.COPY_OUTPUT, { tool_name: 'regex_tester', type: 'code_snippet', language: activeLang });
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div className={`developer-tool-container bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

      {/* Action Toolbar */}
      <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
        {/* Left: Presets + Sample + Clear */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-sans font-semibold text-neutral-400">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}

          <button
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans transition-colors cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>

          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 text-[11px] font-sans transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right: Cheatsheet + Copy + Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            className={`px-2.5 py-1.5 rounded border text-[11px] font-sans font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              showCheatsheet ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cheatsheet</span>
          </button>

          <button
            onClick={copyRegex}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Regex'}</span>
          </button>

          {/* Real-Time Live P2P Collaboration Button */}
          <CollabToolbarButton
            sessionState={collab}
            startSession={collab.startSession}
            joinSession={collab.joinSession}
            leaveSession={collab.leaveSession}
            endSessionForAll={collab.endSessionForAll}
            setDisplayName={collab.setDisplayName}
            isDark={true}
          />

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Local AI Assist Panel */}
      <div className="px-3 py-2 bg-neutral-950 border-b border-neutral-800">
        <LocalAIPanel
          mode="regex-gen"
          onApplyRegex={handleApplyRegex}
        />
      </div>

      {/* Cheatsheet Quick Panel */}
      {showCheatsheet && (
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
          <div>
            <span className="font-bold text-sky-400 block mb-1">Character Classes</span>
            <ul className="space-y-0.5 text-neutral-400">
              <li><code className="text-emerald-400">.</code> Any character except newline</li>
              <li><code className="text-emerald-400">\w</code> Word char [a-zA-Z0-9_]</li>
              <li><code className="text-emerald-400">\d</code> Digit [0-9]</li>
              <li><code className="text-emerald-400">\s</code> Whitespace</li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-purple-400 block mb-1">Quantifiers</span>
            <ul className="space-y-0.5 text-neutral-400">
              <li><code className="text-emerald-400">*</code> 0 or more</li>
              <li><code className="text-emerald-400">+</code> 1 or more</li>
              <li><code className="text-emerald-400">?</code> 0 or 1</li>
              <li><code className="text-emerald-400">{`{n,m}`}</code> Between n and m</li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-amber-400 block mb-1">Anchors</span>
            <ul className="space-y-0.5 text-neutral-400">
              <li><code className="text-emerald-400">^</code> Start of string / line</li>
              <li><code className="text-emerald-400">$</code> End of string / line</li>
              <li><code className="text-emerald-400">\b</code> Word boundary</li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-rose-400 block mb-1">Groups & Logic</span>
            <ul className="space-y-0.5 text-neutral-400">
              <li><code className="text-emerald-400">(...)</code> Capture group</li>
              <li><code className="text-emerald-400">(?:...)</code> Non-capturing group</li>
              <li><code className="text-emerald-400">a|b</code> Either a or b</li>
            </ul>
          </div>
        </div>
      )}

      {/* Expression & Flags Builder Bar */}
      <div className="p-4 bg-neutral-950 border-b border-neutral-800 space-y-3">
        <label className="text-xs font-sans font-semibold text-neutral-300 block">
          Regular Expression Pattern
        </label>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-base font-bold">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. [a-zA-Z0-9]+"
            className="flex-1 p-2.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-200 font-mono text-sm focus:outline-none focus:border-sky-500 transition-colors whitespace-pre-wrap break-words [word-break:break-word] overflow-x-hidden"
          />
          <span className="text-neutral-500 text-base font-bold">/{activeFlagsStr}</span>
        </div>

        {/* Flag Toggles */}
        <div className="flex items-center gap-3 flex-wrap text-[11px] font-sans">
          <span className="text-neutral-400 font-semibold">Flags:</span>
          {(['g', 'i', 'm', 's', 'u', 'y'] as const).map((flag) => (
            <label
              key={flag}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                flags[flag]
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-400 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={() => toggleFlag(flag)}
                className="sr-only"
              />
              <span>{flag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Grid: Test Input vs Match Output */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 ${isFullScreen ? 'flex-1 overflow-hidden' : 'min-h-[360px]'}`}>
        {/* Left: Test String Input */}
        <div className={`flex flex-col p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-semibold text-neutral-300">Test String Corpus</span>
            <button
              onClick={() => setTestString('')}
              className="text-neutral-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
              title="Clear Test String"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Paste your test text here..."
            className="w-full flex-1 min-h-[300px] p-3 bg-neutral-900/90 border border-neutral-800 rounded text-neutral-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-sky-500 resize-y transition-colors whitespace-pre-wrap break-words [word-break:break-word] overflow-x-hidden"
            spellCheck={false}
          />
        </div>

        {/* Right: Matches & Group Analysis or Code Exporter */}
        <div className={`flex flex-col p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
            <div className="flex items-center bg-neutral-900 p-0.5 rounded border border-neutral-800 text-[11px]">
              <button
                onClick={() => setRightViewMode('matches')}
                className={`px-2.5 py-0.5 rounded transition-colors ${rightViewMode === 'matches' ? 'bg-[#1D9BF0] text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
              >
                Match List ({regexResult.count})
              </button>
              <button
                onClick={() => setRightViewMode('code')}
                className={`px-2.5 py-0.5 rounded transition-colors flex items-center gap-1 ${rightViewMode === 'code' ? 'bg-[#1D9BF0] text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
              >
                <Code className="w-3 h-3" />
                <span>Code Exporter</span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] p-3 bg-neutral-900/90 border border-neutral-800 rounded overflow-auto flex flex-col">
            {rightViewMode === 'matches' ? (
              <div className="space-y-4 flex-1">
                {regexResult.analysis && regexResult.analysis.isCatastrophic && (
                   <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded text-amber-300 text-[11px] flex items-start gap-2">
                     <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                     <div>
                       <span className="font-bold block text-amber-500 mb-0.5">âš ï¸ Potential catastrophic backtracking pattern detected.</span>
                       This pattern may cause excessive backtracking for certain inputs.
                     </div>
                   </div>
                )}
                {regexResult.analysis && regexResult.analysis.steps.length > 0 && (
                   <div className="p-3 bg-neutral-950 border border-neutral-800 rounded">
                     <span className="text-[10px] uppercase text-neutral-500 font-bold mb-2 block tracking-wider">Expression Breakdown</span>
                     <div className="flex flex-wrap gap-1.5">
                       {regexResult.analysis.steps.map((step, i) => (
                         <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-[10px]">
                            <code className="text-[#1D9BF0] font-mono">{step.token}</code>
                            <span className="text-neutral-400 font-sans">{step.desc}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                )}

                <div className="space-y-2">
                {regexResult.error ? (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{regexResult.error}</span>
                  </div>
                ) : regexResult.matches.length === 0 ? (
                  <div className="text-neutral-500 text-xs italic p-4 text-center">
                    No matches found for the current regular expression pattern.
                  </div>
                ) : (
                  regexResult.matches.map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-400 font-sans">Match #{idx + 1}</span>
                        <span className="text-neutral-500 font-mono">Index: {m.index}</span>
                      </div>
                      <div className="p-1.5 bg-neutral-900 rounded text-sky-300 font-mono text-xs break-all border border-neutral-800 whitespace-pre-wrap break-words [word-break:break-word] overflow-x-hidden">
                        &quot;{m.match}&quot;
                      </div>
                      {(m.groups.length > 0 || Object.keys(m.namedGroups).length > 0) && (
                        <div className="pt-2">
                          <table className="w-full text-left text-[10px] border-collapse">
                            <thead>
                              <tr className="border-b border-neutral-800">
                                <th className="py-1 text-neutral-500 font-medium">Group</th>
                                <th className="py-1 text-neutral-500 font-medium">Value</th>
                                <th className="py-1 text-neutral-500 font-medium text-right">Indices</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.groups.map((g, gIdx) => (
                                <tr key={`g-${gIdx}`} className="border-b border-neutral-900/50">
                                  <td className="py-1 text-neutral-400">#{gIdx + 1}</td>
                                  <td className="py-1 text-purple-300 font-mono">&quot;{g.value}&quot;</td>
                                  <td className="py-1 text-neutral-500 font-mono text-right">{g.start !== undefined ? `${g.start}-${g.end}` : '-'}</td>
                                </tr>
                              ))}
                              {Object.entries(m.namedGroups).map(([name, g]) => (
                                <tr key={`n-${name}`} className="border-b border-neutral-900/50">
                                  <td className="py-1 text-neutral-400">&lt;{name}&gt;</td>
                                  <td className="py-1 text-emerald-300 font-mono">&quot;{g.value}&quot;</td>
                                  <td className="py-1 text-neutral-500 font-mono text-right">{g.start !== undefined ? `${g.start}-${g.end}` : '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-neutral-950 p-0.5 rounded border border-neutral-800 text-[11px]">
                    {(['js', 'python', 'go', 'php'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-2 py-0.5 rounded capitalize transition-colors ${
                          activeLang === lang ? 'bg-[#1D9BF0] text-white font-medium' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {lang === 'js' ? 'JavaScript' : lang}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={copyCodeSnippet}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded flex items-center gap-1.5 font-sans"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex-1 p-3 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-300 whitespace-pre overflow-auto leading-relaxed">
                  {generatedCode}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Local browser processing â€¢ No data sent to any server</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>ECMAScript RegExp Engine</span>
        </div>
      </div>
    </div>
  );
};
