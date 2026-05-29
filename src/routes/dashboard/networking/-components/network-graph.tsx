import { Trans } from "@lingui/react/macro";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/style";

import { categoryConfig, strengthConfig } from "./network-map-config";
import type { NetworkEdge, NetworkNode } from "./network-map-types";

export interface NetworkGraphProps {
	nodes: NetworkNode[];
	edges: NetworkEdge[];
	selectedNode: NetworkNode | null;
	hoveredNode: string | null;
	onNodeClick: (node: NetworkNode) => void;
	onNodeHover: (nodeId: string | null) => void;
	categoryFilter: string;
	strengthFilter: string;
}

export function NetworkGraph({
	nodes,
	edges,
	selectedNode,
	hoveredNode,
	onNodeClick,
	onNodeHover,
	categoryFilter,
	strengthFilter,
}: NetworkGraphProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

	// Filter nodes based on category and strength
	const filteredNodes = useMemo(() => {
		return nodes.filter((node) => {
			const matchesCategory = categoryFilter === "all" || node.category === categoryFilter;
			const matchesStrength = strengthFilter === "all" || node.relationshipStrength === strengthFilter;
			return matchesCategory && matchesStrength;
		});
	}, [nodes, categoryFilter, strengthFilter]);

	const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

	const filteredEdges = useMemo(() => {
		return edges.filter((edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target));
	}, [edges, filteredNodeIds]);

	// Calculate node positions in a force-directed layout simulation
	useEffect(() => {
		if (!containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		setDimensions({ width: rect.width || 800, height: rect.height || 600 });

		// Simple circular layout with category clustering
		const categoryGroups: Record<string, NetworkNode[]> = {};
		filteredNodes.forEach((node) => {
			if (!categoryGroups[node.category]) {
				categoryGroups[node.category] = [];
			}
			categoryGroups[node.category].push(node);
		});

		const positions: Record<string, { x: number; y: number }> = {};
		const centerX = (rect.width || 800) / 2;
		const centerY = (rect.height || 600) / 2;
		const radius = Math.min(centerX, centerY) * 0.7;

		const categories = Object.keys(categoryGroups);
		const categoryAngleStep = (2 * Math.PI) / Math.max(categories.length, 1);

		categories.forEach((category, categoryIndex) => {
			const categoryAngle = categoryIndex * categoryAngleStep - Math.PI / 2;
			const categoryNodes = categoryGroups[category];
			const clusterRadius = Math.min(100, radius * 0.4);

			categoryNodes.forEach((node, nodeIndex) => {
				const nodeAngle = (nodeIndex / categoryNodes.length) * 2 * Math.PI;
				const clusterX = centerX + Math.cos(categoryAngle) * radius * 0.6;
				const clusterY = centerY + Math.sin(categoryAngle) * radius * 0.6;

				positions[node.id] = {
					x: clusterX + Math.cos(nodeAngle) * clusterRadius * (0.5 + Math.random() * 0.5),
					y: clusterY + Math.sin(nodeAngle) * clusterRadius * (0.5 + Math.random() * 0.5),
				};
			});
		});

		setNodePositions(positions);
	}, [filteredNodes]);

	const getNodeRadius = (node: NetworkNode) => {
		const baseRadius = 24;
		if (node.id === selectedNode?.id) return baseRadius * 1.4;
		if (node.id === hoveredNode) return baseRadius * 1.2;
		if (node.relationshipStrength === "strong") return baseRadius * 1.1;
		return baseRadius;
	};

	const getEdgeOpacity = (edge: NetworkEdge) => {
		const config = strengthConfig[edge.strength];
		if (hoveredNode) {
			if (edge.source === hoveredNode || edge.target === hoveredNode) {
				return 1;
			}
			return 0.1;
		}
		if (selectedNode) {
			if (edge.source === selectedNode.id || edge.target === selectedNode.id) {
				return 1;
			}
			return 0.2;
		}
		return config.opacity;
	};

	return (
		<div
			ref={containerRef}
			className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-background via-muted/20 to-background"
		>
			{/* Background pattern */}
			<div className="absolute inset-0 opacity-30">
				<svg className="h-full w-full">
					<defs>
						<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path
								d="M 40 0 L 0 0 0 40"
								fill="none"
								stroke="currentColor"
								strokeWidth="0.5"
								className="text-muted-foreground/20"
							/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#grid)" />
				</svg>
			</div>

			{/* SVG Network */}
			<svg className="relative z-10 h-full w-full">
				{/* Edges */}
				<g className="edges">
					{filteredEdges.map((edge) => {
						const sourcePos = nodePositions[edge.source];
						const targetPos = nodePositions[edge.target];
						if (!sourcePos || !targetPos) return null;

						const config = strengthConfig[edge.strength];
						const opacity = getEdgeOpacity(edge);

						return (
							<motion.line
								key={`${edge.source}-${edge.target}`}
								x1={sourcePos.x}
								y1={sourcePos.y}
								x2={targetPos.x}
								y2={targetPos.y}
								stroke={config.color}
								strokeWidth={config.lineWidth}
								strokeLinecap="round"
								initial={false}
								animate={{ opacity, pathLength: 1 }}
								transition={{ duration: 0.5 }}
								className="transition-opacity duration-300"
							/>
						);
					})}
				</g>

				{/* Nodes */}
				<g className="nodes">
					{filteredNodes.map((node) => {
						const pos = nodePositions[node.id];
						if (!pos) return null;

						const config = categoryConfig[node.category];
						const radius = getNodeRadius(node);
						const isSelected = node.id === selectedNode?.id;
						const isHovered = node.id === hoveredNode;
						const isHighlighted = isSelected || isHovered;
						const isConnectedToHovered =
							hoveredNode &&
							filteredEdges.some(
								(e) =>
									(e.source === hoveredNode && e.target === node.id) ||
									(e.target === hoveredNode && e.source === node.id),
							);

						return (
							<motion.g
								key={node.id}
								initial={false}
								animate={{
									scale: 1,
									opacity: hoveredNode && !isHighlighted && !isConnectedToHovered ? 0.3 : 1,
									x: pos.x,
									y: pos.y,
								}}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
								onClick={() => onNodeClick(node)}
								onMouseEnter={() => onNodeHover(node.id)}
								onMouseLeave={() => onNodeHover(null)}
								className="cursor-pointer"
								style={{ transformOrigin: "center" }}
							>
								{/* Outer glow for selected/hovered */}
								{isHighlighted && (
									<motion.circle
										r={radius + 8}
										fill={config.nodeColor}
										opacity={0.2}
										initial={{ scale: 0.8 }}
										animate={{ scale: [1, 1.2, 1] }}
										transition={{ duration: 1.5, repeat: Infinity }}
									/>
								)}

								{/* Node circle */}
								<circle
									r={radius}
									fill={config.nodeColor}
									className="transition-all duration-200"
									opacity={isHighlighted ? 1 : 0.85}
								/>

								{/* Node border */}
								<circle
									r={radius}
									fill="none"
									stroke={isSelected ? "#ffffff" : config.nodeColor}
									strokeWidth={isSelected ? 3 : 2}
									opacity={isHighlighted ? 1 : 0.5}
								/>

								{/* Node initials */}
								<text
									textAnchor="middle"
									dy="0.35em"
									className="pointer-events-none select-none fill-white font-semibold"
									fontSize={radius * 0.7}
								>
									{node.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</text>

								{/* Favorite indicator */}
								{node.isFavorite && (
									<g transform={`translate(${radius * 0.7}, ${-radius * 0.7})`}>
										<circle r={8} fill="#fbbf24" />
										<text textAnchor="middle" dy="0.35em" fontSize={10} className="fill-white">
											★
										</text>
									</g>
								)}
							</motion.g>
						);
					})}
				</g>
			</svg>

			{/* Node tooltip */}
			<AnimatePresence>
				{hoveredNode && nodePositions[hoveredNode] && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="pointer-events-none absolute z-20 rounded-lg border bg-popover p-3 shadow-lg"
						style={{
							left: Math.min(nodePositions[hoveredNode].x + 20, dimensions.width - 200),
							top: Math.min(nodePositions[hoveredNode].y - 40, dimensions.height - 100),
						}}
					>
						{(() => {
							const node = nodes.find((n) => n.id === hoveredNode);
							if (!node) return null;
							const config = categoryConfig[node.category];
							return (
								<div className="space-y-1">
									<p className="font-semibold">{node.name}</p>
									<p className="text-muted-foreground text-sm">{node.jobTitle}</p>
									<p className="text-muted-foreground text-sm">{node.company}</p>
									<Badge className={cn("mt-1", config.color)}>{config.label}</Badge>
								</div>
							);
						})()}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Legend */}
			<div className="absolute bottom-4 left-4 z-10 rounded-lg border bg-background/90 p-3 backdrop-blur-sm">
				<p className="mb-2 font-medium text-sm">
					<Trans>Categories</Trans>
				</p>
				<div className="flex flex-wrap gap-2">
					{Object.entries(categoryConfig)
						.slice(0, 4)
						.map(([key, config]) => (
							<div key={key} className="flex items-center gap-1">
								<div className="size-3 rounded-full" style={{ backgroundColor: config.nodeColor }} />
								<span className="text-muted-foreground text-xs">{config.label}</span>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
