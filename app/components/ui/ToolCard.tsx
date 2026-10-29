import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '../../lib/router-compat';
import { Product } from '../../types';
import { isCollaborativeTool } from '../../lib/collaboration';

interface ToolCardProps {
  prod: Product;
  idx: number;
  name: string;
  desc: string;
  toolHref: string | null;
  Icon: React.ElementType;
  onClick: (prod: Product) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  prod,
  idx,
  name,
  desc,
  toolHref,
  Icon,
  onClick,
}) => {
  const isCollab = isCollaborativeTool(prod.id);

  return (
    <Link
      href={toolHref ?? '/tools'}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!toolHref) {
          e.preventDefault();
          onClick(prod);
        }
      }}
      className={`p-5 flex flex-col h-full bg-surface border rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isCollab
          ? 'border-emerald-500/30 hover:border-emerald-500/60'
          : 'border-theme-subtle hover:border-[#1D9BF0]/50'
      }`}
    >
      {/* Top: Icon + Title + Index */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-md shrink-0 ${
              isCollab
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-[#1D9BF0]/10 text-[#1D9BF0]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-body font-semibold text-theme-main group-hover:text-[#1D9BF0] transition-colors line-clamp-1">
            {name}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isCollab && (
            <span
              data-testid="collab-badge"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              title="Supports real-time peer-to-peer collaboration"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Live Collab</span>
            </span>
          )}
          <span className="text-[10px] font-mono text-theme-muted opacity-50">0{idx + 1}</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#1D9BF0]" />
        </div>
      </div>

      {/* Middle: Description */}
      <p className="text-xs text-theme-muted leading-relaxed line-clamp-2 mb-5 flex-1">
        {desc}
      </p>

      {/* Bottom: Tech Stack */}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        {prod.techStack.slice(0, 2).map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono"
          >
            {tech}
          </span>
        ))}
      </div>
    </Link>
  );
};
