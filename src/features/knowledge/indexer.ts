import { ContentNode, ContentNodeType, NormalizedSearchItem } from './types';

/**
 * Enterprise Multi-Index Engine
 */
export class ContentIndexStore {
  public readonly bySlug = new Map<string, ContentNode>();
  public readonly byType = new Map<ContentNodeType, ContentNode[]>();
  public readonly byTag = new Map<string, ContentNode[]>();
  public readonly byCategory = new Map<string, ContentNode[]>();
  public readonly byTechnology = new Map<string, ContentNode[]>();
  public readonly bySkill = new Map<string, ContentNode[]>();
  public readonly byYear = new Map<number, ContentNode[]>();
  public readonly byStatus = new Map<string, ContentNode[]>();
  public readonly featured: ContentNode[] = [];

  constructor(nodes: ContentNode[]) {
    this.buildIndexes(nodes);
  }

  private buildIndexes(nodes: ContentNode[]): void {
    nodes.forEach((node) => {
      // 1. By Slug & ID
      this.bySlug.set(node.slug, node);
      this.bySlug.set(node.id, node);

      // 2. By Type
      if (!this.byType.has(node.type)) this.byType.set(node.type, []);
      this.byType.get(node.type)!.push(node);

      // 3. By Tag
      node.taxonomy.tags.forEach((tag) => {
        const key = tag.toLowerCase();
        if (!this.byTag.has(key)) this.byTag.set(key, []);
        this.byTag.get(key)!.push(node);
      });

      // 4. By Category
      node.taxonomy.categories.forEach((cat) => {
        if (!this.byCategory.has(cat)) this.byCategory.set(cat, []);
        this.byCategory.get(cat)!.push(node);
      });

      // 5. By Technology
      node.technologies.forEach((tech) => {
        const key = tech.toLowerCase();
        if (!this.byTechnology.has(key)) this.byTechnology.set(key, []);
        this.byTechnology.get(key)!.push(node);
      });

      // 6. By Skill
      node.skills.forEach((skill) => {
        const key = skill.toLowerCase();
        if (!this.bySkill.has(key)) this.bySkill.set(key, []);
        this.bySkill.get(key)!.push(node);
      });

      // 7. By Year
      if (node.publishedAt) {
        const year = new Date(node.publishedAt).getFullYear();
        if (!isNaN(year)) {
          if (!this.byYear.has(year)) this.byYear.set(year, []);
          this.byYear.get(year)!.push(node);
        }
      }

      // 8. By Status
      if (node.status) {
        if (!this.byStatus.has(node.status)) this.byStatus.set(node.status, []);
        this.byStatus.get(node.status)!.push(node);
      }

      // 9. Featured
      if (node.featured) {
        this.featured.push(node);
      }
    });
  }

  /**
   * Generates a normalized dataset optimized for static full-text search (Pagefind/FlexSearch)
   */
  public generateNormalizedSearchDataset(): NormalizedSearchItem[] {
    const dataset: NormalizedSearchItem[] = [];

    this.bySlug.forEach((node, key) => {
      // Avoid duplicate entries from ID vs Slug mapping
      if (key !== node.slug) return;

      dataset.push({
        id: node.id,
        slug: node.slug,
        type: node.type,
        title: node.title,
        description: node.description,
        contentSnippet: node.content.slice(0, 300).replace(/[*_#`\n]/g, ' '),
        tags: node.taxonomy.tags,
        categories: node.taxonomy.categories,
        skills: node.skills,
        technologies: node.technologies,
        publishedAt: node.publishedAt,
      });
    });

    return dataset;
  }
}
