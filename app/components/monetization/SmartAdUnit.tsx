'use client';

import React, { useEffect, useState, useRef } from 'react';

interface Sponsorship {
  id: string;
  label: string;
  headline: string;
  body: string;
  cta: string;
  href: string;
  badge: string;
  accent: string;
}

/**
 * SmartAdUnit
 * -----------
 * Renders a Google AdSense unit by default.
 * Detects AdBlockers by checking if a synthetic ad-bait element gets hidden by
 * the blocker's CSS rules. On detection, falls back to a self-hosted sponsorship
 * banner loaded from /app/data/sponsorships.json.
 *
 * Usage: <SmartAdUnit slot="1234567890" />
 */
export const SmartAdUnit: React.FC<{ slot?: string; className?: string }> = ({
  slot = '0000000000',
  className = '',
}) => {
  const [adBlocked, setAdBlocked] = useState<boolean | null>(null);
  const [deal, setDeal] = useState<Sponsorship | null>(null);
  const baitRef = useRef<HTMLDivElement>(null);

  // ── AdBlock detection ────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!baitRef.current) return;
      const { offsetHeight, clientHeight } = baitRef.current;
      const blocked = offsetHeight === 0 || clientHeight === 0;
      setAdBlocked(blocked);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // ── Load sponsorship fallback when ad-blocked ────────────────────────────
  useEffect(() => {
    if (!adBlocked) return;
    fetch('/data/sponsorships.json')
      .then((r) => r.json())
      .then((items: Sponsorship[]) => {
        if (items.length > 0) {
          // Rotate by hour so it feels fresh without randomness on SSR
          const idx = Math.floor(Date.now() / (1000 * 60 * 60)) % items.length;
          setDeal(items[idx]);
        }
      })
      .catch(() => {
        // silent fail - no deal rendered
      });
  }, [adBlocked]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (adBlocked === null) {
    return (
      <>
        {/* Bait element: AdBlockers collapse elements matching ad-class patterns */}
        <div
          ref={baitRef}
          aria-hidden="true"
          className="ads ad adsbox doubleclick ad-placement"
          style={{ height: 1, width: 1, overflow: 'hidden', position: 'absolute', opacity: 0 }}
        />
        <div className={`h-[90px] bg-neutral-900 rounded-md animate-pulse ${className}`} />
      </>
    );
  }

  // ── Fallback sponsorship banner ──────────────────────────────────────────
  if (adBlocked && deal) {
    return (
      <a
        href={deal.href}
        target="_blank"
        rel="noopener noreferrer"
        id={`sponsor-${deal.id}`}
        className={`group flex items-start gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900 ${className}`}
        aria-label={`Sponsor: ${deal.headline}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: deal.accent, background: `${deal.accent}18`, border: `1px solid ${deal.accent}33` }}
            >
              {deal.label}
            </span>
            <span className="text-[10px] font-mono text-neutral-500">{deal.badge}</span>
          </div>
          <p className="text-sm font-semibold text-neutral-100 truncate">{deal.headline}</p>
          <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{deal.body}</p>
        </div>
        <span
          className="shrink-0 self-center text-xs font-mono px-2.5 py-1.5 rounded border transition-colors group-hover:text-white"
          style={{
            color: deal.accent,
            borderColor: `${deal.accent}55`,
            background: `${deal.accent}11`,
          }}
        >
          {deal.cta} →
        </span>
      </a>
    );
  }

  // ── Fallback: no deal loaded (ad-blocked but no sponsorship data) ────────
  if (adBlocked && !deal) return null;

  // ── Standard AdSense unit ────────────────────────────────────────────────
  return (
    <div className={`overflow-hidden rounded-md ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
