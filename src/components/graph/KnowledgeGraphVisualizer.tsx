'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { KnowledgeGraphData, GraphNode, GraphEdge } from '@/services/graph.service';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';

interface SimulatedNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const TYPE_COLORS: Record<GraphNode['type'], string> = {
  project: '#58a6ff',
  technology: '#3fb950',
  article: '#d2a8ff',
  journal: '#f0883e',
  skill: '#79c0ff',
  tag: '#8b949e',
};

export function KnowledgeGraphVisualizer({ initialData }: { initialData: KnowledgeGraphData }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filter & Search State
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<SimulatedNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SimulatedNode | null>(null);

  // Pan & Zoom State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<SimulatedNode | null>(null);

  // Nodes & Edges simulation references
  const nodesRef = useRef<SimulatedNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize simulation data
  useEffect(() => {
    const width = 1000;
    const height = 700;

    nodesRef.current = initialData.nodes.map((n, i) => {
      const angle = (i / (initialData.nodes.length || 1)) * 2 * Math.PI;
      const dist = 150 + Math.random() * 200;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: Math.max(8, Math.min(22, 10 + n.connectionsCount * 2)),
        color: TYPE_COLORS[n.type] || '#58a6ff',
      };
    });

    edgesRef.current = initialData.edges;
  }, [initialData]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // Physics Simulation Step
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Filtered visibility check
      const isVisible = (node: SimulatedNode) => {
        const matchesType = selectedType === 'all' || node.type === selectedType;
        const matchesSearch =
          !searchQuery.trim() ||
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      };

      // 1. Repulsion between visible nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          if (!isVisible(n1) || !isVisible(n2)) continue;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 220) {
            const force = (220 - dist) / dist;
            const fx = dx * force * 0.03;
            const fy = dy * force * 0.03;
            if (n1 !== draggedNode) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2 !== draggedNode) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 2. Attraction along edges
      for (const edge of edges) {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target || !isVisible(source) || !isVisible(target)) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredDist = 120;
        const force = (dist - desiredDist) * 0.005;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (source !== draggedNode) {
          source.vx += fx;
          source.vy += fy;
        }
        if (target !== draggedNode) {
          target.vx -= fx;
          target.vy -= fy;
        }
      }

      // 3. Center gravity & velocity dampening
      const centerX = width / 2;
      const centerY = height / 2;

      for (const node of nodes) {
        if (node === draggedNode) continue;
        const cdx = centerX - node.x;
        const cdy = centerY - node.y;
        node.vx += cdx * 0.0008;
        node.vy += cdy * 0.0008;

        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      }

      // 4. Drawing Canvas
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw Grid Background in World Space
      ctx.strokeStyle = '#30363d1a';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = -width; x < width * 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -height);
        ctx.lineTo(x, height * 2);
        ctx.stroke();
      }
      for (let y = -height; y < height * 2; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-width, y);
        ctx.lineTo(width * 2, y);
        ctx.stroke();
      }

      // Draw Edges
      for (const edge of edges) {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target || !isVisible(source) || !isVisible(target)) continue;

        const isHighlighted =
          hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isHighlighted ? '#58a6ff99' : '#30363d55';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
      }

      // Draw Nodes
      for (const node of nodes) {
        if (!isVisible(node)) continue;

        const isHovered = hoveredNode?.id === node.id;
        const isSel = selectedNode?.id === node.id;

        // Glow ring for hovered/selected
        if (isHovered || isSel) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = `${node.color}33`;
          ctx.fill();
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#0d1117';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node Label
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = isHovered || isSel ? '#ffffff' : '#c9d1d9';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedType, searchQuery, zoom, pan, hoveredNode, selectedNode, draggedNode]);

  // Coordinate Conversion Helper (Screen -> Canvas World Space)
  const getCanvasWorldPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasWorldPos(e.clientX, e.clientY);
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    if (clickedNode) {
      setDraggedNode(clickedNode);
      setSelectedNode(clickedNode);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasWorldPos(e.clientX, e.clientY);

    if (draggedNode) {
      draggedNode.x = x;
      draggedNode.y = y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      return;
    }

    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

    // Hover detection
    const found = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    setHoveredNode(found || null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.4, Math.min(2.5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <div className="relative w-full rounded-lg border border-terminal-border bg-terminal-surface shadow-2xl overflow-hidden font-mono">
      {/* Control Topbar */}
      <div className="p-4 bg-terminal-bg border-b border-terminal-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-terminal-text-muted flex items-center space-x-1 mr-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {['all', 'project', 'technology', 'skill', 'article', 'journal', 'tag'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition-colors ${
                selectedType === type
                  ? 'bg-terminal-primary text-terminal-bg font-semibold'
                  : 'bg-terminal-surface border border-terminal-border text-terminal-text-secondary hover:text-terminal-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search & Zoom Actions */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-terminal-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph..."
              className="pl-8 pr-3 py-1 bg-terminal-surface border border-terminal-border rounded text-xs text-terminal-text-primary focus:outline-none focus:border-terminal-primary w-40 sm:w-48"
            />
          </div>

          <div className="flex items-center space-x-1 border-l border-terminal-border pl-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z * 1.2))}
              className="p-1.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, z * 0.8))}
              className="p-1.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="relative w-full h-[600px] bg-terminal-bg cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Selected / Hovered Node Inspector Drawer */}
        {(selectedNode || hoveredNode) && (
          <div className="absolute bottom-4 left-4 max-w-sm p-4 rounded-lg border border-terminal-border bg-terminal-surface/95 backdrop-blur shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                style={{
                  backgroundColor: `${TYPE_COLORS[(selectedNode || hoveredNode)!.type]}22`,
                  color: TYPE_COLORS[(selectedNode || hoveredNode)!.type],
                }}
              >
                {(selectedNode || hoveredNode)!.type}
              </span>
              <span className="text-[11px] text-terminal-text-muted">
                {(selectedNode || hoveredNode)!.connectionsCount} connection(s)
              </span>
            </div>

            <h4 className="text-sm font-bold text-terminal-text-primary">
              {(selectedNode || hoveredNode)!.label}
            </h4>

            {(selectedNode || hoveredNode)!.description && (
              <p className="text-terminal-text-secondary text-[11px] leading-relaxed">
                {(selectedNode || hoveredNode)!.description}
              </p>
            )}

            {(selectedNode || hoveredNode)!.url && (
              <button
                type="button"
                onClick={() => {
                  const url = (selectedNode || hoveredNode)!.url;
                  if (url?.startsWith('http')) {
                    window.open(url, '_blank');
                  } else if (url) {
                    router.push(url);
                  }
                }}
                className="mt-2 inline-flex items-center space-x-1.5 text-xs text-terminal-primary hover:underline"
              >
                <span>Navigate to entity</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Graph Legend */}
        <div className="absolute top-4 left-4 p-3 rounded bg-terminal-surface/85 backdrop-blur border border-terminal-border space-y-1.5 text-[11px]">
          <span className="text-[10px] font-bold text-terminal-text-muted uppercase">Legend</span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="capitalize text-terminal-text-secondary">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
