/**
 * Structured Data (JSON-LD) Generators for Search Engine Optimization
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hzcode.my.id';
const AUTHOR_NAME = 'Khalid Jundullah';

export function getPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: SITE_URL,
    jobTitle: 'Network & Cloud Infrastructure Engineer',
    sameAs: [
      'https://github.com/Harinzu47',
      'https://www.linkedin.com/in/khalid-jundullah-8086b8249',
    ],
    knowsAbout: [
      'Cloud Architecture',
      'Computer Networking',
      'MikroTik MTCNA',
      'Kubernetes',
      'PostgreSQL',
      'Next.js',
      'TypeScript',
      'FastAPI',
    ],
  };
}

export function getArticleSchema(article: {
  title: string;
  description?: string | null;
  slug: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description || undefined,
    url: `${SITE_URL}/articles/${article.slug}`,
    datePublished: article.publishedAt
      ? new Date(article.publishedAt).toISOString()
      : undefined,
    dateModified: article.updatedAt
      ? new Date(article.updatedAt).toISOString()
      : undefined,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'hzcode',
      url: SITE_URL,
    },
  };
}

export function getProjectSchema(project: {
  title: string;
  description?: string | null;
  slug: string;
  repoUrl?: string | null;
  demoUrl?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.description || undefined,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    url: `${SITE_URL}/projects/${project.slug}`,
    codeRepository: project.repoUrl || undefined,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  };
}
