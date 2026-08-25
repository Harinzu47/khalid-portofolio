import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { GraphService } from '@/services/graph.service';
import { Network, Loader2 } from 'lucide-react';

const KnowledgeGraphVisualizer = dynamic(
  () =>
    import('@/components/graph/KnowledgeGraphVisualizer').then(
      (mod) => mod.KnowledgeGraphVisualizer
    ),
  {
    loading: () => (
      <div className="w-full h-[650px] rounded-lg border border-terminal-border bg-terminal-surface flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 className="w-6 h-6 text-terminal-primary animate-spin" />
        <span className="text-xs text-terminal-text-muted">
          Loading interactive physics graph canvas...
        </span>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Engineering Knowledge Graph | Khalid Jundullah',
  description:
    'Interactive relational graph visualizer exploring connections across cloud architecture projects, networking technologies, engineering journal entries, and technical articles.',
};

export const dynamicConfig = 'force-dynamic';

export default async function KnowledgeGraphPage() {
  let graphData;
  try {
    graphData = await GraphService.buildKnowledgeGraph();
  } catch (err) {
    console.error('Failed to construct knowledge graph:', err);
    graphData = {
      nodes: [],
      edges: [],
      stats: { totalNodes: 0, totalEdges: 0, byType: {} },
    };
  }

  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 font-mono">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-terminal-primary text-xs">
            <Network className="w-4 h-4" />
            <span>knowledge.network_graph</span>
          </div>
          <h1 className="text-3xl font-bold text-terminal-text-primary tracking-tight">
            Relational Knowledge Graph
          </h1>
          <p className="text-sm text-terminal-text-secondary leading-relaxed max-w-3xl">
            Interactive multi-dimensional topology mapping the connections between systems architecture projects, technologies, skill proficiencies, journal logs, and research articles.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg border border-terminal-border bg-terminal-surface space-y-1">
            <span className="text-[10px] text-terminal-text-muted uppercase">Total Graph Nodes</span>
            <div className="text-lg font-bold text-terminal-primary">
              {graphData.stats.totalNodes}
            </div>
          </div>
          <div className="p-3.5 rounded-lg border border-terminal-border bg-terminal-surface space-y-1">
            <span className="text-[10px] text-terminal-text-muted uppercase">Relational Edges</span>
            <div className="text-lg font-bold text-terminal-secondary">
              {graphData.stats.totalEdges}
            </div>
          </div>
          <div className="p-3.5 rounded-lg border border-terminal-border bg-terminal-surface space-y-1">
            <span className="text-[10px] text-terminal-text-muted uppercase">Projects & Tech</span>
            <div className="text-lg font-bold text-terminal-warning">
              {(graphData.stats.byType.project || 0) + (graphData.stats.byType.technology || 0)}
            </div>
          </div>
          <div className="p-3.5 rounded-lg border border-terminal-border bg-terminal-surface space-y-1">
            <span className="text-[10px] text-terminal-text-muted uppercase">Articles & Logs</span>
            <div className="text-lg font-bold text-terminal-purple">
              {(graphData.stats.byType.article || 0) + (graphData.stats.byType.journal || 0)}
            </div>
          </div>
        </div>

        {/* Interactive Visualizer Canvas */}
        <KnowledgeGraphVisualizer initialData={graphData} />
      </div>
    </main>
  );
}
