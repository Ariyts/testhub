import { useEffect, useRef, useMemo, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';
import { FolderItem } from '@/types';

interface GraphNode {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export function GraphView() {
  const folderItems = useWorkspaceStore((s) => s.folderItems);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const setActiveBlock = useWorkspaceStore((s) => s.setActiveBlock);
  
  const graphOpen = useUIStore((s) => s.graphOpen);
  const toggleGraph = useUIStore((s) => s.toggleGraph);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ node: GraphNode | null; startX: number; startY: number }>({
    node: null,
    startX: 0,
    startY: 0,
  });
  const hoveredNodeRef = useRef<GraphNode | null>(null);

  // Filter to only notes
  const notes = useMemo(() => folderItems.filter((i) => i.type === 'note'), [folderItems]);

  // Build graph data from notes
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

    notes.forEach((note: FolderItem, index: number) => {
      const angle = (2 * Math.PI * index) / notes.length;
      const radius = 200;
      nodes.push({
        id: note.id,
        title: note.name,
        x: 400 + radius * Math.cos(angle) + Math.random() * 50,
        y: 300 + radius * Math.sin(angle) + Math.random() * 50,
        vx: 0,
        vy: 0,
        connections: 0,
      });
    });

    notes.forEach((note: FolderItem) => {
      let match;
      while ((match = wikilinkRegex.exec(note.content || '')) !== null) {
        const linkedTitle = match[1].trim();
        const targetNote = notes.find(
          (n: FolderItem) => n.name.toLowerCase() === linkedTitle.toLowerCase()
        );
        if (targetNote && targetNote.id !== note.id) {
          links.push({ source: note.id, target: targetNote.id });
          const sourceNode = nodes.find((n) => n.id === note.id);
          const targetNode = nodes.find((n) => n.id === targetNote.id);
          if (sourceNode) sourceNode.connections++;
          if (targetNode) targetNode.connections++;
        }
      }
    });

    return { nodes, links };
  }, [notes]);

  useEffect(() => {
    nodesRef.current = [...graphData.nodes];
    linksRef.current = [...graphData.links];
  }, [graphData]);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Apply forces
    nodes.forEach((node) => {
      node.vx += (centerX - node.x) * 0.001;
      node.vy += (centerY - node.y) * 0.001;

      nodes.forEach((other) => {
        if (node.id !== other.id) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (distance * distance);
          node.vx += (dx / distance) * force;
          node.vy += (dy / distance) * force;
        }
      });
    });

    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source);
      const target = nodes.find((n) => n.id === link.target);
      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (distance - 100) * 0.01;
        source.vx += (dx / distance) * force;
        source.vy += (dy / distance) * force;
        target.vx -= (dx / distance) * force;
        target.vy -= (dy / distance) * force;
      }
    });

    nodes.forEach((node) => {
      if (dragRef.current.node?.id !== node.id) {
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;
      }
    });

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(scaleRef.current, scaleRef.current);

    // Draw links
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 1.5;
    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source);
      const target = nodes.find((n) => n.id === link.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNodeRef.current?.id === node.id;
      const radius = 6 + Math.min(node.connections * 2, 10);

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#818cf8' : '#6366f1';
      ctx.fill();

      if (isHovered) {
        ctx.strokeStyle = '#c7d2fe';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = isHovered ? '#fafafa' : '#71717a';
      ctx.font = `${isHovered ? 'bold ' : ''}12px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.x, node.y + radius + 14);
    });

    ctx.restore();
    animationRef.current = requestAnimationFrame(simulate);
  }, []);

  useEffect(() => {
    if (!graphOpen) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [graphOpen, simulate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetRef.current.x) / scaleRef.current;
    const y = (e.clientY - rect.top - offsetRef.current.y) / scaleRef.current;

    if (dragRef.current.node) {
      dragRef.current.node.x = x;
      dragRef.current.node.y = y;
      return;
    }

    const nodes = nodesRef.current;
    let found = false;
    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 20) {
        hoveredNodeRef.current = node;
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    if (!found) {
      hoveredNodeRef.current = null;
      canvas.style.cursor = 'default';
    }
  };

  const handleMouseDown = () => {
    if (hoveredNodeRef.current) {
      dragRef.current = {
        node: hoveredNodeRef.current,
        startX: 0,
        startY: 0,
      };
    }
  };

  const handleMouseUp = () => {
    dragRef.current = { node: null, startX: 0, startY: 0 };
  };

  const handleClick = () => {
    if (hoveredNodeRef.current && !dragRef.current.node) {
      const note = notes.find((n) => n.id === hoveredNodeRef.current?.id);
      if (note) {
        setActiveBlock(note.blockId);
        setActiveItem(note.id);
      }
      toggleGraph();
    }
  };

  const handleZoom = (delta: number) => {
    scaleRef.current = Math.max(0.5, Math.min(2, scaleRef.current + delta));
  };

  if (!graphOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm">📊</span>
          </span>
          Graph View
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={() => {
              scaleRef.current = 1;
              offsetRef.current = { x: 0, y: 0 };
            }}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={toggleGraph}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          className="w-full h-full"
        />
      </div>

      <div className="px-4 py-2 border-t border-zinc-800 flex items-center gap-4 text-sm text-zinc-500">
        <span>{graphData.nodes.length} notes</span>
        <span>{graphData.links.length} connections</span>
        <span className="ml-auto">Click a node to open • Drag to move</span>
      </div>
    </div>
  );
}
