import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

interface JsonTreeViewProps {
  data: any;
  depth?: number;
  initialExpandedDepth?: number;
  searchQuery?: string;
}

export const JsonTreeNode: React.FC<{
  label?: string | number;
  value: any;
  depth?: number;
  initialExpandedDepth?: number;
  isLast?: boolean;
}> = ({ label, value, depth = 0, initialExpandedDepth = 2, isLast = true }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(depth < initialExpandedDepth);
  const [copied, setCopied] = useState(false);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

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
      return <span className="text-neutral-500 italic">null</span>;
    }
    if (typeof val === 'boolean') {
      return <span className="text-purple-400 font-semibold">{val ? 'true' : 'false'}</span>;
    }
    if (typeof val === 'number') {
      return <span className="text-amber-400 font-mono">{val}</span>;
    }
    if (typeof val === 'string') {
      return <span className="text-emerald-400 font-mono">"{val}"</span>;
    }
    return <span className="text-neutral-300">{String(val)}</span>;
  };

  if (!isExpandable) {
    return (
      <div className="flex items-center gap-1.5 py-0.5 hover:bg-neutral-900/60 px-1 rounded transition-colors group">
        {label !== undefined && (
          <span className="text-sky-400 font-mono shrink-0">
            "{label}":
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
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-neutral-900/80 cursor-pointer select-none group"
      >
        <span className="text-neutral-500 hover:text-neutral-300">
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>

        {label !== undefined && (
          <span className="text-sky-400 shrink-0">
            "{label}":
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
}) => {
  if (data === undefined) {
    return <div className="text-neutral-500 font-mono text-xs p-4">No data to display</div>;
  }

  return (
    <div className="p-4 bg-neutral-950 font-mono text-xs sm:text-sm overflow-x-auto text-neutral-200">
      <JsonTreeNode value={data} depth={0} initialExpandedDepth={initialExpandedDepth} />
    </div>
  );
};
