<div align="center">

# ⚡ C³ MindLoop

**Privacy-First Developer Utilities, Interactive Runtime Visualizers & Real-Time Collaboration**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P_Sync-orange?style=for-the-badge&logo=webrtc)](https://webrtc.org/)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%99%A5-ff69b4?style=for-the-badge&logo=github)](https://github.com/sponsors/shubhamprajapati1202)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/shubhamprajapati1202)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  A high-performance developer workspace engineered with zero server retention, native browser cryptography, and peer-to-peer real-time collaboration.
</p>

[Explore Tools](#-tool-suite) • [Key Highlights](#-key-highlights) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 🌟 Key Highlights

* **🔒 100% Client-Side Privacy:** Your tokens, API payloads, database connection strings, and code snippets never hit external servers. Verification, hashing, and parsing execute exclusively in-browser via the native **Web Crypto API** and Web Workers.
* **🤝 Peer-to-Peer Real-Time Collaboration:** Debug cURL commands and inspect payloads with peers in real-time. Powered by **Yjs** and **WebRTC** with end-to-end URL-hash password protection—room secrets are never transmitted across HTTP headers.
* **🧠 Interactive Runtime Visualizers:** Step-by-step visualizers for JavaScript call stacks, Node.js libuv event loop phases, Git tree branch workflows, and Regex railroad state machines.
* **⚡ Modern Next.js 16 & React 19 Stack:** Built on the bleeding edge using Next.js App Router, Tailwind CSS v4, Motion, and `@xyflow/react`.

> 💖 **Support Open Source:** If C³ MindLoop saves you time or helps your workflow, consider [Sponsoring on GitHub](https://github.com/sponsors/shubhamprajapati1202) or [Buying me a coffee](https://buymeacoffee.com/shubhamprajapati1202). Every contribution keeps these tools 100% free & ad-free!

---

## 🛠️ Tool Suite

C³ MindLoop bundles 20+ specialized utilities categorized into four pillars:

### 1. 🛡️ Security & Identity
| Tool | Description |
| :--- | :--- |
| **[JWT Inspector](https://github.com/shubhamprajapati1202/c3mindloop)** | Decode header & payload, audit common security flaws, and verify HMAC/RSA signatures locally in-browser. |
| **[Hash & HMAC Studio](https://github.com/shubhamprajapati1202/c3mindloop)** | Compute SHA-256, SHA-512, MD5, and HMAC secrets with sub-millisecond local latency. |
| **[Password Shuffle Generator](https://github.com/shubhamprajapati1202/c3mindloop)** | Cryptographically secure entropy generator with custom charset controls. |

### 2. 🎬 Runtime & Visualizers
| Tool | Description |
| :--- | :--- |
| **[JS Event Loop Visualizer](https://github.com/shubhamprajapati1202/c3mindloop)** | Interactive step-through of Call Stack, Microtask Queue (Promises), and Macrotask Queue (Timers). |
| **[Node.js Event Loop Visualizer](https://github.com/shubhamprajapati1202/c3mindloop)** | Deep dive into libuv lifecycle: Timers, Pending I/O, Poll, Check (`setImmediate`), and Close phases. |
| **[Regex Railroad Generator](https://github.com/shubhamprajapati1202/c3mindloop)** | Convert complex regular expressions into clean, interactive syntax railway diagrams. |
| **[Git Visualizer](https://github.com/shubhamprajapati1202/c3mindloop)** | Interactive graph simulation of branching, merging, rebasing, and cherry-picking. |
| **[Cron Schedule Visualizer](https://github.com/shubhamprajapati1202/c3mindloop)** | Human-readable cron parser with next execution projections and timezone triggers. |
| **[JSON Graph Explorer](https://github.com/shubhamprajapati1202/c3mindloop)** | Interactive node-link visualizer for deeply nested JSON objects using React Flow. |

### 3. ⚙️ Code, API & Conversion
| Tool | Description |
| :--- | :--- |
| **[cURL to Code Converter (Collaborative)](https://github.com/shubhamprajapati1202/c3mindloop)** | Convert raw cURL commands into clean Fetch, Axios, Python, Go, and Node.js code with live WebRTC co-editing. |
| **[Code Complexity Analyzer](https://github.com/shubhamprajapati1202/c3mindloop)** | AST-based cyclomatic complexity calculation and maintainability index without uploading source code. |
| **[SQL to JSON Converter](https://github.com/shubhamprajapati1202/c3mindloop)** | Instant table schema and query dump parsing to structured JSON collections. |
| **[Diff Checker](https://github.com/shubhamprajapati1202/c3mindloop)** | High-precision visual side-by-side and unified diffs with line-level change tracking. |
| **[Base64 Encoder/Decoder](https://github.com/shubhamprajapati1202/c3mindloop)** | Safe binary, UTF-8, and URL-safe Base64 conversions. |
| **[JSON Formatter & Validator](https://github.com/shubhamprajapati1202/c3mindloop)** | Syntax validation, minification, tree inspector, and repair suggestions. |

### 4. 🚀 Workflow & AI Productivity
| Tool | Description |
| :--- | :--- |
| **[AI Prompt Context Builder](https://github.com/shubhamprajapati1202/c3mindloop)** | Structured prompt packager with automatic regex redaction of API keys, DB URIs, and credentials. |
| **[Workflow Canvas Builder](https://github.com/shubhamprajapati1202/c3mindloop)** | Drag-and-drop pipeline and automation design canvas powered by `@xyflow/react`. |
| **[PDF Suite & Editor](https://github.com/shubhamprajapati1202/c3mindloop)** | Browser-based PDF manipulation, merging, rotation, and metadata management via `pdf-lib`. |
| **[ATS Resume Generator](https://github.com/shubhamprajapati1202/c3mindloop)** | Machine-readable resume generator optimized for modern applicant tracking algorithms. |
| **[QR Code Generator](https://github.com/shubhamprajapati1202/c3mindloop)** | Customizable QR codes with embedded logos, error correction levels, and vector SVG exports. |

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `20.x` or higher
* **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shubhamprajapati1202/c3mindloop.git
   cd c3mindloop
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables (Optional):**
   ```bash
   cp .env.example .env.local
   ```
   *Most tools run entirely offline in the browser without any API keys.* AI-assisted features optionally read `GEMINI_API_KEY`.

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the workspace.

---

## 🏗️ Architecture

```
c3mindloop/
├── app/
│   ├── api/                    # Serverless endpoints (Contact, reCAPTCHA verification)
│   ├── components/
│   │   ├── collaboration/      # WebRTC P2P sync rooms, status bars, awareness indicators
│   │   ├── sections/           # Landing page showcases & hero components
│   │   ├── tools/              # Core tool client components (JWT, Visualizers, cURL, etc.)
│   │   └── ui/                 # Shared accessible UI components
│   ├── lib/
│   │   ├── collaboration/      # Yjs WebRTC provider, crypto room hasher & reconnection logic
│   │   ├── workflow/           # React Flow nodes, pipeline execution models
│   │   └── constants.ts        # Global educational guides & technical documentation
│   └── tools/                  # Next.js App Router dynamic tool pages
├── public/                     # Static assets, icons, and illustrations
├── .env.example                # Template for environment configuration
└── package.json                # Project dependencies and workspace scripts
```

### 🔒 Security Principles

* **Native Web Crypto:** All hash routines and signature checks tap into `window.crypto.subtle`.
* **Zero Storage of Inputs:** No database persists your inspected tokens, cURL commands, or diff files.
* **Hash-Fragment Routing for WebRTC:** Shared collaborative room identifiers and passwords exist only behind `#` fragments (e.g. `#collab=room-id&pwd=...`), meaning browser user-agents never send encryption keys to the server.

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---

## 💖 Support & Sponsorship

If you find C³ MindLoop useful for your daily workflow, consider supporting development:

* **[Sponsor on GitHub](https://github.com/sponsors/shubhamprajapati1202)**: Direct recurring or one-time sponsorship.
* **[Buy Me a Coffee](https://buymeacoffee.com/shubhamprajapati1202)**: Quick one-time developer support.
* **Star the Repo**: Give us a ⭐ on GitHub to help more engineers find these tools!

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/shubhamprajapati1202">Shubham Prajapati</a> and open-source contributors.</sub>
</div>
