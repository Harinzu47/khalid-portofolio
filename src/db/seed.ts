import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
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
    let ownerId = process.env.OWNER_USER_ID;
    if (!ownerId) {
      const authUsers = await sql`SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1`;
      if (authUsers.length > 0) {
        ownerId = authUsers[0].id;
      }
    }
    if (!ownerId) {
      ownerId = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
    }

    console.log(`👤 Using Owner ID for seed: ${ownerId}`);

    // 1. Operator Profile
    console.log('👤 Seeding operator profile...');
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        ownerId,
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

    // 2. Profile Links
    if (profileId) {
      console.log('🔗 Seeding profile social links...');
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
          ownerId,
          name: 'MikroTik RouterOS',
          slug: 'mikrotik-routeros',
          category: 'Networking',
          description: 'Enterprise routing, firewall filter chains, CAPsMAN, and VLANs.',
          iconName: 'router',
        },
        {
          ownerId,
          name: 'Next.js 16',
          slug: 'nextjs-16',
          category: 'Frontend',
          description: 'Fullstack React framework with App Router, SSR, and Server Actions.',
          iconName: 'nextjs',
        },
        {
          ownerId,
          name: 'Docker',
          slug: 'docker',
          category: 'DevOps',
          description: 'Containerization, multi-stage builds, and Docker Compose orchestration.',
          iconName: 'docker',
        },
        {
          ownerId,
          name: 'PostgreSQL 16',
          slug: 'postgresql-16',
          category: 'Database',
          description: 'Relational database with composite indexing and Row-Level Security.',
          iconName: 'postgresql',
        },
        {
          ownerId,
          name: 'TypeScript',
          slug: 'typescript',
          category: 'Languages',
          description: 'Strictly-typed JavaScript with advanced generics and Zod integration.',
          iconName: 'typescript',
        },
        {
          ownerId,
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
          ownerId,
          name: 'Enterprise Network Routing (BGP/OSPF)',
          slug: 'network-routing',
          category: 'Networking',
          proficiencyLevel: 5,
        },
        {
          ownerId,
          name: 'Linux Server Administration',
          slug: 'linux-sysadmin',
          category: 'Infrastructure',
          proficiencyLevel: 5,
        },
        {
          ownerId,
          name: 'Fullstack Next.js & React Architecture',
          slug: 'fullstack-nextjs',
          category: 'Software Engineering',
          proficiencyLevel: 4,
        },
        {
          ownerId,
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
          ownerId,
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
          ownerId,
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
          ownerId,
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
          ownerId,
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
          ownerId,
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
          ownerId,
          title: 'Fixing N+1 Query Bottlenecks in Drizzle ORM Relational Queries',
          slug: 'fixing-n1-query',
          entryDate: '2026-08-10',
          summary: 'Benchmarking lateral joins vs relational eager loading in high-traffic APIs.',
          content: `Diagnosed high database latency caused by separate queries in loops. Resolved using lateral joins and composite foreign key indexes.`,
          status: 'published',
          visibility: 'public',
        },
        {
          ownerId,
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
          ownerId,
          name: 'MikroTik Certified Network Associate (MTCNA)',
          issuer: 'MikroTik',
          credentialId: 'MTCNA-2026-HZCODE',
          issuedAt: '2026-08-01',
          description: 'Certified expertise in RouterOS configuration, routing (OSPF, static), bridging, firewall filters, NAT, bandwidth queues, wireless CAPsMAN, and tunnels (PPP, PPPoE).',
        },
      ])
      .onConflictDoNothing();

    // 10. Canonical Domains
    console.log('🌐 Seeding domains...');
    const [infraDomain] = await db
      .insert(schema.domains)
      .values([
        {
          ownerId,
          name: 'Cloud & Infrastructure Engineering',
          slug: 'infrastructure-engineering',
          description: 'Production infrastructure, container orchestration, Linux kernel tuning, and CI/CD pipelines.',
          sortOrder: 1,
          visibility: 'public',
        },
        {
          ownerId,
          name: 'Enterprise Network Architecture',
          slug: 'network-architecture',
          description: 'IP routing (BGP/OSPF), VLAN switching, stateful firewalling, and VPN tunneling.',
          sortOrder: 2,
          visibility: 'public',
        },
        {
          ownerId,
          name: 'Fullstack Systems Development',
          slug: 'fullstack-development',
          description: 'Type-safe distributed web applications, relational databases, and low-latency API design.',
          sortOrder: 3,
          visibility: 'public',
        },
      ])
      .onConflictDoNothing()
      .returning();

    // 11. Project Case Study
    console.log('📖 Seeding project case study...');
    const [aturModalProj] = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.slug, 'atur-modal'))
      .limit(1);

    if (aturModalProj) {
      await db
        .insert(schema.projectCaseStudies)
        .values({
          ownerId,
          projectId: aturModalProj.id,
          title: 'AturModal: Architecting a High-Performance Offline-First Ledger',
          subtitle: 'A fullstack financial operating system designed for micro-enterprises with sub-10ms query latency.',
          executiveSummary: 'Engineered a resilient financial management application combining Next.js Server Components, Drizzle ORM, and Supabase PostgreSQL with strict Row Level Security.',
          problemStatement: 'Indonesian micro-enterprises suffer from fragmented manual bookkeeping, resulting in cash flow blindness and reconciliation errors.',
          visibility: 'public',
          publicationStatus: 'published',
          publishedAt: new Date('2026-08-01'),
        })
        .onConflictDoNothing();
    }

    // 12. Architectural Decision Records (ADR)
    console.log('📐 Seeding ADRs...');
    await db
      .insert(schema.adrs)
      .values([
        {
          ownerId,
          title: 'ADR-001: Selection of Drizzle ORM over Prisma for SQL Precision',
          slug: 'adr-001-drizzle-orm-over-prisma',
          number: 1,
          status: 'accepted',
          context: 'The HZCODE Personal Developer OS requires strict control over generated SQL queries, lateral joins, and direct TypeScript inference without heavyweight engines.',
          decision: 'Adopt Drizzle ORM as the primary data mapping layer for all PostgreSQL interactions.',
          visibility: 'public',
          publicationStatus: 'published',
          publishedAt: new Date('2026-08-15'),
          decidedAt: new Date('2026-08-10'),
        },
        {
          ownerId,
          title: 'ADR-002: Terminal Design System with CSS Custom Property Themes',
          slug: 'adr-002-terminal-design-tokens',
          number: 2,
          status: 'accepted',
          context: 'Need a unified aesthetic across public portfolio and private OS with instant theme switching without layout recalculation.',
          decision: 'Implement 5-theme HSL color token matrix mapped to data-theme attributes.',
          visibility: 'public',
          publicationStatus: 'published',
          publishedAt: new Date('2026-08-18'),
          decidedAt: new Date('2026-08-16'),
        },
      ])
      .onConflictDoNothing();

    // 13. Learning Paths
    console.log('🎯 Seeding learning paths...');
    await db
      .insert(schema.learningPaths)
      .values([
        {
          ownerId,
          title: 'Linux Systems & Container Internals Mastery',
          slug: 'linux-systems-container-internals',
          summary: 'Deep dive into cgroups v2, namespaces, eBPF packet tracing, and OCI container runtimes.',
          status: 'active',
          progressMode: 'percentage',
          progressValue: 75,
          currentFocus: 'Writing custom eBPF socket filters in C/Go',
          visibility: 'public',
          publicationStatus: 'published',
          publishedAt: new Date('2026-07-01'),
        },
      ])
      .onConflictDoNothing();

    // 14. Now Entries (Current Focus)
    console.log('⏱️ Seeding now entries...');
    await db
      .insert(schema.nowEntries)
      .values([
        {
          ownerId,
          entryType: 'building',
          title: 'HZCODE Personal Developer OS — Foundation Alignment',
          description: 'Consolidating canonical database models, RLS security isolation, and DTO boundaries.',
          status: 'active',
          isCurrent: true,
          sortOrder: 1,
          visibility: 'public',
          publicationStatus: 'published',
          publishedAt: new Date('2026-08-27'),
        },
        {
          ownerId,
          entryType: 'learning',
          title: 'Enterprise Routing & BGP Peering Architecture',
          description: 'Configuring BGP multihop and dynamic route filtering in virtual GNS3/EVE-NG topologies.',
          status: 'active',
          isCurrent: true,
          sortOrder: 2,
          visibility: 'public',
          publicationStatus: 'published',
          publishedAt: new Date('2026-08-25'),
        },
      ])
      .onConflictDoNothing();

    // 15. Semantic Knowledge Relationships
    console.log('🕸️ Seeding semantic knowledge graph...');
    const [explainsRel] = await db
      .select({ id: schema.relationshipTypes.id })
      .from(schema.relationshipTypes)
      .where(eq(schema.relationshipTypes.code, 'EXPLAINS'))
      .limit(1);

    const [firstArticle] = await db
      .select({ id: schema.articles.id })
      .from(schema.articles)
      .limit(1);

    const [firstProject] = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .limit(1);

    if (explainsRel && firstArticle && firstProject) {
      await db
        .insert(schema.knowledgeRelationships)
        .values({
          ownerId,
          relationshipTypeId: explainsRel.id,
          sourceType: 'ARTICLE',
          sourceId: firstArticle.id,
          targetType: 'PROJECT',
          targetId: firstProject.id,
          description: 'Article provides comprehensive architectural breakdown of the project.',
          visibility: 'public',
          status: 'active',
        })
        .onConflictDoNothing();
    }

    console.log('🎉 Seed completed successfully! All canonical baseline fixtures created.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSeed();
