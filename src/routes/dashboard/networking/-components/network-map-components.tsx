import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	BellIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadIcon,
	EnvelopeIcon,
	FunnelIcon,
	LightbulbIcon,
	LinkedinLogoIcon,
	LinkIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	PlusIcon,
	ShareNetworkIcon,
	StarIcon,
	TagIcon,
	TrendUpIcon,
	UserCircleIcon,
	UserPlusIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { InteractionTimeline } from "./interaction-timeline";
import { NetworkGraph } from "./network-graph";
import { categoryConfig, interactionTypeConfig, strengthConfig } from "./network-map-config";
import type {
	ConnectionCategory,
	ConnectionReminder,
	Interaction,
	InteractionType,
	NetworkEdge,
	NetworkNode,
	RelationshipStrength,
	SuggestedConnection,
} from "./network-map-types";

// =============================================================================
// HERO SECTION
// =============================================================================

export function HeroSection({
	stats,
}: {
	stats: { total: number; strong: number; pendingReminders: number; recentInteractions: number };
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.6 0.18 200 / 0.15) 0%, oklch(0.65 0.2 260 / 0.1) 50%, oklch(0.55 0.15 180 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-pink-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<ShareNetworkIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Visual Network</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Map Your Professional Network</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Visualize connections, discover mutual contacts, track interactions, and grow your professional network
						strategically.
					</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<UsersIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.total}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Connections</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TrendUpIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.strong}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Strong Ties</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<BellIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.pendingReminders}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Reminders</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<ClockIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.recentInteractions}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>This Week</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// MAP TAB CONTENT
// =============================================================================

export function MapTabContent({
	searchFilteredNodes,
	edges,
	selectedNode,
	hoveredNode,
	onNodeClick,
	onNodeHover,
	categoryFilter,
	strengthFilter,
	searchQuery,
	setCategoryFilter,
	setStrengthFilter,
	setSearchQuery,
}: {
	searchFilteredNodes: NetworkNode[];
	edges: NetworkEdge[];
	selectedNode: NetworkNode | null;
	hoveredNode: string | null;
	onNodeClick: (node: NetworkNode) => void;
	onNodeHover: (id: string | null) => void;
	categoryFilter: string;
	strengthFilter: string;
	searchQuery: string;
	setCategoryFilter: (v: string) => void;
	setStrengthFilter: (v: string) => void;
	setSearchQuery: (v: string) => void;
}) {
	return (
		<div className="space-y-6">
			{/* Filters */}
			<section className="rounded-xl border bg-muted/30 p-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-center">
					<div className="flex items-center gap-2">
						<FunnelIcon className="size-5 text-muted-foreground" />
						<span className="font-medium text-sm">
							<Trans>Filter:</Trans>
						</span>
					</div>

					<div className="flex flex-1 flex-col gap-3 md:flex-row">
						<div className="relative flex-1">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={t`Search connections...`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-full md:w-44">
								<SelectValue placeholder={t`Category`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Categories`}</SelectItem>
								{Object.entries(categoryConfig).map(([key, { label, icon: IconComp }]) => (
									<SelectItem key={key} value={key}>
										<div className="flex items-center gap-2">
											<IconComp className="size-4" />
											{label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={strengthFilter} onValueChange={setStrengthFilter}>
							<SelectTrigger className="w-full md:w-44">
								<SelectValue placeholder={t`Strength`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Strengths`}</SelectItem>
								{Object.entries(strengthConfig).map(([key, { label }]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{(categoryFilter !== "all" || strengthFilter !== "all" || searchQuery) && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setCategoryFilter("all");
								setStrengthFilter("all");
								setSearchQuery("");
							}}
						>
							<XIcon className="mr-1 size-4" />
							<Trans>Clear</Trans>
						</Button>
					)}
				</div>
			</section>

			{/* Network Graph */}
			<Card className="overflow-hidden">
				<CardContent className="p-0">
					<div className="h-[600px]">
						<NetworkGraph
							nodes={searchFilteredNodes}
							edges={edges}
							selectedNode={selectedNode}
							hoveredNode={hoveredNode}
							onNodeClick={onNodeClick}
							onNodeHover={onNodeHover}
							categoryFilter={categoryFilter}
							strengthFilter={strengthFilter}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Connection List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UsersIcon className="size-5" />
						<Trans>All Connections</Trans>
						<Badge variant="outline">{searchFilteredNodes.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-80">
						<div className="space-y-2">
							{searchFilteredNodes.map((node) => {
								const config = categoryConfig[node.category];
								const IconComp = config.icon;
								return (
									<motion.div
										key={node.id}
										initial={false}
										animate={{ opacity: 1 }}
										className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
										onClick={() => onNodeClick(node)}
									>
										<div className="flex items-center gap-3">
											<div
												className={cn("flex size-10 items-center justify-center rounded-full font-semibold text-white")}
												style={{ backgroundColor: config.nodeColor }}
											>
												{node.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</div>
											<div>
												<div className="flex items-center gap-2">
													<p className="font-medium">{node.name}</p>
													{node.isFavorite && <StarIcon className="size-4 text-amber-500" weight="fill" />}
												</div>
												<p className="text-muted-foreground text-sm">
													{node.jobTitle} at {node.company}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge className={config.color}>
												<IconComp className="mr-1 size-3" />
												{config.label}
											</Badge>
											<Badge variant="outline" className="capitalize">
												{node.relationshipStrength}
											</Badge>
										</div>
									</motion.div>
								);
							})}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}

// =============================================================================
// REMINDERS TAB CONTENT
// =============================================================================

export function RemindersTabContent({
	reminders,
	nodes,
	onCompleteReminder,
	onNodeClick,
}: {
	reminders: ConnectionReminder[];
	nodes: NetworkNode[];
	onCompleteReminder: (id: string) => void;
	onNodeClick: (node: NetworkNode) => void;
}) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Pending Reminders */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BellIcon className="size-5 text-amber-500" weight="duotone" />
						<Trans>Pending Reminders</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{reminders.filter((r) => !r.completed).length > 0 ? (
						<div className="space-y-3">
							{reminders
								.filter((r) => !r.completed)
								.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
								.map((reminder) => {
									const isOverdue = new Date(reminder.dueDate) < new Date();
									return (
										<motion.div
											key={reminder.id}
											initial={false}
											animate={{ opacity: 1 }}
											className={cn(
												"rounded-lg border p-4",
												isOverdue && "border-red-500/50 bg-red-50/50 dark:bg-red-900/10",
											)}
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													<div className="mb-1 flex items-center gap-2">
														<h4 className="font-semibold">{reminder.title}</h4>
														{isOverdue && (
															<Badge className="bg-red-500 text-white">
																<Trans>Overdue</Trans>
															</Badge>
														)}
														{reminder.isRecurring && (
															<Badge variant="outline">
																<ArrowClockwiseIcon className="mr-1 size-3" />
																{reminder.frequency}
															</Badge>
														)}
													</div>
													<p className="mb-2 text-muted-foreground text-sm">{reminder.description}</p>
													<div className="flex items-center gap-3 text-muted-foreground text-xs">
														<span className="flex items-center gap-1">
															<UserCircleIcon className="size-4" />
															{reminder.nodeName}
														</span>
														<span className="flex items-center gap-1">
															<CalendarIcon className="size-4" />
															{new Date(reminder.dueDate).toLocaleDateString()}
														</span>
													</div>
												</div>
												<Button size="sm" onClick={() => onCompleteReminder(reminder.id)}>
													<CheckCircleIcon className="mr-1 size-4" />
													<Trans>Done</Trans>
												</Button>
											</div>
										</motion.div>
									);
								})}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<CheckCircleIcon className="mb-2 size-12 text-green-500" weight="duotone" />
							<p className="font-medium">
								<Trans>All caught up!</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>No pending reminders</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dormant Connections */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="size-5 text-gray-500" weight="duotone" />
						<Trans>Reconnect Suggestions</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Connections you haven't interacted with recently</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{nodes
							.filter((n) => {
								if (!n.lastInteractionAt) return true;
								const lastInteraction = new Date(n.lastInteractionAt);
								const thirtyDaysAgo = new Date();
								thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
								return lastInteraction < thirtyDaysAgo;
							})
							.slice(0, 5)
							.map((node) => {
								const config = categoryConfig[node.category];
								return (
									<div
										key={node.id}
										className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
										onClick={() => onNodeClick(node)}
									>
										<div className="flex items-center gap-3">
											<div
												className="flex size-10 items-center justify-center rounded-full text-white"
												style={{ backgroundColor: config.nodeColor }}
											>
												{node.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</div>
											<div>
												<p className="font-medium">{node.name}</p>
												<p className="text-muted-foreground text-xs">
													Last contact:{" "}
													{node.lastInteractionAt ? new Date(node.lastInteractionAt).toLocaleDateString() : "Never"}
												</p>
											</div>
										</div>
										<Button variant="outline" size="sm">
											<EnvelopeIcon className="mr-1 size-4" />
											<Trans>Reach Out</Trans>
										</Button>
									</div>
								);
							})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// =============================================================================
// SUGGESTIONS TAB CONTENT
// =============================================================================

export function SuggestionsTabContent({
	suggestedConnections,
	nodes,
	onAddSuggested,
	getMutualConnections,
}: {
	suggestedConnections: SuggestedConnection[];
	nodes: NetworkNode[];
	onAddSuggested: (s: SuggestedConnection) => void;
	getMutualConnections: (node: NetworkNode) => NetworkNode[];
}) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-amber-500" weight="duotone" />
						<Trans>Suggested Connections</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>People you might want to connect with based on your network</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{suggestedConnections.map((suggestion) => (
							<motion.div
								key={suggestion.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-lg border p-4"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-start gap-3">
										<div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-semibold text-primary">
											{suggestion.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</div>
										<div>
											<h4 className="font-semibold">{suggestion.name}</h4>
											<p className="text-muted-foreground text-sm">
												{suggestion.jobTitle} at {suggestion.company}
											</p>
											<p className="mt-1 text-primary text-sm">{suggestion.reason}</p>
											<div className="mt-2 flex items-center gap-2">
												<LinkIcon className="size-4 text-muted-foreground" />
												<span className="text-muted-foreground text-xs">
													{suggestion.mutualConnections.length} mutual connection
													{suggestion.mutualConnections.length > 1 ? "s" : ""}
												</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col items-end gap-2">
										<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
											{suggestion.relevanceScore}% match
										</Badge>
										<Button size="sm" onClick={() => onAddSuggested(suggestion)}>
											<UserPlusIcon className="mr-1 size-4" />
											<Trans>Add</Trans>
										</Button>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Mutual Connections Discovery */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LinkIcon className="size-5 text-purple-500" weight="duotone" />
						<Trans>Mutual Connections Map</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Discover who connects your network together</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{nodes
							.filter((n) => n.mutualConnections.length > 0)
							.sort((a, b) => b.mutualConnections.length - a.mutualConnections.length)
							.slice(0, 5)
							.map((node) => {
								const mutuals = getMutualConnections(node);
								const config = categoryConfig[node.category];
								return (
									<div key={node.id} className="flex items-center justify-between rounded-lg border p-3">
										<div className="flex items-center gap-3">
											<div
												className="flex size-10 items-center justify-center rounded-full text-white"
												style={{ backgroundColor: config.nodeColor }}
											>
												{node.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</div>
											<div>
												<p className="font-medium">{node.name}</p>
												<p className="text-muted-foreground text-sm">{node.company}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="flex -space-x-2">
												{mutuals.slice(0, 3).map((mutual) => (
													<Tooltip key={mutual.id}>
														<TooltipTrigger asChild>
															<div
																className="flex size-8 items-center justify-center rounded-full border-2 border-background text-white text-xs"
																style={{
																	backgroundColor: categoryConfig[mutual.category].nodeColor,
																}}
															>
																{mutual.name
																	.split(" ")
																	.map((n) => n[0])
																	.join("")}
															</div>
														</TooltipTrigger>
														<TooltipContent>{mutual.name}</TooltipContent>
													</Tooltip>
												))}
												{mutuals.length > 3 && (
													<div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
														+{mutuals.length - 3}
													</div>
												)}
											</div>
											<Badge variant="outline">{mutuals.length} mutual</Badge>
										</div>
									</div>
								);
							})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// =============================================================================
// NODE DETAIL DIALOG
// =============================================================================

export function NodeDetailDialog({
	open,
	onOpenChange,
	selectedNode,
	interactions,
	nodes,
	getMutualConnections,
	onDelete,
	onToggleFavorite,
	onOpenAddInteraction,
	onOpenReminder,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	selectedNode: NetworkNode | null;
	interactions: Interaction[];
	nodes: NetworkNode[];
	getMutualConnections: (node: NetworkNode) => NetworkNode[];
	onDelete: (id: string) => void;
	onToggleFavorite: (id: string) => void;
	onOpenAddInteraction: () => void;
	onOpenReminder: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				{selectedNode && (
					<>
						<DialogHeader>
							<div className="flex items-start gap-4">
								<div
									className="flex size-16 items-center justify-center rounded-full font-bold text-2xl text-white"
									style={{ backgroundColor: categoryConfig[selectedNode.category].nodeColor }}
								>
									{selectedNode.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</div>
								<div className="flex-1">
									<DialogTitle className="flex items-center gap-2 text-xl">
										{selectedNode.name}
										{selectedNode.isFavorite && <StarIcon className="size-5 text-amber-500" weight="fill" />}
									</DialogTitle>
									<DialogDescription className="mt-1">
										{selectedNode.jobTitle} at {selectedNode.company}
									</DialogDescription>
									<div className="mt-2 flex flex-wrap gap-2">
										<Badge className={categoryConfig[selectedNode.category].color}>
											{categoryConfig[selectedNode.category].label}
										</Badge>
										<Badge variant="outline" className="capitalize">
											{selectedNode.relationshipStrength} connection
										</Badge>
									</div>
								</div>
							</div>
						</DialogHeader>

						<Separator className="my-4" />

						<div className="space-y-4">
							{/* Contact Info */}
							<div className="space-y-2">
								<h4 className="font-semibold">
									<Trans>Contact Information</Trans>
								</h4>
								<div className="grid gap-2 text-sm">
									<div className="flex items-center gap-2">
										<EnvelopeIcon className="size-4 text-muted-foreground" />
										<a href={`mailto:${selectedNode.email}`} className="text-primary hover:underline">
											{selectedNode.email}
										</a>
									</div>
									{selectedNode.location && (
										<div className="flex items-center gap-2">
											<MapPinIcon className="size-4 text-muted-foreground" />
											<span>{selectedNode.location}</span>
										</div>
									)}
									{selectedNode.linkedinUrl && (
										<div className="flex items-center gap-2">
											<LinkedinLogoIcon className="size-4 text-muted-foreground" />
											<a
												href={selectedNode.linkedinUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline"
											>
												<Trans>LinkedIn Profile</Trans>
											</a>
										</div>
									)}
								</div>
							</div>

							{/* Tags */}
							{selectedNode.tags.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-semibold">
										<Trans>Tags</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{selectedNode.tags.map((tag) => (
											<Badge key={tag} variant="outline">
												<TagIcon className="mr-1 size-3" />
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Notes */}
							{selectedNode.notes && (
								<div className="space-y-2">
									<h4 className="font-semibold">
										<Trans>Notes</Trans>
									</h4>
									<p className="text-muted-foreground text-sm">{selectedNode.notes}</p>
								</div>
							)}

							{/* Mutual Connections */}
							{selectedNode.mutualConnections.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-semibold">
										<Trans>Mutual Connections</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{getMutualConnections(selectedNode).map((mutual) => (
											<Badge key={mutual.id} className={categoryConfig[mutual.category].color}>
												{mutual.name}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Interaction History */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold">
										<Trans>Recent Interactions</Trans>
									</h4>
									<Button variant="outline" size="sm" onClick={onOpenAddInteraction}>
										<PlusIcon className="mr-1 size-4" />
										<Trans>Log Interaction</Trans>
									</Button>
								</div>
								<InteractionTimeline interactions={interactions} nodes={nodes} selectedNode={selectedNode} />
							</div>
						</div>

						<DialogFooter className="mt-6">
							<div className="flex w-full items-center justify-between">
								<Button variant="destructive" onClick={() => onDelete(selectedNode.id)}>
									<XIcon className="mr-1 size-4" />
									<Trans>Delete</Trans>
								</Button>
								<div className="flex gap-2">
									<Button variant="outline" onClick={() => onToggleFavorite(selectedNode.id)}>
										<StarIcon className="mr-1 size-4" weight={selectedNode.isFavorite ? "fill" : "regular"} />
										{selectedNode.isFavorite ? <Trans>Unfavorite</Trans> : <Trans>Favorite</Trans>}
									</Button>
									<Button onClick={onOpenReminder}>
										<BellIcon className="mr-1 size-4" />
										<Trans>Set Reminder</Trans>
									</Button>
								</div>
							</div>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// =============================================================================
// ADD NODE DIALOG
// =============================================================================

export function AddNodeDialog({
	open,
	onOpenChange,
	form,
	setForm,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	form: Partial<NetworkNode>;
	setForm: (v: Partial<NetworkNode>) => void;
	onSubmit: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						<Trans>Add New Connection</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Add a new contact to your professional network</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">
							<Trans>Full Name</Trans> *
						</Label>
						<Input
							id="name"
							placeholder={t`John Doe`}
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">
								<Trans>Email</Trans>
							</Label>
							<Input
								id="email"
								type="email"
								placeholder={t`john@example.com`}
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="company">
								<Trans>Company</Trans> *
							</Label>
							<Input
								id="company"
								placeholder={t`Acme Corp`}
								value={form.company}
								onChange={(e) => setForm({ ...form, company: e.target.value })}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="jobTitle">
								<Trans>Job Title</Trans>
							</Label>
							<Input
								id="jobTitle"
								placeholder={t`Software Engineer`}
								value={form.jobTitle}
								onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="location">
								<Trans>Location</Trans>
							</Label>
							<Input
								id="location"
								placeholder={t`San Francisco, CA`}
								value={form.location || ""}
								onChange={(e) => setForm({ ...form, location: e.target.value })}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>
								<Trans>Category</Trans>
							</Label>
							<Select
								value={form.category}
								onValueChange={(value) => setForm({ ...form, category: value as ConnectionCategory })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(categoryConfig).map(([key, { label, icon: IconComp }]) => (
										<SelectItem key={key} value={key}>
											<div className="flex items-center gap-2">
												<IconComp className="size-4" />
												{label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label>
								<Trans>Relationship Strength</Trans>
							</Label>
							<Select
								value={form.relationshipStrength}
								onValueChange={(value) =>
									setForm({
										...form,
										relationshipStrength: value as RelationshipStrength,
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(strengthConfig).map(([key, { label }]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="linkedin">
							<Trans>LinkedIn URL</Trans>
						</Label>
						<Input
							id="linkedin"
							placeholder={t`https://linkedin.com/in/...`}
							value={form.linkedinUrl || ""}
							onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="notes">
							<Trans>Notes</Trans>
						</Label>
						<Textarea
							id="notes"
							placeholder={t`How did you meet? Any important details...`}
							value={form.notes}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
						/>
					</div>

					<div className="flex items-center gap-2">
						<Switch
							id="favorite"
							checked={form.isFavorite}
							onCheckedChange={(checked) => setForm({ ...form, isFavorite: checked })}
						/>
						<Label htmlFor="favorite">
							<Trans>Mark as favorite</Trans>
						</Label>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!form.name || !form.company}>
						<Trans>Add Connection</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// =============================================================================
// ADD INTERACTION DIALOG
// =============================================================================

export function AddInteractionDialog({
	open,
	onOpenChange,
	selectedNodeName,
	form,
	setForm,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	selectedNodeName: string | undefined;
	form: Partial<Interaction>;
	setForm: (v: Partial<Interaction>) => void;
	onSubmit: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Log Interaction</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Record an interaction with {selectedNodeName}</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>
								<Trans>Type</Trans>
							</Label>
							<Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as InteractionType })}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(interactionTypeConfig).map(([key, { label, icon: IconComp }]) => (
										<SelectItem key={key} value={key}>
											<div className="flex items-center gap-2">
												<IconComp className="size-4" />
												{label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="date">
								<Trans>Date</Trans>
							</Label>
							<Input
								id="date"
								type="date"
								value={form.date}
								onChange={(e) => setForm({ ...form, date: e.target.value })}
							/>
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="interactionNotes">
							<Trans>Notes</Trans>
						</Label>
						<Textarea
							id="interactionNotes"
							placeholder={t`What did you discuss?`}
							value={form.notes}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="outcome">
							<Trans>Outcome (optional)</Trans>
						</Label>
						<Input
							id="outcome"
							placeholder={t`Any results or next steps`}
							value={form.outcome || ""}
							onChange={(e) => setForm({ ...form, outcome: e.target.value })}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="followUp">
							<Trans>Follow-up Date (optional)</Trans>
						</Label>
						<Input
							id="followUp"
							type="date"
							value={form.followUpDate || ""}
							onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit}>
						<Trans>Log Interaction</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// =============================================================================
// ADD REMINDER DIALOG
// =============================================================================

export function AddReminderDialog({
	open,
	onOpenChange,
	selectedNodeName,
	form,
	setForm,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	selectedNodeName: string | undefined;
	form: Partial<ConnectionReminder>;
	setForm: (v: Partial<ConnectionReminder>) => void;
	onSubmit: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Set Reminder</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Create a reminder to follow up with {selectedNodeName}</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="reminderTitle">
							<Trans>Title</Trans>
						</Label>
						<Input
							id="reminderTitle"
							placeholder={t`e.g., Follow up on job opportunity`}
							value={form.title}
							onChange={(e) => setForm({ ...form, title: e.target.value })}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="reminderDescription">
							<Trans>Description</Trans>
						</Label>
						<Textarea
							id="reminderDescription"
							placeholder={t`What do you want to remember?`}
							value={form.description}
							onChange={(e) => setForm({ ...form, description: e.target.value })}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="dueDate">
								<Trans>Due Date</Trans>
							</Label>
							<Input
								id="dueDate"
								type="date"
								value={form.dueDate}
								onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
							/>
						</div>
						<div className="grid gap-2">
							<Label>
								<Trans>Frequency</Trans>
							</Label>
							<Select
								value={form.frequency}
								onValueChange={(value) =>
									setForm({
										...form,
										frequency: value as ConnectionReminder["frequency"],
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="weekly">
										<Trans>Weekly</Trans>
									</SelectItem>
									<SelectItem value="biweekly">
										<Trans>Bi-weekly</Trans>
									</SelectItem>
									<SelectItem value="monthly">
										<Trans>Monthly</Trans>
									</SelectItem>
									<SelectItem value="quarterly">
										<Trans>Quarterly</Trans>
									</SelectItem>
									<SelectItem value="yearly">
										<Trans>Yearly</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Switch
							id="recurring"
							checked={form.isRecurring}
							onCheckedChange={(checked) => setForm({ ...form, isRecurring: checked })}
						/>
						<Label htmlFor="recurring">
							<Trans>Make this a recurring reminder</Trans>
						</Label>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!form.title || !form.dueDate}>
						<Trans>Set Reminder</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// =============================================================================
// EXPORT DIALOG
// =============================================================================

export function ExportDialog({
	open,
	onOpenChange,
	onExport,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onExport: (format: "json" | "csv") => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Export Network Data</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Download your network data for backup or analysis</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<Card className="cursor-pointer transition-all hover:border-primary" onClick={() => onExport("json")}>
						<CardContent className="flex items-center gap-4 p-4">
							<div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
								<DownloadIcon className="size-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>JSON Format</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Complete data export including all relationships</Trans>
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="cursor-pointer transition-all hover:border-primary" onClick={() => onExport("csv")}>
						<CardContent className="flex items-center gap-4 p-4">
							<div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
								<DownloadIcon className="size-6 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>CSV Format</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Spreadsheet-compatible contact list</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
