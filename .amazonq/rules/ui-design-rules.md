# C³ MindLoop — Amazon Q UI Design Rules

## RULE: Single Heading Policy for Tool Pages

Every tool page must have ONLY ONE top-level H1 title, rendered outside/above the tool workspace container (in the page breadcrumb + metadata header area).

### DO NOT:
- Render a duplicate inner title header, logo box, icon+title row, or subtitle inside the tool/editor component card.
- Add a branded header section at the top of any `*Tool.tsx` component (e.g., no `<h2>JSON Formatter & Validator</h2>` inside the card).

### DO:
- Start the tool card directly with the action toolbar row (Format, Minify, Decode, Copy, Upload, Download, Spacing options).
- Keep the status badge (e.g., `Client-Side`) in the bottom footer bar or the toolbar row — never in a separate header block.
- Place all primary action controls at the top row of the editor card to maximize vertical editor workspace.

### Pattern (correct):
```
[Page: JwtInspectorPage.tsx]
  <h1>JWT Inspector & Token Decoder</h1>   ← ONLY heading
  <JwtInspectorTool />                      ← starts directly with toolbar

[Component: JwtInspectorTool.tsx]
  <div card>
    <div toolbar>  ← FIRST element: action buttons (Decode, Sample, Clear, Copy)
    <div panels>   ← editor panels
    <div footer>   ← status + privacy note
  </div>
```

### Applies to:
- `JsonFormatterTool.tsx`
- `JwtInspectorTool.tsx`
- All future `*Tool.tsx` components (Base64Tool, HashGeneratorTool, RegexTool, etc.)
