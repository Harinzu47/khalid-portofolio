'use server';

import { GraphService, KnowledgeGraphData } from '@/services/graph.service';

export async function getKnowledgeGraphAction(): Promise<KnowledgeGraphData> {
  try {
    return await GraphService.buildKnowledgeGraph();
  } catch (err) {
    console.error('Failed to build knowledge graph:', err);
    return {
      nodes: [],
      edges: [],
      stats: { totalNodes: 0, totalEdges: 0, byType: {} },
    };
  }
}
