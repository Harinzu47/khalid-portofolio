import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/developer_os';

async function runSeed() {
  console.log('🌱 Starting database seed...');
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    // 1. Operator Profile
    console.log('👤 Seeding operator profile...');
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        fullName: 'Khalid Jundullah',
        username: 'harinzu',
        headline: 'Network & Infrastructure Engineer → Fullstack Developer',
        bio: 'Systems Architect specializing in Cloud Native Infrastructure, Enterprise Network Routing (BGP, OSPF, VLANs), Docker/Kubernetes, and High-Performance Fullstack TypeScript/Next.js/PostgreSQL applications.',
        location: 'Indonesia',
        websiteUrl: 'https://hzcode.my.id',
      })
      .onConflictDoNothing()
      .returning();

    const profileId = profile?.id;

    // 2. Social Links
    if (profileId) {
      console.log('🔗 Seeding social links...');
      await db
        .insert(schema.socialLinks)
        .values([
          {
            profileId,
            platform: 'github',
            label: 'GitHub',
            url: 'https://github.com/Harinzu47',
            sortOrder: 1,
            isVisible: true,
          },
          {
            profileId,
            platform: 'linkedin',
            label: 'LinkedIn',
            url: 'https://www.linkedin.com/in/khalid-jundullah-8086b8249',
            sortOrder: 2,
            isVisible: true,
          },
          {
            profileId,
            platform: 'email',
            label: 'Email',
            url: 'mailto:harinzu47@gmail.com',
            sortOrder: 3,
            isVisible: true,
          },
        ])
        .onConflictDoNothing();
    }

    // 3. Technologies
    console.log('💻 Seeding technologies...');
    const [mikrotik, nextjs, docker, postgresTech, tsTech, laravel] = await db
      .insert(schema.technologies)
      .values([
        {
          name: 'MikroTik RouterOS',
          slug: 'mikrotik-routeros',
          category: 'Networking',
          description: 'Enterprise routing, firewall filter chains, CAPsMAN, and VLANs.',
          iconName: 'router',
        },
        {
          name: 'Next.js 16',
          slug: 'nextjs-16',
          category: 'Frontend',
          description: 'Fullstack React framework with App Router, SSR, and Server Actions.',
          iconName: 'nextjs',
        },
        {
          name: 'Docker',
          slug: 'docker',
          category: 'DevOps',
          description: 'Containerization, multi-stage builds, and Docker Compose orchestration.',
          iconName: 'docker',
        },
        {
          name: 'PostgreSQL 16',
          slug: 'postgresql-16',
          category: 'Database',
          description: 'Relational database with composite indexing and Row-Level Security.',
          iconName: 'postgresql',
        },
        {
          name: 'TypeScript',
          slug: 'typescript',
          category: 'Languages',
          description: 'Strictly-typed JavaScript with advanced generics and Zod integration.',
          iconName: 'typescript',
        },
        {
          name: 'Laravel',
          slug: 'laravel',
          category: 'Backend',
          description: 'Modern PHP web application framework with Eloquent ORM.',
          iconName: 'laravel',
        },
      ])
      .onConflictDoNothing()
      .returning();

    // 4. Skills
    console.log('⚡ Seeding skills...');
    await db
      .insert(schema.skills)
      .values([
        {
          name: 'Enterprise Network Routing (BGP/OSPF)',
          slug: 'network-routing',
          category: 'Networking',
          proficiencyLevel: 5,
        },
        {
          name: 'Linux Server Administration',
          slug: 'linux-sysadmin',
          category: 'Infrastructure',
          proficiencyLevel: 5,
        },
        {
          name: 'Fullstack Next.js & React Architecture',
          slug: 'fullstack-nextjs',
          category: 'Software Engineering',
          proficiencyLevel: 4,
        },
        {
          name: 'Database Schema & Query Optimization',
          slug: 'db-optimization',
          category: 'Database',
          proficiencyLevel: 4,
        },
      ])
      .onConflictDoNothing();

    // 5. Projects
    console.log('🚀 Seeding projects...');
    const [aturModal] = await db
      .insert(schema.projects)
      .values([
        {
          title: 'AturModal — Microfinance ERP & Audit Engine',
          slug: 'atur-modal',
          shortDescription:
            'Multi-tier microfinance accounting, transaction auditing, and financial reporting system.',
          description:
            'A comprehensive financial operating system designed for microfinance institutions, providing double-entry bookkeeping, multi-level transaction authorization, and real-time audit logging.',
          problemStatement:
            'Small financial institutions often rely on error-prone spreadsheets lacking double-entry guarantees and verifiable audit trails.',
          solution:
            'Engineered an atomic ledger system with PostgreSQL transactions, automated reconciliation, and strict role-based access control.',
          role: 'Lead Systems Architect & Fullstack Engineer',
          status: 'completed',
          featured: true,
          publishedAt: new Date('2026-01-15'),
        },
        {
          title: 'FLC LMS — Interactive Cloud Educational Platform',
          slug: 'flc-lms',
          shortDescription:
            'High-concurrency educational platform for interactive video courses and grading workflows.',
          description:
            'Cloud-native learning management platform serving video delivery, automated quizzes, and student performance metrics.',
          role: 'Fullstack Developer',
          status: 'completed',
          featured: true,
          publishedAt: new Date('2026-03-10'),
        },
        {
          title: 'ESG Sentiment Analyzer — FinTech NLP Intelligence',
          slug: 'esg-sentiment-analysis',
          shortDescription:
            'NLP intelligence engine parsing ESG corporate filings and financial news for compliance scoring.',
          description:
            'Machine learning pipeline scoring sustainability reports and market filings for environmental, social, and governance compliance.',
          role: 'AI & Data Engineer',
          status: 'completed',
          featured: true,
          publishedAt: new Date('2026-05-20'),
        },
      ])
      .onConflictDoNothing()
      .returning();

    // Link AturModal to Technologies
    if (aturModal?.id && nextjs?.id && postgresTech?.id) {
      await db
        .insert(schema.projectTechnologies)
        .values([
          { projectId: aturModal.id, technologyId: nextjs.id },
          { projectId: aturModal.id, technologyId: postgresTech.id },
        ])
        .onConflictDoNothing();
    }

    // 6. Articles
    console.log('📝 Seeding articles...');
    await db
      .insert(schema.articles)
      .values([
        {
          title: 'Network Automation with Python and MikroTik RouterOS API',
          slug: 'network-automation-mikrotik-api',
          excerpt:
            'Programmatic VLAN provisioning, automated backup orchestration, and QoS profiling across enterprise hardware.',
          content: `# Network Automation with Python & RouterOS

Automating router configuration minimizes human configuration errors and accelerates tenant provisioning.

## 1. Connecting via RouterOS API
Using the binary API port (8728) with TLS encryption:

\`\`\`python
import routeros_api

connection = routeros_api.RouterOsApiPool(
    '192.168.88.1',
    username='admin',
    password='secretpassword',
    plaintext_login=True
)
api = connection.get_api()
\`\`\`

## 2. Dynamic VLAN & Firewall Rules
Programmatic filter deployment ensures standard firewall rules across all network edge routers.`,
          status: 'published',
          featured: true,
          publishedAt: new Date('2026-06-01'),
        },
        {
          title: 'PostgreSQL B-Tree Composite Indexing & Query Plan Optimization',
          slug: 'postgres-btree-composite-indexing',
          excerpt:
            'Eliminating sequential heap scans and maximizing cache hits in high-concurrency relational databases.',
          content: `# PostgreSQL B-Tree Composite Indexing

Understanding the left-prefix rule in B-Tree composite indexes:

\`\`\`sql
CREATE INDEX idx_articles_status_published
ON articles (status, published_at DESC)
WHERE deleted_at IS NULL;
\`\`\`

This partial composite index serves filtered and sorted feeds with index-only scans.`,
          status: 'published',
          featured: true,
          publishedAt: new Date('2026-07-15'),
        },
      ])
      .onConflictDoNothing();

    // 7. Engineering Journal Entries
    console.log('📓 Seeding journal entries...');
    await db
      .insert(schema.journalEntries)
      .values([
        {
          title: 'Fixing N+1 Query Bottlenecks in Drizzle ORM Relational Queries',
          slug: 'fixing-n1-query',
          entryDate: '2026-08-10',
          summary: 'Benchmarking lateral joins vs relational eager loading in high-traffic APIs.',
          content: `Diagnosed high database latency caused by separate queries in loops. Resolved using lateral joins and composite foreign key indexes.`,
          status: 'published',
          visibility: 'public',
        },
        {
          title: 'MTCNA Certification Preparation & Subnetting Lab Logs',
          slug: 'mtcna-exam-prep',
          entryDate: '2026-08-14',
          summary: 'Reflections on packet flow diagrams, bridging vs routing, and firewall filter chain optimization.',
          content: `Deep dive into RouterOS packet flow diagrams (Prerouting, Forward, Postrouting) and CAPsMAN wireless controller provisioning.`,
          status: 'published',
          visibility: 'public',
        },
      ])
      .onConflictDoNothing();

    // 8. Certificates
    console.log('📜 Seeding certificates...');
    await db
      .insert(schema.certificates)
      .values([
        {
          name: 'MikroTik Certified Network Associate (MTCNA)',
          issuer: 'MikroTik',
          credentialId: 'MTCNA-2026-HZCODE',
          issuedAt: '2026-08-01',
          description: 'Certified expertise in RouterOS configuration, routing (OSPF, static), bridging, firewall filters, NAT, bandwidth queues, wireless CAPsMAN, and tunnels (PPP, PPPoE).',
        },
      ])
      .onConflictDoNothing();

    // 9. Roadmap & Learning Goals
    console.log('🗺️ Seeding roadmap items...');
    await db
      .insert(schema.roadmapItems)
      .values([
        {
          title: 'MikroTik MTCRE (Routing Engineer Certification)',
          description: 'Advanced dynamic routing with OSPF multi-area, BGP peering, and recursive routing failover.',
          status: 'in_progress',
          priority: 1,
          category: 'Networking',
          targetDate: '2026-10-30',
        },
        {
          title: 'Kubernetes Cluster Provisioning with Cilium eBPF',
          description: 'Production bare-metal K3s cluster deployment with Cilium service mesh and WireGuard encryption.',
          status: 'planned',
          priority: 2,
          category: 'DevOps',
          targetDate: '2026-12-15',
        },
      ])
      .onConflictDoNothing();

    console.log('🎉 Seed completed successfully! All baseline data created.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSeed();
