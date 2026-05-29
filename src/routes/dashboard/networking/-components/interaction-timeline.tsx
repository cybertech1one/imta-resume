import { Trans } from "@lingui/react/macro";
import { CalendarIcon, CheckCircleIcon, ClockIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/style";

import { interactionTypeConfig } from "./network-map-config";
import type { Interaction, NetworkNode } from "./network-map-types";

export interface InteractionTimelineProps {
	interactions: Interaction[];
	nodes: NetworkNode[];
	selectedNode?: NetworkNode | null;
}

export function InteractionTimeline({ interactions, nodes, selectedNode }: InteractionTimelineProps) {
	const filteredInteractions = useMemo(() => {
		const filtered = selectedNode ? interactions.filter((i) => i.nodeId === selectedNode.id) : interactions;
		return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}, [interactions, selectedNode]);

	const getNodeName = (nodeId: string) => nodes.find((n) => n.id === nodeId)?.name || "Unknown";

	if (filteredInteractions.length === 0) {
		return (
			<div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
				<ClockIcon className="mb-2 size-8" />
				<p>
					<Trans>No interactions recorded yet</Trans>
				</p>
			</div>
		);
	}

	return (
		<div className="relative space-y-4">
			{/* Timeline line */}
			<div className="absolute top-0 bottom-0 left-6 w-px bg-border" />

			{filteredInteractions.slice(0, 10).map((interaction, index) => {
				const config = interactionTypeConfig[interaction.type];
				const IconComponent = config.icon;

				return (
					<motion.div
						key={interaction.id}
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
						className="relative flex gap-4 pl-12"
					>
						{/* Timeline dot */}
						<div
							className={cn(
								"absolute left-4 flex size-5 items-center justify-center rounded-full border bg-background",
								config.color,
							)}
						>
							<IconComponent className="size-3" weight="fill" />
						</div>

						<Card className="flex-1">
							<CardContent className="p-3">
								<div className="mb-1 flex items-center justify-between">
									<span className="font-medium text-sm">{config.label}</span>
									<span className="text-muted-foreground text-xs">
										{new Date(interaction.date).toLocaleDateString()}
									</span>
								</div>
								{!selectedNode && <p className="mb-1 text-primary text-sm">with {getNodeName(interaction.nodeId)}</p>}
								<p className="text-muted-foreground text-sm">{interaction.notes}</p>
								{interaction.outcome && (
									<p className="mt-2 text-green-600 text-sm dark:text-green-400">
										<CheckCircleIcon className="mr-1 inline size-4" />
										{interaction.outcome}
									</p>
								)}
								{interaction.followUpDate && (
									<p className="mt-1 text-amber-600 text-xs dark:text-amber-400">
										<CalendarIcon className="mr-1 inline size-3" />
										Follow-up: {new Date(interaction.followUpDate).toLocaleDateString()}
									</p>
								)}
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}
