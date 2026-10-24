import React, { useState } from 'react';
import {
  GraphNode,
  GraphEdge
} from '../../types';
import {
  AlertCircle,
  Package,
  Layers,
  Truck,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  FileText,
  Clock,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

interface InvestigationGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
}

export const InvestigationGraph: React.FC<InvestigationGraphProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId: externalSelectedNodeId
}) => {
  const [internalSelectedNode, setInternalSelectedNode] = useState<GraphNode | null>(
    nodes.find((n) => n.id === 'node-inv-stock') || nodes[0] || null
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');

  const activeNode = externalSelectedNodeId
    ? nodes.find((n) => n.id === externalSelectedNodeId) || internalSelectedNode
    : internalSelectedNode;

  const handleNodeClick = (node: GraphNode) => {
    setInternalSelectedNode(node);
    onSelectNode?.(node);
  };

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'incident':
        return <TrendingDown className="w-4 h-4 text-signal-magenta" />;
      case 'product':
        return <Package className="w-4 h-4 text-signal-cyan" />;
      case 'inventory':
        return <Layers className="w-4 h-4 text-signal-blue" />;
      case 'supplier':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'hypothesis':
        return <HelpCircle className="w-4 h-4 text-purple-400" />;
      case 'action':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-300" />;
    }
  };

  const getNodeBorderColor = (node: GraphNode, isSelected: boolean) => {
    if (isSelected) return 'stroke-white stroke-[2.5]';
    if (node.status === 'contradicted') return 'stroke-slate-600 stroke-1 stroke-dasharray-2';
    if (node.isKeyFinding) return 'stroke-signal-magenta stroke-[1.8]';
    return 'stroke-signal-cyan stroke-1';
  };

  const filteredNodes = filterType === 'all'
    ? nodes
    : nodes.filter((n) => n.type === filterType || (filterType === 'key' && n.isKeyFinding));

  return (
    <div className="relative w-full h-[540px] rounded-2xl glass-panel border border-surface-border overflow-hidden flex flex-col">
      {/* Graph Toolbar & Controls Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border/80 bg-surface-dark/60 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal-cyan animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wide">
              CAUSAL EVIDENCE GRAPH
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-light border border-surface-border text-slate-300">
            {nodes.length} Verified Entities • {edges.length} Causal Links
          </span>
        </div>

        {/* Filters and View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-surface-light p-0.5 border border-surface-border text-xs">
            {['all', 'key', 'inventory', 'supplier'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                  filterType === f
                    ? 'bg-signal-cyan/20 text-signal-cyan font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'key' ? 'Key Finding Path' : f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-surface-border pl-2">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              aria-label="Zoom in graph"
              className="p-1.5 rounded bg-surface-light hover:bg-surface-border text-slate-300 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
              aria-label="Zoom out graph"
              className="p-1.5 rounded bg-surface-light hover:bg-surface-border text-slate-300 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              aria-label="Reset zoom"
              className="p-1.5 rounded bg-surface-light hover:bg-surface-border text-slate-300 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-obsidian-dark/95 select-none">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(57, 207, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Arrowhead markers */}
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#39CFFF" />
            </marker>
            <marker
              id="arrow-magenta"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#FF2FB3" />
            </marker>
            <marker
              id="arrow-muted"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748B" />
            </marker>
          </defs>

          {/* Render Graph Edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isKey = edge.isKeyPath;
            const isInferred = edge.isInferred;

            // Generate cubic bezier curve path
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const cx1 = sourceNode.x + dx * 0.45;
            const cy1 = sourceNode.y;
            const cx2 = sourceNode.x + dx * 0.55;
            const cy2 = targetNode.y;
            const pathD = `M ${sourceNode.x} ${sourceNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x} ${targetNode.y}`;

            return (
              <g key={edge.id} className="transition-opacity duration-300">
                {/* Glow underlay for key causal path */}
                {isKey && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#FF2FB3"
                    strokeWidth="4"
                    strokeOpacity="0.25"
                    filter="blur(3px)"
                  />
                )}
                {/* Edge line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isKey ? '#FF2FB3' : isInferred ? '#9333EA' : '#39CFFF'}
                  strokeWidth={isKey ? 2.2 : 1.5}
                  strokeDasharray={isInferred ? '5,5' : undefined}
                  markerEnd={isKey ? 'url(#arrow-magenta)' : 'url(#arrow-cyan)'}
                  strokeOpacity={isKey ? 0.9 : 0.65}
                />
                {/* Edge Label Pill */}
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - 8}
                  fill={isKey ? '#FF2FB3' : '#94A3B8'}
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="select-none pointer-events-none bg-obsidian"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Graph Nodes */}
          {filteredNodes.map((node) => {
            const isSelected = activeNode?.id === node.id;
            const isKey = node.isKeyFinding;
            const isContradicted = node.status === 'contradicted';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer group select-none"
              >
                {/* Outer Glow on Selected or Key Node */}
                {(isSelected || isKey) && (
                  <circle
                    r={isSelected ? 36 : 30}
                    fill="none"
                    stroke={isKey ? '#FF2FB3' : '#39CFFF'}
                    strokeOpacity={isSelected ? 0.4 : 0.25}
                    strokeWidth="4"
                    className={isSelected ? 'animate-pulse' : ''}
                  />
                )}

                {/* Node Body Circle */}
                <circle
                  r="24"
                  fill="#171A25"
                  className={`transition-all duration-200 group-hover:scale-110 ${getNodeBorderColor(
                    node,
                    isSelected
                  )}`}
                />

                {/* Status Indicator Dot */}
                <circle
                  cx="16"
                  cy="-16"
                  r="5"
                  fill={
                    isContradicted
                      ? '#EF4444'
                      : isKey
                      ? '#FF2FB3'
                      : node.status === 'confirmed'
                      ? '#39CFFF'
                      : '#F59E0B'
                  }
                  stroke="#07080D"
                  strokeWidth="1.5"
                />

                {/* Center Glyph Icon container */}
                <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center">
                    {getNodeIcon(node.type)}
                  </div>
                </foreignObject>

                {/* Node Label underneath */}
                <text
                  y="38"
                  textAnchor="middle"
                  fill={isSelected ? '#FFFFFF' : isKey ? '#FF2FB3' : '#E2E8F0'}
                  fontSize="11"
                  fontWeight={isSelected || isKey ? '600' : '400'}
                  className="font-sans select-none pointer-events-none drop-shadow"
                >
                  {node.label}
                </text>

                {/* Node Sub-Type Badge */}
                <text
                  y="51"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                  className="uppercase select-none pointer-events-none"
                >
                  {node.type} • {node.status || 'verified'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-surface-dark/90 border border-surface-border text-[11px] flex flex-wrap items-center gap-3 backdrop-blur-md z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-signal-cyan" />
            <span className="text-slate-300">Observed Fact</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-signal-magenta" />
            <span className="text-slate-300">Key Finding Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-purple-400" />
            <span className="text-slate-300">Inferred Link</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Contradicted</span>
          </div>
        </div>
      </div>

      {/* Floating Node Details Inspector Sidebar */}
      {activeNode && (
        <div className="absolute top-14 right-3 w-80 max-w-[90%] glass-panel rounded-xl p-4 border border-surface-border shadow-2xl z-30 animate-fadeIn text-left">
          <div className="flex items-start justify-between pb-2 mb-2 border-b border-surface-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-light text-signal-cyan">
                  {activeNode.type}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    activeNode.status === 'confirmed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : activeNode.status === 'contradicted'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-purple-950 text-purple-400 border border-purple-800'
                  }`}
                >
                  {activeNode.status?.toUpperCase() || 'CONFIRMED'}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1.5">
                {activeNode.details.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setInternalSelectedNode(null)}
              className="text-slate-400 hover:text-white p-1 rounded"
              aria-label="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {activeNode.details.description}
          </p>

          {/* Metrics Pill List */}
          {activeNode.details.metrics && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {Object.entries(activeNode.details.metrics).map(([k, v]) => (
                <div key={k} className="p-2 rounded-lg bg-surface-dark border border-surface-border">
                  <span className="text-[10px] font-mono text-slate-400 block">{k}</span>
                  <span className="text-xs font-semibold text-signal-cyan font-mono">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Source Provenance Link */}
          {activeNode.details.sourceUri && (
            <div className="p-2 rounded-lg bg-surface-light border border-surface-border/70 flex items-center justify-between">
              <div className="overflow-hidden pr-2">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">
                  Grounding Source:
                </span>
                <span className="text-[11px] font-mono text-signal-blue truncate block">
                  {activeNode.details.sourceUri}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
