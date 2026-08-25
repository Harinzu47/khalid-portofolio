/**
 * Virtual Filesystem & Command Execution Engine for the Interactive Terminal CLI
 */

export interface VirtualFile {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  url?: string;
  children?: Record<string, VirtualFile>;
}

export const VIRTUAL_FS: VirtualFile = {
  name: '/',
  type: 'dir',
  children: {
    'about.txt': {
      name: 'about.txt',
      type: 'file',
      content: `=======================================================
OPERATOR: Khalid Jundullah
ROLE: Network & Infrastructure Engineer → Fullstack Dev
CERTIFICATIONS: MikroTik Certified Network Associate (MTCNA)
LOCATION: Indonesia
WEBSITE: https://hzcode.my.id
GITHUB: https://github.com/Harinzu47
=======================================================
Systems Architect specializing in Cloud Native Infrastructure,
Enterprise Network Routing (BGP, OSPF, VLANs), Docker/Kubernetes,
and High-Performance Fullstack TypeScript/Next.js/PostgreSQL applications.`,
    },
    'contact.json': {
      name: 'contact.json',
      type: 'file',
      content: JSON.stringify(
        {
          name: 'Khalid Jundullah',
          email: 'harinzu47@gmail.com',
          website: 'https://hzcode.my.id',
          github: 'https://github.com/Harinzu47',
          linkedin: 'https://www.linkedin.com/in/khalid-jundullah-8086b8249',
          status: 'Open for Infrastructure, Cloud & Fullstack Engineering roles',
        },
        null,
        2
      ),
    },
    projects: {
      name: 'projects',
      type: 'dir',
      children: {
        'atur-modal.md': {
          name: 'atur-modal.md',
          type: 'file',
          url: '/projects/atur-modal',
          content: `# AturModal — Microfinance ERP & Audit Engine
Stack: Next.js, TypeScript, PostgreSQL, Drizzle ORM, Supabase
URL: /projects/atur-modal
Description: Multi-tier microfinance accounting, transaction auditing, and financial reporting system.`,
        },
        'flc-lms.md': {
          name: 'flc-lms.md',
          type: 'file',
          url: '/projects/flc-lms',
          content: `# FLC LMS — Interactive Cloud Educational Platform
Stack: Next.js, Tailwind CSS, TypeScript, PostgreSQL
URL: /projects/flc-lms
Description: High-concurrency educational platform for live interactive video courses and grading workflows.`,
        },
        'esg-sentiment.md': {
          name: 'esg-sentiment.md',
          type: 'file',
          url: '/projects/esg-sentiment-analysis',
          content: `# ESG Sentiment Analyzer — FinTech NLP Intelligence
Stack: Python, FastAPI, HuggingFace Transformers, Next.js
URL: /projects/esg-sentiment-analysis
Description: NLP engine parsing ESG corporate filings and financial news for compliance scoring.`,
        },
      },
    },
    articles: {
      name: 'articles',
      type: 'dir',
      children: {
        'network-automation.md': {
          name: 'network-automation.md',
          type: 'file',
          url: '/articles',
          content: `# Network Automation with Python and RouterOS API
Deep dive into programmatic VLAN management, QoS profiling, and automated backup pipelines across MikroTik hardware.`,
        },
        'postgres-indexing.md': {
          name: 'postgres-indexing.md',
          type: 'file',
          url: '/articles',
          content: `# PostgreSQL B-Tree Indexing & Composite Keys Optimization
Analysis of high-throughput query execution plans, heap scans, and partial index selection for multi-tenant data structures.`,
        },
      },
    },
    journal: {
      name: 'journal',
      type: 'dir',
      children: {
        '2026-08-mtcna-prep.md': {
          name: '2026-08-mtcna-prep.md',
          type: 'file',
          url: '/journal/mtcna-exam-prep',
          content: `# MTCNA Routing Fundamentals & Subnetting Lab Logs
Reflections on packet flow diagrams, bridging vs routing, and firewall filter chain optimization.`,
        },
        '2026-08-n1-query-fix.md': {
          name: '2026-08-n1-query-fix.md',
          type: 'file',
          url: '/journal/fixing-n1-query',
          content: `# Eliminating N+1 Query Bottlenecks in Drizzle ORM
Benchmarking lateral joins vs relational eager loading in high-traffic APIs.`,
        },
      },
    },
    skills: {
      name: 'skills',
      type: 'dir',
      children: {
        'networking.txt': {
          name: 'networking.txt',
          type: 'file',
          content: `NETWORKING COMPETENCIES:
• MikroTik RouterOS (MTCNA Certified)
• Routing Protocols (BGP, OSPF, RIP, Static)
• Switching & VLANs (802.1Q, Trunking, Port Isolation)
• Firewalls & NAT (Mangle, Filter Chains, Port Forwarding)
• VPN Technologies (WireGuard, OpenVPN, IPsec, L2TP/IPsec)
• Wireless Infrastructure (CAPsMAN, Mesh, PtP Links)`,
        },
        'infrastructure.txt': {
          name: 'infrastructure.txt',
          type: 'file',
          content: `INFRASTRUCTURE & DEVOPS:
• Linux System Administration (Ubuntu, Debian, Alpine, CentOS)
• Containerization (Docker, Multi-Stage Builds, Compose)
• Orchestration (Kubernetes, Helm, K3s)
• Web Servers & Proxies (Nginx, Traefik, Caddy, Cloudflare)
• CI/CD Pipelines (GitHub Actions, GitLab CI)`,
        },
        'software.txt': {
          name: 'software.txt',
          type: 'file',
          content: `SOFTWARE ENGINEERING:
• TypeScript & JavaScript (ESNext, Node.js, Bun)
• Frontend (Next.js 16 App Router, React 19, Tailwind CSS)
• Backend (Node.js, FastAPI Python, Laravel PHP, Go)
• Databases (PostgreSQL 16, Drizzle ORM, Supabase, Redis)`,
        },
      },
    },
  },
};

export const NEOFETCH_ART = `
  /\\_    /\\_   khalid@hzcode-os
 (  o.o  )   -------------------
  >  ^  <    OS: Personal Developer OS 2.0.0
             Host: hzcode.my.id (Cloudflare + Vercel Edge)
             Kernel: Linux 6.8.0-x86_64-hzcode
             Uptime: 99.98% High Availability
             Packages: Next.js 16, React 19, Drizzle ORM, Supabase
             Shell: hz-term v2.0 (xterm-256color)
             Theme: Terminal Obsidian / Green (#3fb950)
             CPU: AMD EPYC Virtual Core @ 3.40GHz
             Memory: 1024MB / 2048MB (Active)
`;
