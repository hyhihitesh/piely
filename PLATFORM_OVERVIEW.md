# Piely: Platform Blueprint (State of the Union V2)

**Piely** is a high-performance, AI-native startup architect platform designed to transform raw ideas into executable, technical roadmaps. It combines venture capital-grade analysis with a technical blueprint aesthetic.

---

## 🚀 Core Product Features

### 1. Smart Scoping (AI Interviewer)

- **Conversational Onboarding**: A real-time streaming AI chat that interviews the founder to refine their vision.
- **Automated Stage Logic**: The system identifies if the startup is in the `Validation`, `Build`, or `Growth` stage based on user responses and initializes the workspace accordingly.

### 2. The Living Canvas (Graph Engine)

- **Technical Visualizer**: Built with React Flow, providing a blueprint-style graph of the startup's journey.
- **Node Hierarchy**:
  - **Technical Nodes**: Represent core milestones with status tracking (Pending, In-Progress, Completed).
  - **Stage Nodes**: Group milestones into logical chronological phases.
- **Dynamic Layout**: Custom layout engine that optimizes node placement based on dependencies.

### 3. Generative OS Modules

On-demand generation of complex startup assets using structured JSON output:

- **Financial Model**: 3-year projections, burn-rate analysis, and metric cards.
- **Market Analysis**: TAM/SAM/SOM sizing and competitor landscapes.
- **Pitch Deck Architect**: Slide-by-slide narrative structure and "The Ask".
- **GTM Strategy**: Channel prioritization and launch timelines.
- **AI UI Blocks**: Data is rendered via custom Metric, Chart (Recharts), and Table widgets.

### 4. Continuous AI Co-Founder

- **AI SDK v6 Chat**: A streaming-first sidebar chat that remains in-context with the project.
- **Actionable Intelligence**: The AI can trigger roadmap updates or suggest new module generations directly through the chat stream.

---

## 🛠️ Technical Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19.
- **AI Core**: Vercel AI SDK v6 (Full implementation of `generateObject` and `streamText`).
- **Database**: Supabase PostgreSQL with strict Row Level Security (RLS).
- **Authentication**:
  - **Web3**: Solana Wallet Adapter Integration (Phantom/Solflare).
  - **Web2**: Google/GitHub OAuth and Secure Email.
- **Styling**: Tailwind CSS 4 with a dedicated "Technical Blueprint" design system (Glassmorphism, OLED Dark Mode, Notion Light Mode).

### Engineering Standards

- **Strict Typing**: 100% TypeScript coverage with zero `: any` or `as any` assertions in the source directory.
- **Schema Validation**: Every AI interaction is bound by `Zod` schemas to ensure data integrity.
- **Architecture**: Unified Supabase client utilities and modular `Server Action` patterns.
- **Resiliency**: Cross-application error boundaries and intelligent 404 fallbacks.

---

## 📈 Search & Research

- **Exa.ai Integration**: Directly integrated research engine that fetches real-time competitor data and market trends to ground AI generations in reality.

---

## 🎨 Design Philosophy

The platform follows a **"Technical Glass"** aesthetic:

- **Fonts**: Poppins (Heading) & Lora (Body).
- **Colors**: Cyclic accent system (Orange/Blue/Green) against a high-contrast background.
- **Feel**: Low-latency, high-transparency interface that makes the startup data feel precise and "architected."
