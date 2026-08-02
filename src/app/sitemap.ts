import type { MetadataRoute } from 'next';
import { knowledgeGraph } from '@/features/knowledge';
import { routeRegistry } from '@/features/routing';

const BASE_URL = 'https://hzcode.my.id';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // 1. Static routes
  Object.values(routeRegistry).forEach((r) => {
    if (!r.path.includes('[slug]')) {
      entries.push({
        url: `${BASE_URL}${r.path === '/' ? '' : r.path}`,
        lastModified: new Date(),
        changeFrequency: r.path === '/' ? 'daily' : 'weekly',
        priority: r.path === '/' ? 1.0 : 0.8,
      });
    }
  });

  // 2. Dynamic content nodes
  const nodes = knowledgeGraph.getAllNodes().filter((n) => !n.draft);
  nodes.forEach((n) => {
    const parentPath = n.type === 'article' ? 'articles' : n.type === 'journal' ? 'journal' : n.type === 'project' ? 'projects' : n.type === 'note' ? 'notes' : n.type;
    entries.push({
      url: `${BASE_URL}/${parentPath}/${n.slug}`,
      lastModified: new Date(n.updatedAt || n.publishedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  return entries;
}
