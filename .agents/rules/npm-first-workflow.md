# Package-First Development Rule

When building any flow, visual component, diagram, parser, or tool:

1. **Check for Existing NPM Packages First**:
   - Always search and check if there is an established, well-maintained NPM package that already solves the problem (e.g., `@xyflow/react` for workflow nodes/canvases, `diff` for diffing, `qrcode` for QR rendering, etc.).
   - Verify compatibility with the project's dependencies (e.g., React 19, Next.js App Router).
   - If an appropriate package exists, use it instead of writing custom low-level math/DOM plumbing from scratch.

2. **Custom Code as Fallback Only**:
   - Only write custom low-level implementations if no suitable, compatible NPM package exists or if external packages cannot satisfy the privacy/zero-server requirements.
