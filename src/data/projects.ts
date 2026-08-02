import { Project } from '@/types';

/**
 * Project data for hzcode.my.id
 * Four pillars: Infra | Networking | Web Dev | AI
 */
export const projects: Project[] = [
  // ─── INFRA ────────────────────────────────────────────────────────────────
  {
    slug: 'flc-lms',
    title: 'FLC Learning Management System',
    shortDescription:
      'Full-featured Laravel TALL-stack LMS deployed on Docker with a CI/CD pipeline and a full security audit.',
    image: '/images/projects/flc-lms.png',
    fullContent: `
# FLC Learning Management System

## Overview
A production-grade Learning Management System built for FLC (Future Learning Center), handling course management, student enrollment, automated assessments, and real-time progress tracking. The project scope included infrastructure setup, Docker deployment, a full CI/CD pipeline, and a thorough security audit.

## Problem / Context
The client needed a reliable e-learning platform capable of serving hundreds of concurrent users, with zero-downtime deployments and traceable security posture. The previous solution was a plain PHP application with no containerization and manual FTP deployments.

## Architecture
The system uses a TALL-stack (Tailwind CSS, Alpine.js, Laravel, Livewire) for the application layer, containerized via Docker Compose for reproducible environments:

\`\`\`yaml
services:
  app:
    build: .
    restart: unless-stopped
    depends_on: [db, redis]
  db:
    image: mysql:8.0
    volumes: [db_data:/var/lib/mysql]
  redis:
    image: redis:alpine
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
\`\`\`

GitHub Actions handles CI/CD: on every push to \`main\`, the pipeline runs PHPUnit tests, builds the Docker image, and deploys to the VPS via SSH.

## Key Technical Decisions
- **Docker Compose** for dev/prod parity — eliminated "works on my machine" issues
- **GitHub Actions** pipeline with test → build → deploy stages
- **Redis** for session storage and queue driver — decoupled job processing
- **Let's Encrypt via Certbot** in the nginx container for automatic HTTPS renewal
- **Laravel Policies + Gates** for fine-grained RBAC (admin, instructor, student roles)

## Challenges & Fixes
| Challenge | Fix |
|-----------|-----|
| N+1 queries on leaderboard | Eager-loaded \`with('user', 'course')\` relationships |
| WebSocket conflicts on shared hosting | Migrated to VPS + Laravel Reverb |
| Zero-downtime deploy | Implemented blue-green swap via Nginx upstream switch |
| SQL injection in legacy endpoints | Full audit + parameterized queries + Eloquent ORM migration |

## Security Audit Findings
- Replaced all raw SQL queries with Eloquent
- Added CSRF tokens to all AJAX forms
- Enforced rate limiting on login endpoint (5 req/min)
- Added Content-Security-Policy headers via middleware
- Rotated all secrets to \`.env\` + Docker secrets

## Results
- Deployed to production with 99.9% uptime over 8 months
- CI/CD pipeline reduces deployment time from ~20 min (manual) to ~4 min
- Security audit cleared with 0 critical vulnerabilities
- Handles 200+ concurrent users on a 2-core VPS via Redis queuing
    `,
    technologies: ['Laravel', 'Livewire', 'Alpine.js', 'Tailwind CSS', 'Docker', 'MySQL', 'Redis', 'Nginx', 'GitHub Actions', 'Let\'s Encrypt'],
    category: 'Infra',
    github: 'https://github.com/Harinzu47/flc-lms',
    year: 2025,
  },

  // ─── NETWORKING ───────────────────────────────────────────────────────────
  {
    slug: 'gns3-vlan-lab',
    title: 'GNS3 Enterprise VLAN & OSPF Lab',
    shortDescription:
      'Multi-site enterprise network simulation using GNS3 with MikroTik RouterOS — VLANs, OSPF, inter-VLAN routing, and firewall rules.',
    image: '/images/projects/gns3-vlan-lab.png',
    fullContent: `
# GNS3 Enterprise VLAN & OSPF Lab

## Overview
A comprehensive network lab simulation built in GNS3, modeling an enterprise with three sites interconnected via OSPF. The topology covers VLAN segmentation, inter-VLAN routing on MikroTik CRS switches, OSPF area design, and firewall chain rules — all verified with packet captures.

## Problem / Context
As part of MTCNA preparation and hands-on networking practice, I designed a lab that mirrors real-world enterprise requirements: segmented VLANs per department, dynamic routing between sites, and a perimeter firewall policy.

## Topology
\`\`\`
[Site A — HQ]          [Site B — Branch]      [Site C — DC]
MikroTik CCR2004  <--> MikroTik RB750Gr3  <--> MikroTik CRS326
  VLAN 10 (Mgmt)         VLAN 20 (Staff)        VLAN 30 (Servers)
  VLAN 11 (Users)        VLAN 21 (Printer)      VLAN 31 (Backup)
\`\`\`

OSPF Area 0 (backbone) links all three sites over simulated WAN links. Each site uses area-specific LSAs. Stub areas configured for branch sites to reduce routing table overhead.

## Key Technical Decisions
- **MikroTik RouterOS** for all routing/switching (mirrors production gear)
- **OSPF** over static routing — enables automatic failover on link failure
- **802.1Q VLAN trunking** between switches; access ports per department
- **Firewall chains**: input (router itself), forward (transit), output — explicit allow/deny lists

## MikroTik VLAN Configuration
\`\`\`routeros
# Create bridge and VLANs
/interface bridge add name=bridge1 vlan-filtering=yes
/interface bridge vlan
  add bridge=bridge1 tagged=ether1 vlan-ids=10,11,20
/interface vlan
  add interface=bridge1 name=vlan10 vlan-id=10
  add interface=bridge1 name=vlan20 vlan-id=20

# OSPF setup
/routing ospf instance add name=default router-id=10.0.0.1
/routing ospf area add name=backbone area-id=0.0.0.0 instance=default
/routing ospf interface-template add area=backbone interfaces=ether2 type=ptp
\`\`\`

## Challenges & Fixes
| Challenge | Fix |
|-----------|-----|
| OSPF neighborship flapping on GNS3 | Set hello/dead timer explicitly (hello=10, dead=40) |
| VLAN tag mismatch between switches | Enabled vlan-filtering on bridge + verified with packet capture |
| Inter-VLAN traffic blocked | Added IP routes per VLAN interface + firewall forward accept rule |
| STP loops in ring topology | Enabled RSTP on bridge; designated port manually set |

## Results
- Full inter-VLAN routing working across all 3 sites
- OSPF convergence time <3s on link failure
- All firewall policies validated against intended traffic flows
- Documentation written for each RouterOS config block
    `,
    technologies: ['GNS3', 'MikroTik RouterOS', 'OSPF', 'VLAN', '802.1Q', 'Wireshark', 'RSTP'],
    category: 'Networking',
    year: 2025,
  },

  // ─── AI ───────────────────────────────────────────────────────────────────
  {
    slug: 'atur-modal',
    title: 'AturModal — AI Personal Finance Advisor',
    shortDescription:
      'FastAPI + Gemini AI powered personal finance assistant that analyzes spending patterns and gives actionable budget recommendations.',
    image: '/images/projects/atur-modal.png',
    fullContent: `
# AturModal — AI Personal Finance Advisor

## Overview
AturModal ("atur modal" = manage your capital in Indonesian) is a personal finance web application powered by FastAPI and Google Gemini AI. Users log their income and expenses; the AI analyzes patterns over time and generates personalized budget recommendations, savings goals, and spending anomaly alerts.

## Problem / Context
Most budgeting apps give raw charts but no actionable advice. AturModal bridges this gap by passing structured financial summaries to Gemini AI, which then generates conversational, context-aware recommendations.

## Architecture
\`\`\`
Frontend (Next.js)
  ↓ REST API calls
FastAPI Backend
  ├── /transactions  — CRUD for income/expense entries
  ├── /analytics     — aggregation (monthly summary, categories)
  └── /ai/advice     — sends summary to Gemini, streams response
        ↓
  Google Gemini AI (gemini-1.5-flash)
        ↓
  Streamed markdown response → frontend chat UI
\`\`\`

## Key Technical Decisions
- **FastAPI** for async Python backend — native async/await for streaming Gemini responses
- **Gemini 1.5 Flash** model — fast enough for interactive streaming, cost-effective
- **Structured prompting**: financial summary JSON embedded in system prompt
- **SQLite + SQLAlchemy** for local dev; PostgreSQL in production
- **Server-Sent Events** for streaming AI responses to frontend

## AI Prompt Design
\`\`\`python
system_prompt = """
You are a personal finance advisor. Analyze the user's financial summary
and provide clear, actionable advice in Bahasa Indonesia.

User's last 30-day summary:
- Total income: {income}
- Total expenses: {expenses}
- Top spending categories: {categories}
- Savings rate: {savings_rate}%

Identify 3 specific areas to improve and suggest concrete actions.
"""
\`\`\`

## Challenges & Fixes
| Challenge | Fix |
|-----------|-----|
| Gemini rate limiting on free tier | Exponential backoff + request queuing |
| Streaming SSE in FastAPI | Used \`StreamingResponse\` with async generator |
| AI hallucinating numbers | Structured JSON summary in prompt; validated output |
| CORS issues with streaming | Added explicit \`StreamingResponse\` headers |

## Results
- Average AI response latency: ~1.2s to first token
- Users report 40% improvement in budgeting awareness after 1 month
- Gemini correctly identifies anomalies (e.g., spike in food spending) in 85% of test cases
    `,
    technologies: ['FastAPI', 'Google Gemini AI', 'Python', 'SQLAlchemy', 'PostgreSQL', 'Next.js', 'Server-Sent Events'],
    category: 'AI',
    github: 'https://github.com/Harinzu47/atur-modal',
    year: 2025,
  },

  {
    slug: 'esg-sentiment-analysis',
    title: 'ESG Sentiment Analysis System',
    shortDescription:
      'NLP pipeline using fine-tuned BERT to classify sentiment from ESG-related news, reports, and social media at scale.',
    image: '/images/projects/esg-sentiment.png',
    fullContent: `
# ESG Sentiment Analysis System

## Overview
Proyek ini bertujuan untuk menganalisis sentimen dari berbagai sumber data (berita, laporan tahunan, dan media sosial) terkait kriteria Environmental, Social, and Governance (ESG). Sistem ini membantu investor dan perusahaan dalam memantau risiko reputasi dan kepatuhan ESG secara real-time.

## Problem Statement
Klien membutuhkan cara otomatis untuk menganalisis volume data tekstual yang besar guna menentukan persepsi publik dan tingkat risiko terkait isu-isu ESG, yang sebelumnya dilakukan secara manual dan memakan waktu lama.

## Solution Architecture
- **Data Pipeline**: Pipeline ETL otomatis yang memproses 500K+ record data tekstual dari berbagai API berita dan laporan publik.
- **Feature Engineering**: Ekstraksi fitur NLP termasuk TF-IDF, Word Embeddings (Word2Vec/GloVe), dan sentimen skor per kategori ESG (E, S, dan G).
- **Model**: Implementasi model berbasis Transformer (Fine-tuned BERT) untuk klasifikasi sentimen multi-class (Positif, Negatif, Netral).
- **Deployment**: Dashboard interaktif berbasis **Streamlit** untuk visualisasi tren sentimen dan analisis mendalam (drill-down).

## Technical Stack
- **Python 3.11** untuk pemrosesan bahasa alami (NLP) dan pemodelan.
- **Pandas & NumPy** untuk manipulasi data terstruktur.
- **Hugging Face Transformers** untuk implementasi model BERT.
- **Scikit-learn** untuk preprocessing dan evaluasi model klasik.
- **SQL** untuk manajemen data warehouse hasil analisis.
- **Streamlit** untuk dashboard visualisasi real-time.

## Key Accomplishments
- Mencapai **akurasi 87%** dan **F1-score 0.82** dalam klasifikasi sentimen spesifik domain keuangan/ESG.
- Mengidentifikasi 10 indikator risiko ESG utama melalui analisis SHAP untuk transparansi keputusan model.
- Mengurangi *false positives* sebesar 35% melalui teknik *ensemble learning* pada model klasifikasi.
- Memproses dan menganalisis data historis selama 2 tahun (lebih dari 2 juta record teks).

## Impact
- Memungkinkan strategi investasi berbasis data yang lebih cepat dengan pemantauan risiko ESG otomatis.
- Mengurangi waktu analisis laporan ESG manual hingga 70%.
- Meningkatkan deteksi dini terhadap isu negatif ESG sebesar 40% sebelum menjadi krisis reputasi.

## Technical Challenges
- **Data Unstructured**: Menangani ekstraksi teks dari laporan PDF yang kompleks dan data media sosial yang tidak rapi.
- **Sentiment Nuance**: Mendeteksi nuansa bahasa finansial yang seringkali berbeda dari sentimen umum.
- **Model Interpretability**: Menggunakan SHAP untuk menjelaskan keputusan model.
- **Scalability**: Optimasi pipeline untuk memproses 100K artikel berita harian dalam waktu kurang dari 5 menit.
    `,
    technologies: ['Python', 'Transformers', 'Streamlit', 'Pandas', 'BERT', 'NLP', 'Scikit-learn'],
    category: 'AI',
    github: 'https://github.com/Harinzu47/ESG_Sentiment',
    year: 2024,
  },

  // ─── WEB DEV ──────────────────────────────────────────────────────────────
  {
    slug: 'lms-ruanganagata',
    title: 'Ruang Anagata LMS',
    shortDescription:
      'Full-featured Learning Management System built with Laravel, serving 2000+ active users with real-time notifications and Redis caching.',
    image: '/images/projects/lms-ruanganagata.png',
    fullContent: `
# Ruang Anagata

## Overview
A full-featured Learning Management System designed for educational institutions and corporate training programs. The platform handles course management, student enrollment, assessments, and real-time progress tracking.

## Key Features
- **Course Management**: Create and organize courses with multimedia content
- **Student Dashboard**: Track progress, grades, and upcoming assignments
- **Real-time Notifications**: WebSocket integration via Laravel Echo + Pusher
- **Assessment Engine**: Automated grading with support for multiple question types
- **Analytics Dashboard**: Comprehensive reporting for instructors and administrators

## Technical Highlights
- Built with **Laravel 10** for robust backend API
- **Livewire** for reactive frontend without leaving PHP ecosystem
- **PostgreSQL** database with optimized queries for large datasets
- **Redis** caching for improved performance
- **Docker** containerization for consistent deployment

## Challenges Solved
- Implemented real-time collaboration features using Laravel Echo and Pusher
- Optimized database queries to handle 10,000+ concurrent users
- Built a flexible RBAC (Role-Based Access Control) system
- Integrated third-party video conferencing APIs

## Results
- Successfully deployed to production serving 2,000+ active users
- Reduced page load times by 60% through caching strategies
- Achieved 99.9% uptime over 12 months
    `,
    technologies: ['Laravel', 'Livewire', 'MySQL', 'Tailwind CSS', 'Redis', 'Docker', 'Pusher'],
    category: 'Web Dev',
    github: 'https://ruanganagata.id',
    year: 2025,
  },
  {
    slug: 'larvago',
    title: 'Larvago: Maggot Sales Platform',
    shortDescription:
      'A web-based marketplace for BSF maggot products and organic waste management using the TALL Stack.',
    image: '/images/projects/larvago.png',
    fullContent: `
# Larvago: Maggot & Organic Waste Marketplace

## Overview
Larvago is an innovative e-commerce solution that connects maggot (Black Soldier Fly) breeders with consumers. This application is designed to simplify the distribution of high-protein alternative feed while supporting a sustainable organic waste management ecosystem.

## Key Features
- **Cultivation Dashboard**: Manage maggot stock based on life cycle stage (fresh, dried, or eggs).
- **Interactive Shopping**: Seamless shopping experience with real-time cart updates and product filters.
- **Order Management**: Automated order tracking system from payment status to delivery.
- **Payment Integration**: Supports various local payment methods.
- **Reporting System**: Sales reports and stock statistics.

## Technical Implementation
- **Laravel**: Core engine, robust security system and application architecture.
- **Livewire**: Dynamic and interactive interface without leaving the PHP ecosystem.
- **Tailwind CSS**: Modern, clean, and fully responsive interface design.
- **MySQL**: Relational database with high data integrity.

## Results
- Accelerated transaction process between breeders and buyers by up to 50%.
- Centralized catalog for various maggot derivative products.
- Lightweight and fast interface for users in areas with limited internet connectivity.
    `,
    technologies: ['Laravel', 'Livewire', 'Tailwind CSS', 'MySQL'],
    category: 'Web Dev',
    year: 2025,
  },
  {
    slug: 'unruly-webstore-app',
    title: 'Unruly Webstore Application',
    shortDescription:
      'Comprehensive e-commerce platform built with the TALL stack and integrated with real-time shipping APIs and Redis caching.',
    image: '/images/projects/unruly-webstore.png',
    fullContent: `
# Universal Webstore Application

## Overview
This Webstore App is a versatile e-commerce solution designed to handle various product types. It focuses on providing a seamless shopping experience with real-time updates and accurate shipping calculations for the Indonesian market.

## Key Features
- **Dynamic Product Catalog**: Efficiently browse and filter products across multiple categories.
- **Real-time Notifications**: Instant alerts via Pusher WebSockets.
- **Shipping Cost Integration**: Real-time shipping rates via RajaOngkir API.
- **Interactive Shopping Cart**: No-refresh cart management with Livewire.
- **Performance Caching**: Optimized load speeds using Redis.

## Technical Implementation
- **Laravel**: Core PHP framework with robust security and scalable architecture.
- **Livewire**: Reactive frontend components without leaving PHP.
- **MySQL**: Reliable relational database.
- **Redis**: High-performance cache for sub-second response times.
- **Tailwind CSS**: Modern, responsive UI.
- **Pusher**: WebSocket technology for real-time updates.
- **RajaOngkir API**: Precise shipping costs from Indonesian couriers.

## Results
- Integrated real-time logistics, reducing shipping calculation errors.
- Improved user engagement through reactive UI.
- High performance through Redis caching for product listings.
    `,
    technologies: ['Laravel', 'Livewire', 'MySQL', 'Redis', 'Tailwind CSS', 'Pusher', 'RajaOngkir API'],
    category: 'Web Dev',
    year: 2025,
  },
  {
    slug: 'imm-ft-umj-blog',
    title: 'IMM FT UMJ Blog Application',
    shortDescription:
      'Organizational blog platform for IMM FT UMJ featuring real-time interactions and a dynamic content management system.',
    image: '/images/projects/immftumj-blog-app.png',
    fullContent: `
# IMM FT UMJ Blog Application

## Overview
This application serves as the official digital publication platform for the Ikatan Mahasiswa Muhammadiyah (IMM) at the Faculty of Engineering, Universitas Muhammadiyah Jakarta. It centralizes organizational news, academic articles, and event updates.

## Key Features
- **Dynamic Article Management**: Create, edit, and categorize blog posts with rich media support.
- **Real-time Notifications**: Instant updates for new comments and announcements via Pusher.
- **Interactive Comments**: Reactive commenting system without page reloads.
- **Member Directory**: Organization structure and active member profiles.
- **Responsive Layout**: Mobile-first design across all devices.

## Technical Implementation
- **Laravel**: Secure authentication, robust routing, and scalable backend.
- **Livewire**: Dynamic frontend experience within PHP ecosystem.
- **Tailwind CSS**: Professional, custom-branded UI.
- **MySQL**: Structured storage for articles, user profiles, and org data.
- **Pusher**: Real-time WebSocket capabilities.

## Results
- Centralized all organizational communication into a professional digital hub.
- Enhanced member engagement through real-time discussion features.
- Significantly reduced admin content management time.
    `,
    technologies: ['Laravel', 'Livewire', 'Tailwind CSS', 'MySQL', 'Pusher'],
    category: 'Web Dev',
    year: 2025,
  },
  {
    slug: 'sugar-control-app',
    title: 'Sugar Control: Personalized Meal Recommendations',
    shortDescription:
      'Health-focused web app providing personalized meal recommendations based on blood glucose levels using the Spoonacular API.',
    image: '/images/projects/sugar-control-app.png',
    fullContent: `
# Sugar Control: Take Control of Your Blood Sugar

## Overview
Sugar Control is a health-focused web application designed to help users manage their blood glucose through smarter dietary choices. By leveraging real-time data from the Spoonacular API, the app provides personalized meal recommendations aligned with the user's blood sugar levels.

## Key Features
- **Personalized Recommendations**: Meal suggestions tailored to blood glucose readings.
- **Nutritional Insights**: Detailed breakdowns of calories, carbs, and sugars.
- **Smart Search**: Filter recipes by ingredients, prep time, and health scores.
- **Responsive Interface**: Clean, mobile-friendly design.
- **Direct Recipe Access**: Quick links to full cooking instructions.

## Technical Implementation
- **HTML5 & CSS3**: Structure and custom styling.
- **JavaScript (ES6+)**: Core logic, API fetching, data filtering, dynamic DOM.
- **Bootstrap 5**: Responsive grid system and modern UI components.
- **Spoonacular API**: Vast recipe database with health-specific dietary data.

## Results
- Bridged the gap between glucose monitoring and actionable dietary planning.
- Fast, lightweight application with zero backend overhead.
- Improved user access to healthy meal options through an intuitive UI.
    `,
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap 5', 'Spoonacular API'],
    category: 'Web Dev',
    year: 2023,
  },
  {
    slug: 'imm-ft-umj-shorten-link',
    title: 'IMM FT UMJ Shorten Link App',
    shortDescription:
      'Custom URL shortening service for IMM FT UMJ built with React and Supabase for efficient branded link management.',
    image: '/images/projects/immftumj-shorten-link.png',
    fullContent: `
# IMM FT UMJ Shorten Link App

## Overview
A specialized URL shortening service for the Ikatan Mahasiswa Muhammadiyah (IMM) at FT UMJ. Allows the organization to create branded, trackable short links for event registrations, publications, and social media.

## Key Features
- **Custom Alias Creation**: Generate short URLs with custom suffixes for org branding.
- **Link Analytics**: Track clicks and basic visitor data.
- **Dashboard Management**: Secure admin panel for managing, editing, or deleting links.
- **Instant Redirects**: High-speed URL redirection.
- **Clipboard Integration**: One-click copy of shortened links.

## Technical Implementation
- **React**: Fast, component-based UI for the link management dashboard.
- **Supabase**: PostgreSQL database, real-time subscriptions, and secure authentication.
- **Supabase Auth**: Ensures only authorized IMM members can manage links.
- **Tailwind CSS**: Modern, mobile-responsive professional UI.

## Results
- Replaced long, messy URLs with professional branded links.
- Provided actionable insights through click tracking.
- Highly scalable and cost-effective via Supabase's serverless architecture.
    `,
    technologies: ['React', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    category: 'Web Dev',
    year: 2024,
  },
  {
    slug: 'warung-gembul-app',
    title: 'Warung Gembul App',
    shortDescription:
      'Progressive Web App for restaurant discovery with offline capabilities, optimized performance, and comprehensive automated testing.',
    image: '/images/projects/warung-gembul-app.png',
    fullContent: `
# Warung Gembul App

## Overview
Warung Gembul is a mobile-first restaurant catalogue PWA that prioritizes accessibility, performance, and reliability — allowing users to explore culinary destinations even under unstable network conditions.

## Key Features
- **Progressive Web App (PWA)**: Installable with full offline functionality via Service Workers.
- **Offline Favorites**: Save restaurants to favorites using IndexedDB.
- **Optimized Performance**: Image lazy-loading, code splitting, asset compression.
- **Accessible**: Mobile-first design with A11y best practices (skip-links, focus management).
- **Restaurant Discovery**: Detailed views with menus, ratings, and reviews from external API.

## Technical Implementation
- **Vanilla JavaScript (ES6+)**: Maximum performance and control.
- **Webpack**: Advanced asset bundling, image optimization (imagemin), production builds.
- **Workbox**: Service Worker caching strategies (Stale-While-Revalidate, Network-First, Cache-First).
- **IndexedDB**: Client-side persistent storage for favorites.
- **CodeceptJS**: End-to-end test automation.
- **Jasmine + Karma**: Unit and integration testing.

## Results
- Highly performant on low-spec devices.
- Robust offline experience for users in poor connectivity areas.
- High code stability through comprehensive automated test suite.
    `,
    technologies: ['JavaScript (ES6+)', 'Webpack', 'Workbox (PWA)', 'IndexedDB', 'CodeceptJS', 'Jasmine', 'Karma'],
    category: 'Web Dev',
    year: 2023,
  },
];

/**
 * Get project by slug
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Get projects by category
 */
export function getProjectsByCategory(category: Project['category']): Project[] {
  return projects.filter((project) => project.category === category);
}

/**
 * Get featured projects (first 3)
 */
export function getFeaturedProjects(): Project[] {
  return projects.slice(0, 3);
}
