# Personal Developer OS — hzcode.my.id

[![CI Pipeline](https://github.com/Harinzu47/khalid-portofolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Harinzu47/khalid-portofolio/actions)
[![Database Drift Check](https://github.com/Harinzu47/khalid-portofolio/actions/workflows/db-check.yml/badge.svg)](https://github.com/Harinzu47/khalid-portofolio/actions)
[![Security Scan](https://github.com/Harinzu47/khalid-portofolio/actions/workflows/security-scan.yml/badge.svg)](https://github.com/Harinzu47/khalid-portofolio/actions)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)
[![Supabase SSR](https://img.shields.io/badge/Supabase-SSR-3ECF8E?logo=supabase)](https://supabase.com/)

A high-performance, single-tenant, terminal-themed **Personal Developer Operating System** built for **Khalid Jundullah** ([hzcode.my.id](https://hzcode.my.id)). Seamlessly unifying systems architecture case studies, engineering logs, networking certifications, research articles, relational knowledge graph visualizers, and an interactive shell emulator.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    Client["Client Browser\n(HTTP/3, TLS 1.3)"]
    
    subgraph Edge ["Edge & Reverse Proxy Layer"]
        Caddy["Caddy Server / Cloudflare Edge\n(Automatic HTTPS, Gzip, Zstd)"]
        NextProxy["Next.js Proxy Middleware\n(CSP, HSTS, Rate Limiting, SSR Auth)"]
    end

    subgraph AppServer ["Application Runtime (Node.js 22 Standalone)"]
        Router["Next.js 16 App Router\n(React 19 Server Components)"]
        ServerActions["Mutation Server Actions\n(requireAuth, Zod Validation, Audit Logger)"]
        Services["Domain Service Layer\n(Articles, Projects, Journal, Graph, Analytics)"]
    end

    subgraph DatabaseLayer ["Data & Storage Plane"]
        Drizzle["Drizzle ORM Engine\n(Connection Pooling, Prepared Queries)"]
        Postgres[("PostgreSQL 16 Database\n(25 Relational Tables, RLS, B-Tree Composite Indexes)")]
        SupabaseStorage[("Supabase Storage\n(portfolio Bucket)")]
    end

    Client --> Caddy
    Caddy --> NextProxy
    NextProxy --> Router
    Router --> Services
    Client -.->|"RPC Form Submissions"| ServerActions
    ServerActions --> Services
    Services --> Drizzle
    Drizzle --> Postgres
    Services --> SupabaseStorage
```

---

## 🗄️ Database Entity Relationship (ERD)

```mermaid
erDiagram
    PROFILES ||--o{ SOCIAL_LINKS : has
    ORGANIZATIONS ||--o{ CAREER_EXPERIENCES : employs
    PROJECTS ||--o{ PROJECT_MEDIA : includes
    PROJECTS ||--o{ PROJECT_TECHNOLOGIES : uses
    PROJECTS ||--o{ PROJECT_SKILLS : demonstrates
    PROJECTS ||--o{ PROJECT_LINKS : exposes
    ARTICLES ||--o{ ARTICLE_TAGS : tagged_with
    ARTICLES ||--o{ ARTICLE_PROJECTS : references
    JOURNAL_ENTRIES ||--o{ JOURNAL_TAGS : tagged_with
    JOURNAL_ENTRIES ||--o{ JOURNAL_PROJECTS : relates_to
    JOURNAL_ENTRIES ||--o{ JOURNAL_TECHNOLOGIES : logs_tech
    SKILLS ||--o{ PROJECT_SKILLS : linked_in
    TECHNOLOGIES ||--o{ PROJECT_TECHNOLOGIES : linked_in
    TAGS ||--o{ ARTICLE_TAGS : categorizes
    TAGS ||--o{ JOURNAL_TAGS : categorizes
    AUDIT_LOGS ||--o{ PROFILES : recorded_by
```

---

## ⚡ Key Features

- **Interactive Terminal CLI (`/terminal`)**: Full virtual filesystem shell supporting `ls`, `cd`, `pwd`, `cat`, `open`, `whoami`, `neofetch`, and tab autocompletion. Omnipresent modal accessible anywhere via `` ` `` (backtick) or `Ctrl+~`.
- **Relational Knowledge Graph (`/graph`)**: Interactive HTML5 Canvas physics engine mapping multidimensional connections across projects, skills, technologies, articles, and journal logs.
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: Cross-domain fuzzy search with keyboard navigation and WCAG 2.1 AA combobox semantics.
- **Operator Admin Studio (`/admin`)**: Single-tenant administration cockpit with audit logs, telemetry metrics, full JSON backup export, and CRUD interfaces for all 25 entities.
- **Multi-Theme Engine & CRT Scanlines**: Instant theme switching between **Obsidian Dark**, **Matrix Green**, **Amber CRT**, **Cyberpunk Neon**, and **Nord Frost** with zero flash (FOUC).
- **Hardened Security & Rate Limiting**: Strict Content Security Policy (CSP), HSTS, CSRF protection, and in-memory sliding window rate limiters.
- **Full SEO & Syndication Engine**: Dynamic `/rss.xml` feed, dynamic `/sitemap.xml`, `robots.txt`, Edge `ImageResponse` OpenGraph cards (`/api/og`), and Person JSON-LD schemas.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 20.x (Recommended: Node 22 LTS)
- Docker & Docker Compose (or local PostgreSQL 16)

### 1. Clone & Install
```bash
git clone https://github.com/Harinzu47/khalid-portofolio.git
cd khalid-portofolio
npm install
```

### 2. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Fill in your database and Supabase credentials in `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Migration & Seeding
```bash
# Generate and execute schema migrations
npm run db:migrate

# Seed baseline projects, articles, credentials, and operator profile
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Production Stack

To run the complete production stack (Next.js Standalone + PostgreSQL 16 + Caddy TLS Reverse Proxy):

```bash
docker compose up -d --build
```

---

## 🧪 Testing & Validation

```bash
# Run automated Vitest unit & integration test suites
npm run test

# Run ESLint validation
npm run lint

# Run strict TypeScript compiler verification
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## 📁 Project Structure

```
khalid-portofolio/
├── .github/workflows/          # CI/CD pipelines (ci.yml, db-check.yml, security-scan.yml)
├── content/                    # MDX articles, journal entries, and case studies
├── docs/                       # Architectural knowledge base and runbooks
│   ├── architecture/           # System design & database schemas
│   ├── deployment/             # DEPLOYMENT_GUIDE.md & DISASTER_RECOVERY.md
│   └── product/                # PRD & operator workflow specifications
├── public/                     # Static media and icons
├── src/
│   ├── actions/                # Server Actions with requireAuth() and audit logging
│   ├── app/                    # Next.js 16 App Router pages & API routes
│   │   ├── (public)/           # Landing, /projects, /articles, /journal, /notes, /graph, /terminal
│   │   ├── admin/              # Operator Admin Studio workspaces
│   │   ├── api/health/         # Health & latency telemetry endpoint
│   │   ├── api/og/             # Edge ImageResponse OpenGraph card generator
│   │   └── rss.xml/            # Dynamic RSS 2.0 feed generator
│   ├── components/             # UI component library & terminal primitives
│   ├── db/                     # Drizzle ORM schema, client, migrations & seeds
│   ├── features/               # Knowledge graph & MDX processing engines
│   ├── lib/                    # Security, rate-limit, auth, JSON-LD, and reading time utilities
│   ├── services/               # Data access & business logic service layer
│   └── validations/            # Zod validation schemas
├── Caddyfile                   # Production HTTPS reverse proxy config
├── Dockerfile                  # Multi-stage production container definition
├── docker-compose.yml          # Containerized application stack
└── vitest.config.ts            # Automated test runner configuration
```

---

## 🔒 Security & Disaster Recovery

- **Authentication**: Single-tenant Supabase Auth with HTTP-only encrypted session cookies and server-side route guards (`requireAuth()`).
- **Authorization**: Row Level Security (RLS) policies preventing unlisted draft leaks to anonymous viewers or feeds.
- **Disaster Recovery**: Backups can be exported directly as JSON snapshots via `/admin/settings` or restored via PostgreSQL custom dumps as documented in [`docs/deployment/DISASTER_RECOVERY.md`](docs/deployment/DISASTER_RECOVERY.md).

---

## 📄 License & Operator

Designed and maintained by **Khalid Jundullah** ([hzcode.my.id](https://hzcode.my.id)). Released under the [MIT License](LICENSE).
