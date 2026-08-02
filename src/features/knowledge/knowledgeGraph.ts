import {
  getArticles,
  getJournalEntries,
  getProjects,
  getCareerHistory,
  getCertificates,
  getNotes,
  getPage,
} from '../../lib/content';
import { processMdxContent } from '../mdx/engine';
import { ContentNode, ContentNodeType, Taxonomy } from './types';
import { RelationshipEngine } from './relationshipEngine';
import { ContentIndexStore } from './indexer';

/**
 * Enterprise Central Knowledge Graph & Content Registry
 */
export class KnowledgeGraphEngine {
  private static instance: KnowledgeGraphEngine;
  private nodes: ContentNode[] = [];
  private relationshipEngine = new RelationshipEngine();
  private indexStore!: ContentIndexStore;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): KnowledgeGraphEngine {
    if (!KnowledgeGraphEngine.instance) {
      KnowledgeGraphEngine.instance = new KnowledgeGraphEngine();
      KnowledgeGraphEngine.instance.initializeGraph();
    }
    return KnowledgeGraphEngine.instance;
  }

  /**
   * Initializes and populates Knowledge Graph nodes and indexes at build-time
   */
  private initializeGraph(): void {
    if (this.isInitialized) return;

    const rawNodes: ContentNode[] = [];

    // 1. Articles
    getArticles().forEach((a) => {
      const processed = processMdxContent({ content: a.content, slug: a.slug, frontmatter: a });
      rawNodes.push(this.buildContentNode('article', a.slug, a.title, a.summary, processed, a));
    });

    // 2. Journal
    getJournalEntries().forEach((j) => {
      const processed = processMdxContent({ content: j.content, slug: j.slug, frontmatter: j });
      rawNodes.push(this.buildContentNode('journal', j.slug, j.title, j.excerpt, processed, j));
    });

    // 3. Projects
    getProjects().forEach((p) => {
      const processed = processMdxContent({ content: p.content, slug: p.slug, frontmatter: p });
      rawNodes.push(this.buildContentNode('project', p.slug, p.title, p.shortDescription, processed, p));
    });

    // 4. Career
    getCareerHistory().forEach((c) => {
      const processed = processMdxContent({ content: c.content, slug: c.slug, frontmatter: c });
      rawNodes.push(this.buildContentNode('career', c.slug, c.role, `${c.company} - ${c.role}`, processed, c));
    });

    // 5. Certificates
    getCertificates().forEach((cert) => {
      const processed = processMdxContent({ content: cert.content, slug: cert.slug, frontmatter: cert });
      rawNodes.push(this.buildContentNode('certificate', cert.slug, cert.title, `Issued by ${cert.issuer}`, processed, cert));
    });

    // 6. Notes
    getNotes().forEach((n) => {
      const processed = processMdxContent({ content: n.content, slug: n.slug, frontmatter: n });
      rawNodes.push(this.buildContentNode('note', n.slug, n.title, `Technical note on ${n.title}`, processed, n));
    });

    // 7. Pages (now, uses, about, resume)
    ['about', 'now', 'uses', 'resume'].forEach((pageSlug) => {
      const pageData = getPage(pageSlug);
      if (pageData) {
        const processed = processMdxContent({ content: pageData.content, slug: pageData.slug, frontmatter: pageData });
        const pageType: ContentNodeType = pageSlug === 'now' ? 'now' : pageSlug === 'uses' ? 'uses' : pageSlug === 'resume' ? 'resume' : 'page';
        rawNodes.push(this.buildContentNode(pageType, pageData.slug, pageData.title, `${pageData.title} page`, processed, pageData));
      }
    });

    this.nodes = rawNodes;

    // Build Relationship Graph
    this.relationshipEngine.buildGraphRelations(this.nodes);

    // Build Multi-Index Store
    this.indexStore = new ContentIndexStore(this.nodes);

    this.isInitialized = true;
  }

  private buildContentNode(
    type: ContentNodeType,
    slug: string,
    title: string,
    description: string,
    processed: ReturnType<typeof processMdxContent>,
    meta: Record<string, any>
  ): ContentNode {
    const taxonomy: Taxonomy = {
      tags: (meta.tags as string[]) || [],
      categories: meta.category ? [meta.category as string] : [],
      topics: (meta.topics as string[]) || [],
      series: (meta.series as string) || undefined,
      domain: (meta.domain as Taxonomy['domain']) || (meta.category === 'Infra' ? 'Infrastructure' : meta.category === 'Networking' ? 'Networking' : meta.category === 'Web Dev' ? 'Web Dev' : meta.category === 'AI' ? 'AI' : 'General'),
    };

    return {
      id: `${type}-${slug.replace(/\//g, '-')}`,
      slug,
      type,
      title,
      description,
      summary: (meta.summary || meta.excerpt || meta.shortDescription) as string || undefined,
      status: (meta.status as ContentNode['status']) || (meta.draft ? 'draft' : 'published'),
      draft: Boolean(meta.draft),
      publishedAt: (meta.date || meta.issueDate || meta.startDate || meta.lastUpdated || '') as string,
      updatedAt: (meta.lastUpdated || meta.updatedAt) as string || undefined,
      readingTime: processed.metadata.readingTime,
      wordCount: processed.metadata.wordCount,
      taxonomy,
      authors: [meta.author || 'Khalid Jundullah'],
      coverImage: meta.image || meta.badgeImage || undefined,
      featured: Boolean(meta.featured),
      language: meta.language || 'en',
      canonicalURL: meta.canonicalUrl || undefined,
      headings: processed.headings,
      references: meta.references || [],
      relatedContent: meta.relatedNotes || meta.relatedContent || [],
      skills: meta.skills || meta.skillsCovered || [],
      technologies: meta.technologies || [],
      difficulty: meta.difficulty || undefined,
      content: processed.rawContent,
    };
  }

  /**
   * Accessors
   */
  public getAllNodes(): ContentNode[] {
    return this.nodes;
  }

  public getNodeBySlug(slug: string): ContentNode | undefined {
    return this.indexStore.bySlug.get(slug);
  }

  public getNodesByType(type: ContentNodeType): ContentNode[] {
    return this.indexStore.byType.get(type) || [];
  }

  public getIndexStore(): ContentIndexStore {
    return this.indexStore;
  }

  public getRelationshipEngine(): RelationshipEngine {
    return this.relationshipEngine;
  }

  /**
   * Reusable Related Content Query Engine
   * Finds related nodes matching technology, skill, or tag without query duplication
   */
  public findRelatedNodes(nodeId: string, limit = 3): ContentNode[] {
    const currentNode = this.nodes.find((n) => n.id === nodeId || n.slug === nodeId);
    if (!currentNode) return [];

    // Check explicit relationship engine connections first
    const connectedIds = this.relationshipEngine.getConnectedNodeIds(currentNode.id);
    const connectedNodes = this.nodes.filter((n) => connectedIds.includes(n.id));

    if (connectedNodes.length >= limit) {
      return connectedNodes.slice(0, limit);
    }

    // Score remaining nodes by matching technologies, skills, and tags
    const scores = new Map<string, number>();

    this.nodes.forEach((candidate) => {
      if (candidate.id === currentNode.id) return;
      if (connectedIds.includes(candidate.id)) return;

      let score = 0;

      // 1. Shared technologies (+3 pts)
      candidate.technologies.forEach((tech) => {
        if (currentNode.technologies.includes(tech)) score += 3;
      });

      // 2. Shared skills (+3 pts)
      candidate.skills.forEach((skill) => {
        if (currentNode.skills.includes(skill)) score += 3;
      });

      // 3. Shared tags (+2 pts)
      candidate.taxonomy.tags.forEach((tag) => {
        if (currentNode.taxonomy.tags.includes(tag)) score += 2;
      });

      // 4. Shared domain (+1 pt)
      if (candidate.taxonomy.domain === currentNode.taxonomy.domain) {
        score += 1;
      }

      if (score > 0) {
        scores.set(candidate.id, score);
      }
    });

    const scoredNodes = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.nodes.find((n) => n.id === id)!)
      .filter(Boolean);

    return [...connectedNodes, ...scoredNodes].slice(0, limit);
  }

  public findNodesByTechnology(techId: string): ContentNode[] {
    return this.indexStore.byTechnology.get(techId.toLowerCase()) || [];
  }

  public findNodesBySkill(skillId: string): ContentNode[] {
    return this.indexStore.bySkill.get(skillId.toLowerCase()) || [];
  }

  public findNodesByTag(tag: string): ContentNode[] {
    return this.indexStore.byTag.get(tag.toLowerCase()) || [];
  }
}

/**
 * Singleton Exporter
 */
export const knowledgeGraph = KnowledgeGraphEngine.getInstance();
