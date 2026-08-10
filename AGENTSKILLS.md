# C³ MindLoop — Persistent AI Guidelines & Human Design Rules

## 1. CORE BRAND & POSITIONING
- Brand Name: C³ MindLoop (Coding. Crashing. Crying.)
- Identity: A practical, reality-first developer utility platform and open-source project space.
- NO FICTIONAL CLAIMS: Never invent fake SaaS suites, enterprise platforms, autonomous AI clouds, fake testimonials, or fake user statistics. Only showcase real built tools and real projects (e.g., Office Editor VS Code Extension).

## 2. STRICT ANTI-AI-SLOP CONTENT RULES
- DO NOT USE ROBOTIC BUZZWORDS: Never write "Seamless", "Paradigm", "Crafted with passion", "Empowering", "Ecosystem", "Revolutionary", "Real engineering craft", "Leverage".
- TONE: Plain, direct, concise developer-to-developer English. State what the utility does, provide clear controls, and stop.
- NO DECORATIVE MARKETING PILLS: Remove meaningless subtitles like "— Real engineering craft" or exaggerated claim badges.

## 3. UI/UX DESIGN SYSTEM & VISUAL GUIDELINES
- NO NEON GREEN OVERKILL: Avoid bright glowing green (`#00FF00`) text, shield icons, or redundant security badges (e.g., green lock + green shield + checkmark stacked together).
- CLEAN STATUS INDICATORS: Keep status tags ultra-clean and muted (e.g., monospace `Client-Side` or `Local Browser Engine` in `text-neutral-400`).
- NO MYSTIC / ASTROLOGY GRAPHICS: Completely ban spinning 3D wireframe rings, rotating astrologer-style background grids, and glowing background orbs. Keep backgrounds solid or subtle (`bg-neutral-950`).
- NATIVE INTEGRATION LOOK: Tools (JSON Formatter, Base64, etc.) must look like clean native developer tools (e.g., Chrome DevTools or VS Code panels) with crisp 1px borders (`border-neutral-800`).
- CURSOR INTERACTION: Ensure custom cursors never block text on hover (`scale-50`, `opacity-30` or hidden over interactive text/buttons).

## 4. ARCHITECTURE & DEVELOPMENT RULES
- CLIENT-SIDE FIRST: Whenever possible, process data 100% locally in the user's browser using JavaScript / WASM.
- NO UNNECESSARY BACKEND: Do not introduce databases, auth, or server APIs unless explicitly required.
- REAL PROJECTS: Highlight authentic projects like the VS Code "Office Editor" extension with real marketplace metrics (14.4k+ installs).

## 5. UI DESIGN RULE: Single Heading Policy for Tool Pages
- Every tool page must have ONLY ONE top-level H1 title, rendered outside/above the tool workspace container (breadcrumb + metadata header area in the `*Page.tsx` file).
- DO NOT render a duplicate inner title header, icon+title row, logo box, or subtitle inside any `*Tool.tsx` component card.
- Tool cards must start directly with the action toolbar row (Format, Minify, Decode, Copy, Upload, Download, Spacing options).
- Status badges (`Client-Side`, `Local Browser Engine`) belong in the bottom footer bar or inline in the toolbar — never in a separate header block inside the tool card.
- This rule applies to: `JsonFormatterTool.tsx`, `JwtInspectorTool.tsx`, and ALL future `*Tool.tsx` components.
