import { knowledgeGraph } from '../knowledge/knowledgeGraph';
import { routeRegistry } from '../routing/routeRegistry';
import { siteConfig } from './config';

/**
 * Enterprise Sitemap XML Generator Engine
 */
export class SitemapGenerator {
  public static generateXml(): string {
    const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [];

    // 1. Add registered static routes
    Object.values(routeRegistry).forEach((r) => {
      if (!r.path.includes('[slug]')) {
        urls.push({
          loc: `${siteConfig.siteUrl}${r.path === '/' ? '' : r.path}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: r.path === '/' ? 'daily' : 'weekly',
          priority: r.path === '/' ? '1.0' : '0.8',
        });
      }
    });

    // 2. Add published dynamic content nodes
    const nodes = knowledgeGraph.getAllNodes().filter((n) => !n.draft);
    nodes.forEach((n) => {
      const parentPath = n.type === 'article' ? 'articles' : n.type === 'journal' ? 'journal' : n.type === 'project' ? 'projects' : n.type === 'note' ? 'notes' : n.type;
      const loc = `${siteConfig.siteUrl}/${parentPath}/${n.slug}`;
      const lastmod = (n.updatedAt || n.publishedAt || new Date().toISOString()).split('T')[0];

      urls.push({
        loc,
        lastmod,
        changefreq: 'monthly',
        priority: '0.7',
      });
    });

    const urlXml = urls
      .map(
        (u) => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXml}
</urlset>`;
  }
}
