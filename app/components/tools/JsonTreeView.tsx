import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

export type SearchTarget = 'all' | 'keys' | 'values';

interface JsonTreeViewProps {
  data: any;
  depth?: number;
  initialExpandedDepth?: number;
  searchQuery?: string;
  searchTarget?: SearchTarget;
  matchCase?: boolean;
}

function matchesSearchText(
  text: string,
  query: string,
  targetType: 'key' | 'value',
  allowedTarget: SearchTarget,
  matchCase: boolean
): boolean {
  if (!query) return false;
  if (allowedTarget !== 'all' && allowedTarget !== (targetType === 'key' ? 'keys' : 'values')) {
    return false;
  }
  const haystack = matchCase ? text : text.toLowerCase();
  const needle = matchCase ? query : query.toLowerCase();
  return haystack.includes(needle);
}

function hasChildSearchMatch(
  obj: any,
  query: string,
  allowedTarget: SearchTarget,
  matchCase: boolean
): boolean {
  if (!query || obj === null || typeof obj !== 'object') return false;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        if (hasChildSearchMatch(item, query, allowedTarget, matchCase)) return true;
      } else {
        if (matchesSearchText(String(item), query, 'value', allowedTarget, matchCase)) return true;
      }
    }
    return false;
  }

  for (const [key, val] of Object.entries(obj)) {
    if (matchesSearchText(key, query, 'key', allowedTarget, matchCase)) return true;
    if (typeof val === 'object' && val !== null) {
      if (hasChildSearchMatch(val, query, allowedTarget, matchCase)) return true;
    } else {
      if (matchesSearchText(String(val), query, 'value', allowedTarget, matchCase)) return true;
    }
  }
  return false;
}

function HighlightText({
  text,
  query,
  matchCase,
  isKey,
  allowedTarget,
}: {
  text: string;
  query?: string;
  matchCase?: boolean;
  isKey: boolean;
  allowedTarget: SearchTarget;
}) {
  const isMatchAllowed = allowedTarget === 'all' || (isKey ? allowedTarget === 'keys' : allowedTarget === 'values');

  if (!query || !isMatchAllowed) {
    return <>{text}</>;
  }

  const flags = matchCase ? 'g' : 'gi';
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let regex: RegExp;
  try {
    regex = new RegExp(`(${escapedQuery})`, flags);
  } catch {
    return <>{text}</>;
  }
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = matchCase
          ? part === query
          : part.toLowerCase() === query.toLowerCase();

        return isMatch ? (
          <mark
            key={i}
            className="bg-amber-400 text-neutral-950 font-bold px-0.5 rounded shadow-sm"
          >
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </>
  );
}

export const JsonTreeNode: React.FC<{
  label?: string | number;
  value: any;
  depth?: number;
  initialExpandedDepth?: number;
  isLast?: boolean;
  searchQuery?: string;
  searchTarget?: SearchTarget;
  matchCase?: boolean;
}> = ({
  label,
  value,
  depth = 0,
  initialExpandedDepth = 2,
  isLast = true,
  searchQuery = '',
  searchTarget = 'all',
  matchCase = false,
}) => {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const childHasMatch = isExpandable && searchQuery ? hasChildSearchMatch(value, searchQuery, searchTarget, matchCase) : false;
  const isExpanded = userExpanded !== null ? userExpanded : (searchQuery ? (childHasMatch || depth < initialExpandedDepth) : depth < initialExpandedDepth);

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (label !== undefined) {
      navigator.clipboard.writeText(String(label));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const renderValue = (val: any) => {
    if (val === null) {
      return (
        <span className="text-neutral-500 italic">
          <HighlightText text="null" query={searchQuery} matchCase={matchCase} isKey={false} allowedTarget={searchTarget} />
        </span>
      );
    }
    if (typeof val === 'boolean') {
      return (
        <span className="text-purple-400 font-semibold">
          <HighlightText text={val ? 'true' : 'false'} query={searchQuery} matchCase={matchCase} isKey={false} allowedTarget={searchTarget} />
        </span>
      );
    }
    if (typeof val === 'number') {
      return (
        <span className="text-amber-400 font-mono">
          <HighlightText text={String(val)} query={searchQuery} matchCase={matchCase} isKey={false} allowedTarget={searchTarget} />
        </span>
      );
    }
    if (typeof val === 'string') {
      return (
        <span className="text-emerald-400 font-mono">
          "<HighlightText text={val} query={searchQuery} matchCase={matchCase} isKey={false} allowedTarget={searchTarget} />"
        </span>
      );
    }
    return (
      <span className="text-neutral-300">
        <HighlightText text={String(val)} query={searchQuery} matchCase={matchCase} isKey={false} allowedTarget={searchTarget} />
      </span>
    );
  };

  if (!isExpandable) {
    return (
      <div className="flex items-center gap-1.5 py-0.5 hover:bg-neutral-900/60 px-1 rounded transition-colors group">
        {label !== undefined && (
          <span className="text-sky-400 font-mono shrink-0">
            "<HighlightText text={String(label)} query={searchQuery} matchCase={matchCase} isKey={true} allowedTarget={searchTarget} />":
          </span>
        )}
        <span className="font-mono text-xs sm:text-sm">{renderValue(value)}</span>
        {!isLast && <span className="text-neutral-600 font-mono">,</span>}

        {label !== undefined && (
          <button
            onClick={handleCopyPath}
            title="Copy key name"
            className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-500 hover:text-neutral-300 transition-opacity ml-1"
          >
            {copied ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  }

  const entries = isObject ? Object.entries(value) : isArray ? value.map((v, i) => [i, v]) : [];
  const itemCount = entries.length;
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="font-mono text-xs sm:text-sm my-0.5">
      <div
        onClick={() => setUserExpanded(!isExpanded)}
        className="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-neutral-900/80 cursor-pointer select-none group"
      >
        <span className="text-neutral-500 hover:text-neutral-300">
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>

        {label !== undefined && (
          <span className="text-sky-400 shrink-0">
            "<HighlightText text={String(label)} query={searchQuery} matchCase={matchCase} isKey={true} allowedTarget={searchTarget} />":
          </span>
        )}

        <span className="text-neutral-400">{openBracket}</span>

        {!isExpanded && (
          <span className="text-neutral-500 text-[11px] px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        )}

        {!isExpanded && <span className="text-neutral-400">{closeBracket}</span>}
        {!isExpanded && !isLast && <span className="text-neutral-600">,</span>}
      </div>

      {isExpanded && (
        <div className="pl-4 sm:pl-5 border-l border-neutral-800/80 ml-2 space-y-0.5 my-0.5">
          {entries.map(([k, v], index) => (
            <JsonTreeNode
              key={String(k)}
              label={isArray ? undefined : k}
              value={v}
              depth={depth + 1}
              initialExpandedDepth={initialExpandedDepth}
              isLast={index === itemCount - 1}
              searchQuery={searchQuery}
              searchTarget={searchTarget}
              matchCase={matchCase}
            />
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="pl-2 text-neutral-400">
          {closeBracket}
          {!isLast && <span className="text-neutral-600">,</span>}
        </div>
      )}
    </div>
  );
};

export const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  initialExpandedDepth = 2,
  searchQuery = '',
  searchTarget = 'all',
  matchCase = false,
}) => {
  if (data === undefined) {
    return <div className="text-neutral-500 font-mono text-xs p-4">No data to display</div>;
  }

  return (
    <div className="json-tree-view p-4 bg-neutral-950 font-mono text-xs sm:text-sm overflow-x-auto text-neutral-200">
      <JsonTreeNode
        value={data}
        depth={0}
        initialExpandedDepth={initialExpandedDepth}
        searchQuery={searchQuery}
        searchTarget={searchTarget}
        matchCase={matchCase}
      />
    </div>
  );
};
