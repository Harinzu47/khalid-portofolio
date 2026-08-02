import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { knowledgeGraph } from '../knowledge/knowledgeGraph';
import { ContentNode, ContentNodeType } from '../knowledge/types';
import { getSkillById } from '../knowledge/skillsRegistry';
import { getTechnologyById } from '../knowledge/technologyRegistry';
import { generateBreadcrumbs } from './breadcrumbEngine';
import { getRouteByContentType } from './routeRegistry';
import { PageResolutionResult, PrevNextNavigation } from './types';

const BASE_URL = 'https://hzcode.my.id';

/**
 * Enterprise Content Resolver API
 * Centralized content resolution engine powering App Router static params, metadata, and page data.
 */
export class ContentResolver {
  /**
   * Resolves static params for generateStaticParams() across any content collection
   */
  public static resolveStaticParams(type: ContentNodeType): { slug: string }[] {
    const nodes = knowledgeGraph.getNodesByType(type);
    return nodes
      .filter((n) => !n.draft)
      .map((n) => ({
        slug: n.slug,
      }));
  }

  /**
   * Resolves complete node data, breadcrumbs, prev/next, and related content for detail pages
   */
  public static resolvePageData(type: ContentNodeType, slug: string): PageResolutionResult {
    const node = knowledgeGraph.getNodeBySlug(slug);

    if (!node || node.type !== type || node.draft) {
      notFound();
    }

    const breadcrumbs = generateBreadcrumbs(node);
    const prevNext = this.resolvePrevNext(type, slug);
    const relatedNodes = knowledgeGraph.findRelatedNodes(node.id, 3);

    const skills = node.skills
      .map((id) => getSkillById(id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined)
      .map((s) => ({ id: s.id, name: s.name }));

    const technologies = node.technologies
      .map((id) => getTechnologyById(id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
      .map((t) => ({ id: t.id, name: t.name }));

    return {
      node,
      breadcrumbs,
      prevNext,
      relatedNodes,
      skills,
      technologies,
    };
  }

  /**
   * Resolves Next.js Metadata object dynamically for any content page
   */
  public static resolvePageMetadata(type: ContentNodeType, slug?: string): Metadata {
    const routeEntry = getRouteByContentType(type, Boolean(slug));

    if (slug) {
      const node = knowledgeGraph.getNodeBySlug(slug);
      if (node && !node.draft) {
        const pageTitle = `${node.title} | hzcode`;
        const canonical = `${BASE_URL}/${type === 'article' ? 'articles' : type === 'journal' ? 'journal' : type === 'project' ? 'projects' : type === 'note' ? 'notes' : type}/${node.slug}`;
        const ogImage = node.coverImage || `${BASE_URL}/api/og?title=${encodeURIComponent(node.title)}`;

        return {
          title: pageTitle,
          description: node.description,
          authors: [{ name: 'Khalid Jundullah', url: BASE_URL }],
          alternates: {
            canonical,
          },
          openGraph: {
            title: pageTitle,
            description: node.description,
            url: canonical,
            siteName: 'hzcode',
            images: [{ url: ogImage, width: 1200, height: 630, alt: node.title }],
            type: 'article',
            publishedTime: node.publishedAt,
            tags: node.taxonomy.tags,
          },
          twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: node.description,
            images: [ogImage],
          },
          robots: {
            index: true,
            follow: true,
          },
        };
      }
    }

    // Default collection metadata
    const title = routeEntry?.title || 'hzcode — Developer OS';
    const description = routeEntry?.description || 'Personal Developer OS & Knowledge System';
    const canonical = `${BASE_URL}${routeEntry?.path || ''}`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'hzcode',
        type: 'website',
      },
    };
  }

  /**
   * Resolves Previous / Next navigation items for chronological collections
   */
  public static resolvePrevNext(type: ContentNodeType, currentSlug: string): PrevNextNavigation {
    const nodes = knowledgeGraph.getNodesByType(type).filter((n) => !n.draft);
    const parentRoute = getRouteByContentType(type, false);

    const idx = nodes.findIndex((n) => n.slug === currentSlug);

    if (idx === -1) {
      return { prev: null, next: null };
    }

    const prevNode = idx < nodes.length - 1 ? nodes[idx + 1] : null;
    const nextNode = idx > 0 ? nodes[idx - 1] : null;

    const buildPath = (n: ContentNode) =>
      parentRoute ? `${parentRoute.path.replace('[slug]', n.slug).replace('[...slug]', n.slug)}` : `/${n.slug}`;

    return {
      prev: prevNode ? { title: prevNode.title, slug: prevNode.slug, path: buildPath(prevNode) } : null,
      next: nextNode ? { title: nextNode.title, slug: nextNode.slug, path: buildPath(nextNode) } : null,
    };
  }
}
