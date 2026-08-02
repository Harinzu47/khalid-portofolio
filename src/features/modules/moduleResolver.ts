import { knowledgeGraph } from '../knowledge/knowledgeGraph';
import { domainRegistry } from './domainRegistry';
import { DomainModuleData, DomainModuleKey } from './types';

/**
 * Enterprise Module Resolver Engine
 * Executes module queries against the Central Knowledge Graph
 */
export class ModuleResolver {
  /**
   * Resolves unified module data for any of the 20 Developer OS modules
   */
  public static resolveModuleData(key: DomainModuleKey): DomainModuleData {
    const config = domainRegistry[key];
    const targetType = config.targetContentType;

    let allNodes = targetType ? knowledgeGraph.getNodesByType(targetType) : knowledgeGraph.getAllNodes();
    allNodes = allNodes.filter((n) => !n.draft);

    // Apply specific domain filtering if required
    if (key === 'lab-notes') {
      allNodes = allNodes.filter((n) => n.taxonomy.domain === 'Networking' || n.taxonomy.tags.includes('gns3'));
    } else if (key === 'books') {
      allNodes = allNodes.filter((n) => n.taxonomy.tags.includes('books') || n.taxonomy.tags.includes('reading'));
    } else if (key === 'experiments') {
      allNodes = allNodes.filter((n) => n.taxonomy.tags.includes('experiment') || n.taxonomy.tags.includes('poc'));
    }

    const featuredNodes = allNodes.filter((n) => n.featured);
    const sortedNodes = [...allNodes].sort(
      (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    );

    return {
      config,
      totalCount: allNodes.length,
      featuredNodes,
      recentNodes: sortedNodes.slice(0, 5),
      allNodes: sortedNodes,
    };
  }
}
