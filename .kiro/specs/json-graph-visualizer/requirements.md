# Requirements Document

## Introduction

This feature creates a **dedicated JSON Graph Visualizer** as a standalone tool at the route `/tools/json-graph`. The tool provides an interactive node-graph visualization of pasted or typed JSON — similar to JSON Crack — where keys and values are rendered as connected nodes supporting pan, zoom, and click-to-expand/collapse interaction. All processing is 100% client-side with zero network requests. This tool is independent of `JsonFormatterTool`; it does not modify that component's view switcher, routes, UI, or SEO metadata in any way.

---

## Glossary

- **JSON_Graph_Tool**: The new standalone React component at `app/components/tools/JsonGraphTool.tsx` that owns the JSON input area and the graph workspace.
- **Graph_Input_Panel**: The left or top panel inside JSON_Graph_Tool where the user types or pastes raw JSON text.
- **Graph_Renderer**: The client-side component responsible for converting a parsed JSON object into a node-graph and rendering it on an SVG or Canvas surface.
- **Node**: A single visual unit in the graph representing one JSON object, array, or scalar value.
- **Edge**: A directed connector line drawn from a parent Node to a child Node.
- **Root_Node**: The top-level Node produced from the JSON root object or array.
- **Graph_View**: The graph canvas workspace area inside JSON_Graph_Tool where the Graph_Renderer renders Nodes, Edges, and the Graph_Toolbar.
- **Graph_Toolbar**: A minimal docked control strip inside the Graph_View containing Zoom In, Zoom Out, Fit-to-Screen, Reset Layout, and Export PNG controls.
- **Fit_to_Screen**: An action that scales and translates the graph so all nodes are visible within the viewport bounds.
- **Collapsed_Node**: A Node whose children are hidden; indicated by a visual badge showing the count of hidden children.
- **Expanded_Node**: A Node whose children are rendered and connected by Edges.
- **parsedJSON**: The JavaScript value produced by `JSON.parse()` from the Graph_Input_Panel text, held in JSON_Graph_Tool state.

---

## Requirements

### Requirement 1: Standalone JSON Graph Tool Page

**User Story:** As a developer, I want a dedicated JSON Graph Visualizer page at its own route, so that I can visualize JSON structures without needing to open the JSON Formatter tool.

#### Acceptance Criteria

1. THE JSON_Graph_Tool SHALL be accessible at the route `/tools/json-graph` as a standalone Next.js page following the project's existing file-based routing conventions.
2. THE JSON_Graph_Tool SHALL include a Graph_Input_Panel where the user can type or paste raw JSON text without any prior interaction with JsonFormatterTool.
3. IF the Graph_Input_Panel contains valid JSON, THEN THE JSON_Graph_Tool SHALL parse that JSON and pass the resulting parsedJSON to the Graph_Renderer within 600ms of the last input change.
4. IF the Graph_Input_Panel contains invalid JSON (regardless of how the content was introduced), THEN THE JSON_Graph_Tool SHALL display an inline error indicator (e.g., a red border and error message) without rendering any graph nodes or edges.
5. THE JSON_Graph_Tool SHALL be added to the appropriate tools navigation category so users can discover it alongside other tools.
6. THE JSON_Graph_Tool SHALL NOT modify `JsonFormatterTool.tsx`, its view switcher, routes, SEO metadata, or any existing view modes (Code View, Tree View, Data Inspector).
7. THE JSON_Graph_Tool SHALL have its own independent page-level SEO metadata (title, description) following the project's existing metadata conventions.
8. WHEN the Graph_Input_Panel is empty or contains only whitespace, THE Graph_Renderer SHALL display an empty placeholder state with no Nodes or Edges.
9. THE JSON_Graph_Tool page SHALL have ONLY ONE top-level H1 title rendered in the page file, consistent with the project's Single Heading Policy; the JsonGraphTool component itself SHALL NOT render a duplicate inner title, icon+title row, or subtitle block.
10. WHEN parsedJSON becomes null (input cleared or invalid), THE JSON_Graph_Tool SHALL keep the Graph_View active but render the empty placeholder state rather than switching to any other view.

---

### Requirement 2: Graph Rendering from Parsed JSON

**User Story:** As a developer, I want the JSON structure rendered as a connected node graph, so that I can visually understand the shape and nesting of my data.

#### Acceptance Criteria

1. WHEN JSON_Graph_Tool is mounted and parsedJSON is non-null, THE Graph_Renderer SHALL convert parsedJSON into a directed acyclic graph of Nodes and Edges and render and make Nodes and Edges explicitly visible in the Graph_View.
2. THE Graph_Renderer SHALL represent each JSON object as a Node containing its key-value pairs as labeled rows.
3. THE Graph_Renderer SHALL represent each JSON array as a Node containing index-labeled rows for each element.
4. THE Graph_Renderer SHALL represent scalar values (string, number, boolean, null) as inline text within their parent Node rather than as separate Nodes, truncating any scalar string value exceeding 100 characters with a trailing ellipsis (`…`).
5. THE Graph_Renderer SHALL draw one Edge from a parent Node to each child Node for every object key or array index whose value is itself an object or array.
6. WHEN parsedJSON changes, THE Graph_Renderer SHALL fully replace the existing graph with a new render reflecting the updated structure within 600ms of the last input change.
7. THE Graph_Renderer SHALL execute entirely in the browser with no network requests.
8. IF parsedJSON is null or absent, THEN THE Graph_Renderer SHALL display an empty placeholder state with no Nodes or Edges visible.
9. IF a circular reference is detected during graph construction, THEN THE Graph_Renderer SHALL render the back-edge target as a leaf Node labeled `[Circular]` referencing the ancestor Node path, and SHALL NOT recurse further into that branch.
10. IF the total number of Nodes to be rendered exceeds 200, THEN THE Graph_Renderer SHALL render the first 200 Nodes in breadth-first order and display a dismissible notice banner stating the graph has been truncated.
11. IF parsedJSON is a valid but empty JSON structure (an empty object `{}` or empty array `[]`), THEN THE Graph_Renderer SHALL render a single Root_Node with no rows and no Edges, and SHALL NOT display the empty placeholder state.

---

### Requirement 3: Graph Layout

**User Story:** As a developer, I want nodes laid out in a readable left-to-right hierarchy, so that I can trace the nesting structure without manually repositioning nodes.

#### Acceptance Criteria

1. THE Graph_Renderer SHALL apply a hierarchical layout algorithm that positions the Root_Node at the left edge of the canvas and child Nodes progressively to the right, so that depth increases in the horizontal (left-to-right) direction.
2. THE Graph_Renderer SHALL ensure that no two Node bounding boxes overlap in the initial layout, where overlap is defined as any intersection of the rectangular bounds of two distinct Nodes.
3. THE Graph_Renderer SHALL apply a minimum horizontal spacing of 40px and a minimum vertical spacing of 24px between sibling Node bounding boxes.
4. WHEN the JSON structure changes and parsedJSON is valid and non-null, THE Graph_Renderer SHALL recompute the layout from scratch within the same 600ms re-render window, discarding all prior Node positions. IF layout computation does not complete within 600ms, THE Graph_Renderer SHALL still display whatever partial layout is available and SHALL NOT block the UI thread.
5. IF parsedJSON is null or invalid at the time of a layout recompute trigger, THEN THE Graph_Renderer SHALL skip the layout computation and keep the current canvas content unchanged and visible.
6. THE Graph_Renderer SHALL fit the initial layout to the viewport at 1.0 scale (100% zoom) with Fit_to_Screen applied automatically on first render of a new JSON document.

---

### Requirement 4: Pan and Zoom Interaction

**User Story:** As a developer, I want to pan and zoom the graph with standard mouse and touch gestures, so that I can navigate large graphs without relying solely on the toolbar controls.

#### Acceptance Criteria

1. WHEN the user scrolls with a mouse wheel inside the Graph_View viewport, THE Graph_Renderer SHALL zoom in or out centered on the cursor position within 16ms of the scroll event.
2. WHEN the user clicks and drags on an empty area of the Graph_View, WHILE the pointer-drag gesture is active, THE Graph_Renderer SHALL pan the canvas in the direction of the drag, updating the transform on every `pointermove` event, and SHALL stop updating the transform immediately when the drag ends or is interrupted (i.e., on `pointerup`, `pointercancel`, or pointer capture loss).
3. WHEN the user performs a two-finger pinch gesture on a touch device inside the Graph_View, THE Graph_Renderer SHALL zoom in or out proportionally to the pinch scale change between `touchmove` events.
4. THE Graph_Renderer SHALL constrain the zoom level to a minimum of 10% and a maximum of 300% of the default scale at all times, clamping any gesture or toolbar action that would exceed these bounds.
5. THE Graph_Renderer SHALL preserve the current pan offset and zoom level in JSON_Graph_Tool state for the duration of the session so that the viewport position is retained while the user interacts with the Graph_Input_Panel or other page elements.
6. WHEN the user drags on a Node rather than the empty canvas, THE Graph_Renderer SHALL NOT pan the canvas; the drag SHALL be treated as a Node interaction only.
7. WHEN zooming via mouse wheel, THE Graph_Renderer SHALL NOT scroll the outer page; it SHALL call `event.preventDefault()` on the wheel event.

---

### Requirement 5: Graph Toolbar Controls

**User Story:** As a developer, I want dedicated Zoom In, Zoom Out, Fit-to-Screen, and Reset Layout buttons, so that I can control the view precisely without relying on gestures alone.

#### Acceptance Criteria

1. THE Graph_Toolbar SHALL render as a docked strip anchored to the bottom-left corner inside the Graph_View, containing Zoom Out, zoom-level label, Zoom In, Fit_to_Screen, Reset Layout, and Export PNG buttons in that order.
2. WHEN the user clicks Zoom In, THE Graph_Renderer SHALL increase the zoom level by 20 percentage points, clamped to the 300% maximum, and update the zoom label immediately. WHEN the zoom level is below 10% due to any cause, Zoom In SHALL still function to bring the level back into the valid range.
3. WHEN the user clicks Zoom Out, THE Graph_Renderer SHALL decrease the zoom level by 20 percentage points, clamped to the 10% minimum, and update the zoom label immediately.
4. WHEN the user clicks Fit_to_Screen, THE Graph_Renderer SHALL compute and apply the scale and translation required to make all visible Nodes fit within the current viewport with at least 16px padding on each side.
5. WHEN the user clicks Reset Layout, THE Graph_Renderer SHALL recompute the hierarchical layout, restore the default collapse/expand state (depth 0 and 1 expanded, depth 2+ collapsed), reset the zoom to 100%, and reset the pan to the origin (top-left alignment).
6. THE Graph_Toolbar SHALL display the current zoom level as a percentage text label (e.g., `100%`) between the Zoom Out and Zoom In buttons, updating within one animation frame of any zoom change.
7. WHEN the zoom level is at the minimum (10%), THE Graph_Toolbar SHALL disable the Zoom Out button and that button SHALL be completely non-interactive, producing no response or visual feedback on any click or pointer event. WHEN the zoom level is at the maximum (300%), THE Graph_Toolbar SHALL disable the Zoom In button and that button SHALL be completely non-interactive, producing no response or visual feedback on any click or pointer event.
8. WHILE a layout recomputation is in progress, THE Graph_Toolbar SHALL disable all toolbar buttons until the layout completes.

---

### Requirement 6: Node Expand and Collapse

**User Story:** As a developer, I want to click a node to collapse or expand its children, so that I can manage visual complexity when working with deeply nested JSON.

#### Acceptance Criteria

1. WHEN the user clicks an Expanded_Node header, THE Graph_Renderer SHALL collapse that node by hiding all descendant Nodes and Edges and marking it as a Collapsed_Node.
2. WHEN the user clicks a Collapsed_Node header, THE Graph_Renderer SHALL expand that node by restoring its immediate child Nodes and Edges; the expanded children SHALL retain their own prior collapse/expand state.
3. WHEN a Node is collapsed, THE Graph_Renderer SHALL display a numeric badge on the Node showing the count of its direct children that are hidden.
4. WHEN a Node transitions between collapsed and expanded states, THE Graph_Renderer SHALL recompute the layout within 300ms so that remaining visible Nodes are repositioned without overlap.
5. THE Graph_Renderer SHALL initially render the graph with nodes at depth 0 and depth 1 expanded and nodes at depth 2 and deeper collapsed, to keep the default view navigable for large JSON payloads.
6. WHEN the user clicks a Node that has no children (leaf node), THE Graph_Renderer SHALL completely ignore the click, producing no layout state changes, no internal state changes, and no collapse/expand affordance. THE Graph_Renderer SHALL NOT display a collapse/expand affordance on leaf nodes.
7. WHEN the user clicks Reset Layout, THE Graph_Renderer SHALL restore the collapse/expand state of all Nodes to the initial default (depth 0 and 1 expanded, depth 2+ collapsed).

---

### Requirement 7: Node Visual Design

**User Story:** As a developer, I want nodes styled to match the C³ MindLoop dark-theme design system, so that the graph feels like a native part of the tool rather than an embedded third-party widget.

#### Acceptance Criteria

1. THE Graph_Renderer SHALL render each Node with a `#171717` (neutral-900) background fill, a 1px `#262626` (neutral-800) border, and `#f5f5f5` (neutral-100) base text color.
2. THE Graph_Renderer SHALL color JSON key labels with `#38bdf8` (sky-400), string values with `#34d399` (emerald-400), number values with `#fbbf24` (amber-400), boolean values with `#a78bfa` (purple-400), and null values with `#737373` (neutral-500) in italic style.
3. THE Graph_Renderer SHALL render Edges as curved bezier lines with `stroke: #404040` and an arrowhead indicator at the child Node end to convey directionality.
4. WHEN the user hovers over a Node, THE Graph_Renderer SHALL change that Node's border color to `#525252` (neutral-600) within one animation frame of the `mouseover` event, and SHALL retain that hover border color after the mouse leaves the Node without reverting to the default border.
5. THE Graph_Renderer SHALL render the viewport background as `#0a0a0a` (neutral-950) with a dot-grid pattern of 1px dots spaced 24px apart in `#262626` (neutral-800) color.
6. THE Graph_Renderer SHALL NOT render any inner title heading, branded logo, icon+title row, or subtitle section inside the Graph_View component.
7. WHEN a Node is selected (clicked), THE Graph_Renderer SHALL always update that Node's border rendering state to `#1D9BF0` (the tool's active blue), replacing the hover highlight.

---

### Requirement 8: Performance with Large Payloads

**User Story:** As a developer, I want the graph to remain interactive when working with JSON payloads up to 500 keys, so that the tool does not degrade for real-world API responses and config files.

#### Acceptance Criteria

1. WHEN parsedJSON contains up to 500 total keys, THE Graph_Renderer SHALL complete initial layout and first render within 2000ms as measured from the moment parsedJSON becomes available.
2. WHEN the raw JSON text in the Graph_Input_Panel contains more than 500 keys (as determined by a key count scan of the raw input text, independent of and prior to full parsing), THE JSON_Graph_Tool SHALL immediately display a persistent yellow warning banner stating performance may be affected, and SHALL still attempt to render once parsing completes.
3. WHEN the raw JSON text in the Graph_Input_Panel contains more than 2000 keys (as determined by a key count scan of the raw input text, independent of and prior to full parsing), THE JSON_Graph_Tool SHALL immediately display a red error banner stating the payload is too large for graph rendering, and SHALL render an empty placeholder (no Nodes or Edges) without initiating any graph construction or layout computation.
4. WHEN the total visible Node count exceeds 100, THE Graph_Renderer SHALL only render Nodes whose bounding boxes intersect the current viewport rectangle by explicitly evaluating viewport intersection via bounding box checks, re-evaluating visibility on each pan or zoom event, such that panning across the graph produces a smooth update within 100ms.

---

### Requirement 9: Graph View Export

**User Story:** As a developer, I want to export the graph as a PNG image, so that I can share or document the JSON structure visually.

#### Acceptance Criteria

1. THE Graph_Toolbar SHALL include an Export PNG button rendered with a download icon and `aria-label="Export as PNG"`.
2. WHEN the user clicks Export PNG, THE Graph_Renderer SHALL capture the entire graph canvas (all Nodes and Edges regardless of current viewport), and trigger a browser file download named `json-graph.png`.
3. WHEN the user clicks Export PNG, THE Graph_Renderer SHALL render the export with the `#0a0a0a` (neutral-950) background color preserved so the downloaded image matches the on-screen appearance.
4. WHILE the PNG export is being generated, THE Graph_Toolbar SHALL disable the Export PNG button and display a loading spinner in place of the download icon.
5. IF the graph canvas is empty (no Nodes rendered), THEN THE Graph_Renderer SHALL disable the Export PNG button and SHALL NOT initiate a download.
6. IF the PNG serialization fails (for example due to a tainted canvas from external resources), THEN THE Graph_Renderer SHALL display a toast notification stating "Export failed — use a screenshot instead" and SHALL re-enable the Export PNG button immediately after the error toast is shown, allowing the user to retry without a cooldown. IF the toast display itself fails, THE Export PNG button SHALL still be re-enabled.

---

### Requirement 10: Accessibility and Keyboard Navigation

**User Story:** As a developer, I want to operate the graph toolbar controls with the keyboard, so that the tool is usable without a mouse.

#### Acceptance Criteria

1. THE Graph_Toolbar buttons (Zoom In, Zoom Out, Fit_to_Screen, Reset Layout, Export PNG) SHALL each be reachable via keyboard Tab navigation and activatable via both the Enter and Space keys. A button that responds only to the Enter key SHALL NOT be considered compliant; both Enter AND Space key activation are required.
2. THE Graph_Toolbar buttons SHALL each have a descriptive `aria-label` attribute: `"Zoom in"`, `"Zoom out"`, `"Fit to screen"`, `"Reset layout"`, and `"Export as PNG"` respectively.
3. THE Graph_View container SHALL have `role="img"` and `aria-label="JSON graph visualization"` so screen readers identify the region.
4. WHILE a Graph_Toolbar button is keyboard-focused, THE Graph_Renderer SHALL display a visible `2px solid #1D9BF0` focus ring around that button, consistent with the tool's existing focus style.
5. WHEN a Graph_Toolbar button is disabled, THE button SHALL have `tabindex="-1"` and `aria-disabled="true"` set so that keyboard focus skips disabled buttons, AND SHALL be functionally non-interactive (not responding to pointer or keyboard events).
