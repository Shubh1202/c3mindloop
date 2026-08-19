'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GraphInputPanel } from './JsonGraph/GraphInputPanel';
import { GraphView } from './JsonGraph/GraphView';
import { GraphToolbar, ViewMode } from './JsonGraph/GraphToolbar';
import { GraphInfoBar } from './JsonGraph/GraphInfoBar';
import { buildGraph } from './JsonGraph/graphBuilder';
import { computeLayout } from './JsonGraph/graphLayout';
import { exportGraphAsPNG } from './JsonGraph/graphExport';
import { GraphNode, GraphEdge, GraphTransform, GraphStats } from './JsonGraph/graphTypes';
import { JsonTreeView } from './JsonTreeView';
import { GRAPH_EXAMPLES } from './JsonGraph/graphExamples';
import { X, List } from 'lucide-react';

const DEBOUNCE_MS = 600;
const MIN_SCALE = 0.1;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.2;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function countKeys(rawText: string): number {
  const matches = rawText.match(/"[\w\s]+":/g);
  return matches ? matches.length : 0;
}

export const JsonGraphTool: React.FC = () => {
  const [inputValue, setInputValue] = useState(GRAPH_EXAMPLES[0].value);
  const [parsedJSON, setParsedJSON] = useState<unknown>(null);
  const [parseError, setParseError] = useState('');
  const [keyCount, setKeyCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [truncatedGraph, setTruncatedGraph] = useState(false);
  const [truncatedDismissed, setTruncatedDismissed] = useState(false);
  const [graphStats, setGraphStats] = useState<GraphStats | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const copiedPathTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [transform, setTransform] = useState<GraphTransform>({ x: 0, y: 0, scale: 1 });

  const [isLayoutComputing, setIsLayoutComputing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportErrorVisible, setExportErrorVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const graphViewRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // ── Fullscreen- mirrors JsonFormatterTool behavior exactly ───────────────
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

  // ── Search ─────────────────────────────────────────────────────────────────
  const searchMatchIds = useMemo(() => {
    if (!searchQuery.trim() || nodes.length === 0) return new Set<string>();
    const q = searchQuery.toLowerCase();
    const result = new Set<string>();
    for (const node of nodes) {
      if (node.label.toLowerCase().includes(q)) { result.add(node.id); continue; }
      for (const row of node.rows) {
        if (row.key.toLowerCase().includes(q) || row.displayValue.toLowerCase().includes(q)) {
          result.add(node.id); break;
        }
      }
    }
    return result;
  }, [searchQuery, nodes]);

  // ── Debounced parse ────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const kc = countKeys(inputValue);
    setKeyCount(kc);

    if (inputValue.trim() === '') {
      setParsedJSON(null); setParseError('');
      setNodes([]); setEdges([]);
      setTruncatedGraph(false); setTruncatedDismissed(false);
      setGraphStats(null);
      isFirstRender.current = true;
      return;
    }
    if (kc > 2000) { setParsedJSON(null); setParseError(''); return; }

    debounceTimer.current = setTimeout(() => {
      try { setParsedJSON(JSON.parse(inputValue)); setParseError(''); }
      catch (err: unknown) {
        setParseError(err instanceof Error ? err.message : 'Invalid JSON');
        setParsedJSON(null);
      }
    }, DEBOUNCE_MS);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [inputValue]);

  // ── Build + layout ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (parsedJSON === null || keyCount > 2000) return;

    setIsLayoutComputing(true);
    setTruncatedDismissed(false);
    if (layoutTimer.current) clearTimeout(layoutTimer.current);

    layoutTimer.current = setTimeout(() => {
      const { nodes: builtNodes, edges: builtEdges, truncated, stats } = buildGraph(parsedJSON);
      const defaultCollapsed = new Set<string>();
      for (const n of builtNodes) { if (n.depth >= 2) defaultCollapsed.add(n.id); }
      const laidOutNodes = computeLayout(builtNodes, builtEdges, defaultCollapsed);

      setNodes(laidOutNodes); setEdges(builtEdges);
      setCollapsedNodes(defaultCollapsed); setSelectedNode(null);
      setTruncatedGraph(truncated); setGraphStats(stats);

      if (isFirstRender.current) {
        isFirstRender.current = false;
        fitToScreen(laidOutNodes, defaultCollapsed, builtEdges);
      }
      setIsLayoutComputing(false);
    }, 0);

    return () => { if (layoutTimer.current) clearTimeout(layoutTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedJSON]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getVisibleNodes(
    allNodes: GraphNode[], allEdges: GraphEdge[], collapsed: Set<string>,
  ): GraphNode[] {
    const childrenMap = new Map<string, string[]>();
    for (const n of allNodes) childrenMap.set(n.id, []);
    for (const e of allEdges) { const a = childrenMap.get(e.sourceId); if (a) a.push(e.targetId); }
    const hasParent = new Set(allEdges.map(e => e.targetId));
    const roots = allNodes.filter(n => !hasParent.has(n.id));
    const visible = new Set<string>();
    const queue = roots.map(r => r.id);
    while (queue.length > 0) {
      const id = queue.shift()!;
      visible.add(id);
      if (!collapsed.has(id)) queue.push(...(childrenMap.get(id) ?? []));
    }
    return allNodes.filter(n => visible.has(n.id));
  }

  function fitToScreen(
    targetNodes: GraphNode[], collapsed: Set<string>, allEdges: GraphEdge[],
  ) {
    const visible = getVisibleNodes(targetNodes, allEdges, collapsed);
    if (visible.length === 0) return;
    const vw = graphViewRef.current?.clientWidth ?? 800;
    const vh = graphViewRef.current?.clientHeight ?? 500;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of visible) {
      if (n.x < minX) minX = n.x; if (n.y < minY) minY = n.y;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    }
    const PAD = 32;
    const newScale = clamp(
      Math.min(vw / (maxX - minX + PAD * 2), vh / (maxY - minY + PAD * 2)),
      MIN_SCALE, MAX_SCALE,
    );
    setTransform({
      x: (vw - (maxX + minX) * newScale) / 2,
      y: (vh - (maxY + minY) * newScale) / 2,
      scale: newScale,
    });
  }

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleFitToScreen = useCallback(() => {
    fitToScreen(nodes, collapsedNodes, edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, collapsedNodes, edges]);

  const handleZoomIn = useCallback(() => {
    setTransform(p => ({ ...p, scale: clamp(p.scale + ZOOM_STEP, MIN_SCALE, MAX_SCALE) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform(p => ({ ...p, scale: clamp(p.scale - ZOOM_STEP, MIN_SCALE, MAX_SCALE) }));
  }, []);

  const handleResetLayout = useCallback(() => {
    if (!parsedJSON) return;
    setIsLayoutComputing(true);
    setTimeout(() => {
      const { nodes: bn, edges: be, stats } = buildGraph(parsedJSON);
      const dc = new Set<string>(bn.filter(n => n.depth >= 2).map(n => n.id));
      const ln = computeLayout(bn, be, dc);
      setNodes(ln); setEdges(be); setCollapsedNodes(dc);
      setSelectedNode(null); setGraphStats(stats);
      setTransform({ x: 0, y: 0, scale: 1 });
      setIsLayoutComputing(false);
    }, 0);
  }, [parsedJSON]);

  const handleExpandAll = useCallback(() => {
    const next = new Set<string>();
    setTimeout(() => { setNodes(computeLayout(nodes, edges, next)); }, 0);
    setCollapsedNodes(next);
  }, [nodes, edges]);

  const handleCollapseAll = useCallback(() => {
    const next = new Set<string>(nodes.filter(n => n.depth > 0).map(n => n.id));
    setTimeout(() => { setNodes(computeLayout(nodes, edges, next)); }, 0);
    setCollapsedNodes(next);
  }, [nodes, edges]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) { next.delete(nodeId); } else { next.add(nodeId); }
      setTimeout(() => { setNodes(computeLayout(nodes, edges, next)); }, 0);
      return next;
    });
  }, [nodes, edges]);

  const handleCopyPath = useCallback((path: string) => {
    if (copiedPathTimer.current) clearTimeout(copiedPathTimer.current);
    setCopiedPath(path);
    copiedPathTimer.current = setTimeout(() => setCopiedPath(null), 2000);
  }, []);

  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  const handleExport = useCallback(async () => {
    if (isExporting || nodes.length === 0) return;
    setIsExporting(true); setExportErrorVisible(false);
    try { await exportGraphAsPNG(nodes, edges, collapsedNodes); }
    catch {
      setExportError('Export failed- use a screenshot instead');
      setExportErrorVisible(true);
      setTimeout(() => setExportErrorVisible(false), 4000);
    } finally { setIsExporting(false); }
  }, [nodes, edges, collapsedNodes, isExporting]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const visibleNodes = useMemo(
    () => getVisibleNodes(nodes, edges, collapsedNodes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges, collapsedNodes],
  );

  const hasNodes = nodes.length > 0;
  const toolbarDisabled = isLayoutComputing;
  const showYellowBanner = keyCount > 500 && keyCount <= 2000 && inputValue.trim() !== '';
  const showRedBanner = keyCount > 2000 && inputValue.trim() !== '';

  // ── Layout
  //
  //  ┌──────────────────────────────────────────────────────────┐
  //  │  Row 1- Primary toolbar (Graph/Tree + all controls)     │  ← bg-neutral-900 border-b
  //  ├──────────────────────────────────────────────────────────┤
  //  │  Row 2- Search bar + live stats                         │  ← bg-neutral-900/40 border-b
  //  ├──────────────────────────────────────────────────────────┤
  //  │  Row 3- Optional banners (perf / truncation / error)    │
  //  ├──────────────────────────────────────────────────────────┤
  //  │  Row 4- Workspace (fixed height)                        │
  //  │  ┌───────────────┬──────────────────────────────────┐   │
  //  │  │  Input panel  │  Graph canvas / Tree view         │   │
  //  │  │  (280px)      │  (flex-1, overflow-hidden)        │   │
  //  │  └───────────────┴──────────────────────────────────┘   │
  //  └──────────────────────────────────────────────────────────┘

  return (
    <div className={`flex flex-col w-full border border-neutral-800 bg-neutral-950 overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[9999] rounded-none' : 'rounded-lg'}`}>

      {/* ── Row 1: Primary toolbar ───────────────────────────────────────── */}
      <GraphToolbar
        viewMode={viewMode}
        scale={transform.scale}
        disabled={toolbarDisabled}
        canExport={hasNodes}
        isExporting={isExporting}
        isFullScreen={isFullScreen}
        visibleNodeCount={visibleNodes.length}
        totalNodeCount={nodes.length}
        onViewModeChange={setViewMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={handleFitToScreen}
        onResetLayout={handleResetLayout}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onExport={handleExport}
        onToggleFullScreen={handleToggleFullScreen}
      />

      {/* ── Row 2: Search + live stats ───────────────────────────────────── */}
      <GraphInfoBar
        stats={graphStats}
        searchQuery={searchQuery}
        searchMatchCount={searchMatchIds.size}
        onSearchChange={setSearchQuery}
        copiedPath={copiedPath}
      />

      {/* ── Row 3: Banners ───────────────────────────────────────────────── */}
      {showYellowBanner && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/40 border-b border-amber-500/30 text-amber-400 text-xs font-mono shrink-0">
          ⚠ Large payload ({keyCount} keys detected)- performance may be affected
        </div>
      )}
      {showRedBanner && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 border-b border-red-500/30 text-red-400 text-xs font-mono shrink-0">
          ✕ Payload too large ({keyCount} keys)- graph rendering skipped
        </div>
      )}
      {truncatedGraph && !truncatedDismissed && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-blue-950/30 border-b border-blue-500/20 text-blue-400 text-xs font-mono shrink-0">
          <span>Graph truncated: showing first 200 nodes (BFS order)</span>
          <button onClick={() => setTruncatedDismissed(true)} className="text-blue-500 hover:text-blue-300 transition-colors cursor-pointer" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {exportErrorVisible && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-red-950/40 border-b border-red-500/30 text-red-400 text-xs font-mono shrink-0">
          <span>{exportError}</span>
          <button onClick={() => setExportErrorVisible(false)} className="text-red-500 hover:text-red-300 transition-colors cursor-pointer" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Row 4: Workspace ─────────────────────────────────────────────── */}
      <div className={`flex ${isFullScreen ? 'flex-1 overflow-hidden' : ''}`} style={isFullScreen ? undefined : { height: '560px' }}>

        {/* Input panel- fixed 280px */}
        <div className="shrink-0 border-r border-neutral-800 overflow-hidden flex flex-col" style={{ width: '280px' }}>
          <GraphInputPanel
            value={inputValue}
            onChange={(v) => { setInputValue(v); isFirstRender.current = true; }}
            hasError={!!parseError && inputValue.trim() !== ''}
            errorMessage={parseError}
          />
        </div>

        {/* Graph / tree canvas- fills remaining width and full height */}
        <div className="flex-1 min-w-0 overflow-hidden relative" ref={graphViewRef}>

          {/* GRAPH VIEW */}
          {viewMode === 'graph' && (
            <>
              <GraphView
                nodes={nodes}
                edges={edges}
                transform={transform}
                onTransformChange={setTransform}
                collapsedNodes={collapsedNodes}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
                searchMatchIds={searchMatchIds}
                onCopyPath={handleCopyPath}
              />
              {isLayoutComputing && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/50 pointer-events-none">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Computing layout…
                  </div>
                </div>
              )}
            </>
          )}

          {/* TREE VIEW */}
          {viewMode === 'tree' && (
            <div className="w-full h-full overflow-auto bg-neutral-950">
              {parsedJSON !== null ? (
                <JsonTreeView data={parsedJSON} initialExpandedDepth={2} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <List className="w-8 h-8 text-neutral-700" />
                  <p className="text-sm font-mono text-neutral-600">
                    {parseError
                      ? 'Fix the JSON error to see the tree'
                      : 'Paste JSON on the left to explore the tree'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
