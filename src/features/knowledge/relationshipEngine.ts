import { ContentNode, NodeRelation, RelationType } from './types';

/**
 * Enterprise Knowledge Graph Relationship Engine
 */
export class RelationshipEngine {
  private relations: NodeRelation[] = [];

  /**
   * Registers a explicit directed relation between two nodes
   */
  public addRelation(sourceId: string, targetId: string, type: RelationType, metadata?: Record<string, string>): void {
    this.relations.push({
      sourceId,
      targetId,
      type,
      metadata,
    });
  }

  /**
   * Automatically inspects nodes and extracts relations from frontmatter references and wikilinks
   */
  public buildGraphRelations(nodes: ContentNode[]): void {
    const nodeMap = new Map<string, ContentNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));
    nodes.forEach((n) => nodeMap.set(n.slug, n));

    nodes.forEach((sourceNode) => {
      // 1. Process explicit references array
      sourceNode.references.forEach((ref) => {
        const target = nodeMap.get(ref);
        if (target) {
          this.addRelation(sourceNode.id, target.id, 'references');
        }
      });

      // 2. Process explicit relatedContent array
      sourceNode.relatedContent.forEach((rel) => {
        const target = nodeMap.get(rel);
        if (target) {
          this.addRelation(sourceNode.id, target.id, 'related');
        }
      });

      // 3. Process markdown wikilinks [[slug]] or [[id]] in content text
      const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
      let match: RegExpExecArray | null;
      while ((match = wikilinkRegex.exec(sourceNode.content)) !== null) {
        const refSlug = match[1].trim();
        const target = nodeMap.get(refSlug);
        if (target) {
          this.addRelation(sourceNode.id, target.id, 'mentions');
        }
      }
    });
  }

  /**
   * Retrieves all outgoing relations from a given node
   */
  public getOutgoingRelations(sourceId: string, type?: RelationType): NodeRelation[] {
    return this.relations.filter(
      (r) => r.sourceId === sourceId && (!type || r.type === type)
    );
  }

  /**
   * Retrieves all incoming relations (backlinks) pointing to a given node
   */
  public getIncomingRelations(targetId: string, type?: RelationType): NodeRelation[] {
    return this.relations.filter(
      (r) => r.targetId === targetId && (!type || r.type === type)
    );
  }

  /**
   * Retrieves two-way graph connections (outgoing + incoming backlinks)
   */
  public getConnectedNodeIds(nodeId: string): string[] {
    const set = new Set<string>();
    this.relations.forEach((r) => {
      if (r.sourceId === nodeId) set.add(r.targetId);
      if (r.targetId === nodeId) set.add(r.sourceId);
    });
    return Array.from(set);
  }

  /**
   * Dumps entire relationship graph
   */
  public getAllRelations(): NodeRelation[] {
    return [...this.relations];
  }
}
