import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Note, GraphData, GraphNode, GraphLink } from '../types';

interface KnowledgeGraphProps {
  notes: Note[];
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ notes }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || notes.length === 0) return;

    // Prepare Data
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    // Explicitly type the arrays to prevent 'unknown' type inference from Set
    const books: string[] = Array.from(new Set(notes.map(n => n.bookTitle)));
    const allTags: string[] = Array.from(new Set(notes.flatMap(n => n.tags)));

    // 1. Book Nodes (Group 1)
    books.forEach(book => {
      nodes.push({ id: book, group: 1, label: book, val: 20 });
    });

    // 2. Note Nodes (Group 2) - connected to Books
    notes.forEach(note => {
      nodes.push({ id: note.id, group: 2, label: note.content.substring(0, 10) + '...', val: 10 });
      links.push({ source: note.bookTitle, target: note.id, value: 3 });
    });

    // 3. Tag Nodes (Group 3) - connected to Notes
    allTags.forEach(tag => {
      nodes.push({ id: `tag-${tag}`, group: 3, label: `#${tag}`, val: 8 });
      // Connect tag to relevant notes
      notes.filter(n => n.tags.includes(tag)).forEach(n => {
        links.push({ source: n.id, target: `tag-${tag}`, value: 1 });
      });
    });

    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 500;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g");

    // Circles
    node.append("circle")
      .attr("r", d => d.group === 1 ? 12 : (d.group === 3 ? 6 : 8))
      .attr("fill", d => {
        if (d.group === 1) return "#D4A373"; // Book color
        if (d.group === 2) return "#A3B18A"; // Note color
        return "#588157"; // Tag color
      });

    // Labels
    node.append("text")
      .text(d => d.label)
      .attr("x", 15)
      .attr("y", 4)
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .style("fill", "#333")
      .style("pointer-events", "none");

    node.call(d3.drag<any, any>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Cleanup on unmount
    return () => {
      simulation.stop();
    };

  }, [notes]);

  return (
    <div className="w-full h-[500px] bg-white/50 rounded-xl border border-stone-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-4 left-4 text-sm text-stone-500 font-serif z-10 bg-white/80 px-2 py-1 rounded">
        Interactive Knowledge Map
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default KnowledgeGraph;