import { db } from '@/db/client';
import {
  projects,
  articles,
  journalEntries,
} from '@/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export interface GraphNode {
  id: string;
  label: string;
  type: 'project' | 'technology' | 'skill' | 'article' | 'journal' | 'tag';
  url?: string;
  description?: string | null;
  connectionsCount: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    byType: Record<string, number>;
  };
}

export class GraphService {
  /**
   * Constructs the complete relational knowledge graph from PostgreSQL database relations.
   */
  static async buildKnowledgeGraph(): Promise<KnowledgeGraphData> {
    // 1. Fetch public database entities with relational junctions
    const [
      dbProjects,
      dbTechnologies,
      dbSkills,
      dbArticles,
      dbJournal,
      dbTags,
    ] = await Promise.all([
      db.query.projects.findMany({
        where: isNull(projects.deletedAt),
        with: {
          technologies: true,
          skills: true,
        },
      }),
      db.query.technologies.findMany(),
      db.query.skills.findMany(),
      db.query.articles.findMany({
        where: and(
          eq(articles.status, 'published'),
          sql`${articles.publishedAt} IS NOT NULL`,
          isNull(articles.deletedAt)
        ),
        with: {
          tags: true,
          projects: true,
        },
      }),
      db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.status, 'published'),
          eq(journalEntries.visibility, 'public'),
          sql`${journalEntries.publishedAt} IS NOT NULL`,
          isNull(journalEntries.deletedAt)
        ),
        with: {
          tags: true,
          projects: true,
          technologies: true,
        },
      }),
      db.query.tags.findMany(),
    ]);

    const nodesMap = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];
    const connectionCounts = new Map<string, number>();

    const recordConnection = (nodeId: string) => {
      connectionCounts.set(nodeId, (connectionCounts.get(nodeId) || 0) + 1);
    };

    // Register Technologies
    for (const tech of dbTechnologies) {
      nodesMap.set(`tech-${tech.id}`, {
        id: `tech-${tech.id}`,
        label: tech.name,
        type: 'technology',
        url: tech.websiteUrl || undefined,
        description: tech.category || 'Technology',
        connectionsCount: 0,
      });
    }

    // Register Skills
    for (const skill of dbSkills) {
      nodesMap.set(`skill-${skill.id}`, {
        id: `skill-${skill.id}`,
        label: skill.name,
        type: 'skill',
        description: skill.category || 'Skill',
        connectionsCount: 0,
      });
    }

    // Register Tags
    for (const tag of dbTags) {
      nodesMap.set(`tag-${tag.id}`, {
        id: `tag-${tag.id}`,
        label: `#${tag.name}`,
        type: 'tag',
        description: 'Tag taxonomy',
        connectionsCount: 0,
      });
    }

    // Register Projects & Project Edges
    for (const proj of dbProjects) {
      const projNodeId = `proj-${proj.id}`;
      nodesMap.set(projNodeId, {
        id: projNodeId,
        label: proj.title,
        type: 'project',
        url: `/projects/${proj.slug}`,
        description: proj.shortDescription || proj.description?.slice(0, 100),
        connectionsCount: 0,
      });

      // Project -> Technology edges
      for (const pt of proj.technologies) {
        const targetId = `tech-${pt.technologyId}`;
        if (nodesMap.has(targetId)) {
          edges.push({
            id: `edge-${projNodeId}-${targetId}`,
            source: projNodeId,
            target: targetId,
            relationship: 'built_with',
          });
          recordConnection(projNodeId);
          recordConnection(targetId);
        }
      }

      // Project -> Skill edges
      for (const ps of proj.skills) {
        const targetId = `skill-${ps.skillId}`;
        if (nodesMap.has(targetId)) {
          edges.push({
            id: `edge-${projNodeId}-${targetId}`,
            source: projNodeId,
            target: targetId,
            relationship: 'applies_skill',
          });
          recordConnection(projNodeId);
          recordConnection(targetId);
        }
      }
    }

    // Register Articles & Article Edges
    for (const art of dbArticles) {
      const artNodeId = `art-${art.id}`;
      nodesMap.set(artNodeId, {
        id: artNodeId,
        label: art.title,
        type: 'article',
        url: `/articles/${art.slug}`,
        description: art.excerpt || 'Technical Publication',
        connectionsCount: 0,
      });

      // Article -> Tag edges
      for (const at of art.tags) {
        const targetId = `tag-${at.tagId}`;
        if (nodesMap.has(targetId)) {
          edges.push({
            id: `edge-${artNodeId}-${targetId}`,
            source: artNodeId,
            target: targetId,
            relationship: 'tagged_with',
          });
          recordConnection(artNodeId);
          recordConnection(targetId);
        }
      }

      // Article -> Project edges
      for (const ap of art.projects) {
        const targetId = `proj-${ap.projectId}`;
        if (nodesMap.has(targetId)) {
          edges.push({
            id: `edge-${artNodeId}-${targetId}`,
            source: artNodeId,
            target: targetId,
            relationship: 'discusses_project',
          });
          recordConnection(artNodeId);
          recordConnection(targetId);
        }
      }
    }

    // Register Journal & Journal Edges
    for (const j of dbJournal) {
      const jNodeId = `j-${j.id}`;
      nodesMap.set(jNodeId, {
        id: jNodeId,
        label: j.title,
        type: 'journal',
        url: `/journal/${j.slug}`,
        description: j.summary || `Log on ${j.entryDate}`,
        connectionsCount: 0,
      });

      // Journal -> Tag edges
      for (const jt of j.tags) {
        const targetId = `tag-${jt.tagId}`;
        if (nodesMap.has(targetId)) {
          edges.push({
            id: `edge-${jNodeId}-${targetId}`,
            source: jNodeId,
            target: targetId,
            relationship: 'tagged_with',
          });
          recordConnection(jNodeId);
          recordConnection(targetId);
        }
      }

      // Journal -> Project edges
      for (const jp of j.projects) {
        const targetId = `proj-${jp.projectId}`;
        if (nodesMap.has(targetId)) {
          edges.push({
            id: `edge-${jNodeId}-${targetId}`,
            source: jNodeId,
            target: targetId,
            relationship: 'relates_to_project',
          });
          recordConnection(jNodeId);
          recordConnection(targetId);
        }
      }

      // Journal -> Technology edges
      for (const jtech of j.technologies) {
        const targetId = `tech-${jtech.technologyId}`;
        if (nodesMap.has(targetId)) {
          edges.push({
            id: `edge-${jNodeId}-${targetId}`,
            source: jNodeId,
            target: targetId,
            relationship: 'investigates_tech',
          });
          recordConnection(jNodeId);
          recordConnection(targetId);
        }
      }
    }

    // Apply connection counts to nodes
    const nodes: GraphNode[] = [];
    const byType: Record<string, number> = {
      project: 0,
      technology: 0,
      skill: 0,
      article: 0,
      journal: 0,
      tag: 0,
    };

    for (const node of nodesMap.values()) {
      node.connectionsCount = connectionCounts.get(node.id) || 0;
      // Filter out isolated tags or skills that have zero connections to keep graph clean
      if (node.connectionsCount > 0 || ['project', 'technology', 'article'].includes(node.type)) {
        nodes.push(node);
        byType[node.type] = (byType[node.type] || 0) + 1;
      }
    }

    return {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        byType,
      },
    };
  }
}
