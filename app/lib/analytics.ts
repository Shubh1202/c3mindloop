// GA4 event helper- fires gtag events safely (no-op if gtag not loaded)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// Canonical key events- mark these as "Key Events" in GA4 dashboard
export const GA_EVENTS = {
  TOOL_USED: 'tool_used',       // fired once per tool session on first meaningful action
  COPY_OUTPUT: 'copy_output',   // fired when user copies tool output
  TOOL_ACTION: 'tool_action',   // fired for secondary actions (format, minify, decode, etc.)
  PAGE_404: 'page_not_found',   // fired on 404 page render
} as const;
