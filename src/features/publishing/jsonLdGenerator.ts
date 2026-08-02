import { ContentNode } from '../knowledge/types';
import { BreadcrumbItem } from '../routing/types';
import { siteConfig } from './config';

/**
 * Enterprise JSON-LD Schema Generator Engine
 */
export class JsonLdGenerator {
  /**
   * Generates Schema.org Person JSON-LD
   */
  public static generatePersonJsonLd(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: siteConfig.authorName,
      jobTitle: siteConfig.authorJobTitle,
      url: siteConfig.siteUrl,
      sameAs: [siteConfig.githubUrl, siteConfig.linkedinUrl],
    };
  }

  /**
   * Generates Schema.org TechArticle / BlogPosting JSON-LD
   */
  public static generateArticleJsonLd(node: ContentNode): Record<string, unknown> {
    const canonicalUrl = `${siteConfig.siteUrl}/${node.type === 'article' ? 'articles' : node.type === 'journal' ? 'journal' : node.type === 'project' ? 'projects' : node.type}/${node.slug}`;
    const imageUrl = node.coverImage || `${siteConfig.siteUrl}/og.jpg`;

    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: node.title,
      description: node.description,
      url: canonicalUrl,
      image: [imageUrl],
      datePublished: node.publishedAt,
      dateModified: node.updatedAt || node.publishedAt,
      author: {
        '@type': 'Person',
        name: siteConfig.authorName,
        url: siteConfig.siteUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.siteName,
        url: siteConfig.siteUrl,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      keywords: node.taxonomy.tags.join(', '),
    };
  }

  /**
   * Generates Schema.org BreadcrumbList JSON-LD
   */
  public static generateBreadcrumbJsonLd(breadcrumbs: BreadcrumbItem[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.label,
        item: `${siteConfig.siteUrl}${crumb.href}`,
      })),
    };
  }

  /**
   * Generates Schema.org WebSite JSON-LD
   */
  public static generateWebSiteJsonLd(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
      description: siteConfig.defaultDescription,
      author: {
        '@type': 'Person',
        name: siteConfig.authorName,
      },
    };
  }
}
