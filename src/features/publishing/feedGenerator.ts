import { knowledgeGraph } from '../knowledge/knowledgeGraph';
import { siteConfig } from './config';
import { FeedItem } from './types';

/**
 * Enterprise RSS 2.0 & Atom Feed Generator
 */
export class FeedGenerator {
  /**
   * Compiles published content nodes into feed items
   */
  private static getFeedItems(): FeedItem[] {
    const nodes = knowledgeGraph.getAllNodes().filter((n) => !n.draft && n.publishedAt);

    // Sort newest first
    const sorted = nodes.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return sorted.map((n) => {
      const parentPath = n.type === 'article' ? 'articles' : n.type === 'journal' ? 'journal' : n.type === 'project' ? 'projects' : n.type === 'note' ? 'notes' : n.type;
      const url = `${siteConfig.siteUrl}/${parentPath}/${n.slug}`;

      return {
        title: n.title,
        description: n.description || n.summary || '',
        url,
        guid: url,
        date: new Date(n.publishedAt).toUTCString(),
        author: siteConfig.authorName,
        category: n.taxonomy.categories[0] || n.taxonomy.domain,
      };
    });
  }

  /**
   * Generates RSS 2.0 XML string
   */
  public static generateRss2(): string {
    const items = this.getFeedItems();

    const itemsXml = items
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.date}</pubDate>
      <author><![CDATA[${item.author}]]></author>
      ${item.category ? `<category><![CDATA[${item.category}]]></category>` : ''}
    </item>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteConfig.siteName}]]></title>
    <description><![CDATA[${siteConfig.defaultDescription}]]></description>
    <link>${siteConfig.siteUrl}</link>
    <atom:link href="${siteConfig.siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;
  }

  /**
   * Generates Atom XML string
   */
  public static generateAtom(): string {
    const items = this.getFeedItems();

    const itemsXml = items
      .map(
        (item) => `
  <entry>
    <title><![CDATA[${item.title}]]></title>
    <link href="${item.url}"/>
    <id>${item.guid}</id>
    <updated>${new Date(item.date).toISOString()}</updated>
    <summary><![CDATA[${item.description}]]></summary>
    <author>
      <name><![CDATA[${item.author}]]></name>
    </author>
  </entry>`
      )
      .join('');

    return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title><![CDATA[${siteConfig.siteName}]]></title>
  <subtitle><![CDATA[${siteConfig.defaultDescription}]]></subtitle>
  <link href="${siteConfig.siteUrl}/atom.xml" rel="self"/>
  <link href="${siteConfig.siteUrl}"/>
  <updated>${new Date().toISOString()}</updated>
  <id>${siteConfig.siteUrl}/</id>
  <author>
    <name><![CDATA[${siteConfig.authorName}]]></name>
    <email>${siteConfig.authorEmail}</email>
  </author>
  ${itemsXml}
</feed>`;
  }
}
