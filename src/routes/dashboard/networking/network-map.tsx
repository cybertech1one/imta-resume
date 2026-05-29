import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	ChartLineUpIcon,
	ClockIcon,
	ExportIcon,
	LightbulbIcon,
	PlusIcon,
	ShareNetworkIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import { InteractionTimeline } from "./-components/interaction-timeline";
import { AnalyticsDashboard } from "./-components/network-analytics-dashboard";
import {
	AddInteractionDialog,
	AddNodeDialog,
	AddReminderDialog,
	ExportDialog,
	HeroSection,
	MapTabContent,
	NodeDetailDialog,
	RemindersTabContent,
	SuggestionsTabContent,
} from "./-components/network-map-components";
import type {
	ConnectionCategory,
	ConnectionReminder,
	Interaction,
	InteractionType,
	NetworkEdge,
	NetworkGrowthData,
	NetworkNode,
	RelationshipStrength,
	SuggestedConnection,
} from "./-components/network-map-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/networking/network-map" as any)({
	component: NetworkMapPage,
	errorComponent: ErrorComponent,
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function NetworkMapPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("map");

	// Database queries
	const { data: dbContacts } = useQuery({ ...orpc.networking.list.queryOptions({}), enabled: !!session?.user });
	const { data: dbStats } = useQuery({ ...orpc.networking.getStatistics.queryOptions(), enabled: !!session?.user });
	const { data: dbFollowUps } = useQuery({
		...orpc.networking.getFollowUpReminders.queryOptions({}),
		enabled: !!session?.user,
	});

	// Transform DB contacts to NetworkNode type
	const nodes: NetworkNode[] = useMemo(() => {
		if (!dbContacts || dbContacts.length === 0) return [];
		return dbContacts.map((c) => ({
			id: c.id,
			name: c.name || "",
			email: c.email || "",
			company: c.company || "",
			jobTitle: c.position || "",
			category: (c.relationship as ConnectionCategory) || "other",
			relationshipStrength: (c.relationshipStrength as RelationshipStrength) || "weak",
			linkedinUrl: c.linkedinUrl || undefined,
			location: undefined,
			tags: (c.tags as string[]) || [],
			notes: c.notes || "",
			createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "",
			lastInteractionAt: c.lastContactedAt ? new Date(c.lastContactedAt).toISOString().split("T")[0] : undefined,
			isFavorite: c.isFavorite || false,
			mutualConnections: [],
		}));
	}, [dbContacts]);

	// Generate edges from nodes (connect nodes that share the same company or tags)
	const edges: NetworkEdge[] = useMemo(() => {
		const result: NetworkEdge[] = [];
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i];
				const b = nodes[j];
				const sameCompany = a.company && b.company && a.company === b.company;
				const sharedTags = a.tags.filter((t) => b.tags.includes(t)).length > 0;
				if (sameCompany || sharedTags) {
					const strength: RelationshipStrength =
						a.relationshipStrength === "strong" && b.relationshipStrength === "strong"
							? "strong"
							: a.relationshipStrength === "dormant" || b.relationshipStrength === "dormant"
								? "dormant"
								: "moderate";
					result.push({ source: a.id, target: b.id, strength });
				}
			}
		}
		return result;
	}, [nodes]);

	// Interactions from local state (DB interactions per-contact are fetched on demand)
	const [localInteractions, setLocalInteractions] = useState<Interaction[]>([]);
	const interactions = localInteractions;

	// Reminders from follow-up data
	const reminders: ConnectionReminder[] = useMemo(() => {
		if (!dbFollowUps || dbFollowUps.length === 0) return [];
		return dbFollowUps.map((c) => ({
			id: `rem-${c.id}`,
			nodeId: c.id,
			nodeName: c.name || "",
			title: `Follow up with ${(c.name || "").split(" ")[0] || "contact"}`,
			description: c.notes || "",
			dueDate: c.nextFollowUpAt ? new Date(c.nextFollowUpAt).toISOString().split("T")[0] : "",
			frequency: "monthly" as const,
			isRecurring: false,
			completed: false,
		}));
	}, [dbFollowUps]);

	// Suggested connections are empty until AI-powered suggestion feature is built
	const suggestedConnections: SuggestedConnection[] = useMemo(() => [], []);

	// Growth data derived from contact creation dates
	const growthData: NetworkGrowthData[] = useMemo(() => {
		if (nodes.length === 0) return [];
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		const now = new Date();
		const result: NetworkGrowthData[] = [];
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
			const beforeEnd = nodes.filter((n) => new Date(n.createdAt) <= monthEnd);
			const colleagues = beforeEnd.filter((n) => n.category === "colleague").length;
			const mentors = beforeEnd.filter((n) => n.category === "mentor").length;
			const recruiters = beforeEnd.filter((n) => n.category === "recruiter").length;
			const others = beforeEnd.length - colleagues - mentors - recruiters;
			result.push({
				month: months[d.getMonth()],
				colleagues,
				mentors,
				recruiters,
				others,
				total: beforeEnd.length,
			});
		}
		return result;
	}, [nodes]);

	// UI State
	const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
	const [hoveredNode, setHoveredNode] = useState<string | null>(null);
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [strengthFilter, setStrengthFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [isNodeDetailOpen, setIsNodeDetailOpen] = useState(false);
	const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
	const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);
	const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
	const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

	// Form State
	const [newNodeForm, setNewNodeForm] = useState<Partial<NetworkNode>>({
		name: "",
		email: "",
		company: "",
		jobTitle: "",
		category: "other",
		relationshipStrength: "weak",
		tags: [],
		notes: "",
		isFavorite: false,
		mutualConnections: [],
	});

	const [newInteractionForm, setNewInteractionForm] = useState<Partial<Interaction>>({
		type: "email",
		date: new Date().toISOString().split("T")[0],
		notes: "",
		outcome: "",
	});

	const [newReminderForm, setNewReminderForm] = useState<Partial<ConnectionReminder>>({
		title: "",
		description: "",
		dueDate: "",
		frequency: "monthly",
		isRecurring: false,
	});

	// Filtered nodes for search
	const searchFilteredNodes = useMemo(() => {
		if (!searchQuery) return nodes;
		const query = searchQuery.toLowerCase();
		return nodes.filter(
			(node) =>
				node.name.toLowerCase().includes(query) ||
				node.company.toLowerCase().includes(query) ||
				node.jobTitle.toLowerCase().includes(query) ||
				node.tags.some((tag) => tag.toLowerCase().includes(query)),
		);
	}, [nodes, searchQuery]);

	// Stats - prefer database stats
	const stats = useMemo(() => {
		return {
			total: dbStats?.total ?? nodes.length,
			strong: dbStats?.byStrength?.strong ?? nodes.filter((n) => n.relationshipStrength === "strong").length,
			pendingReminders: dbStats?.needsFollowUp ?? reminders.filter((r) => !r.completed).length,
			recentInteractions:
				dbStats?.recentInteractions ??
				interactions.filter((i) => {
					const date = new Date(i.date);
					const weekAgo = new Date();
					weekAgo.setDate(weekAgo.getDate() - 7);
					return date >= weekAgo;
				}).length,
		};
	}, [nodes, reminders, interactions, dbStats]);

	// Database mutations
	const invalidateNetworking = () => {
		queryClient.invalidateQueries({ queryKey: orpc.networking.list.key() });
		queryClient.invalidateQueries({ queryKey: orpc.networking.getStatistics.key() });
		queryClient.invalidateQueries({ queryKey: orpc.networking.getFollowUpReminders.key() });
	};

	const createContactMutation = useMutation({
		...orpc.networking.create.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
			toast.success(t`Connection added`);
		},
		onError: () => toast.error(t`Failed to add connection`),
	});

	const deleteContactMutation = useMutation({
		...orpc.networking.delete.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
			toast.success(t`Connection removed`);
		},
		onError: () => toast.error(t`Failed to remove connection`),
	});

	const toggleFavoriteMutation = useMutation({
		...orpc.networking.toggleFavorite.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
		},
	});

	const updateContactMutation = useMutation({
		...orpc.networking.update.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
		},
	});

	const addInteractionMutation = useMutation({
		...orpc.networking.interactions.add.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
			toast.success(t`Interaction added`);
		},
		onError: () => toast.error(t`Failed to add interaction`),
	});

	// Handlers
	const handleNodeClick = useCallback((node: NetworkNode) => {
		setSelectedNode(node);
		setIsNodeDetailOpen(true);
	}, []);

	const handleAddNode = () => {
		createContactMutation.mutate({
			name: newNodeForm.name || "",
			email: newNodeForm.email || "",
			phone: undefined,
			company: newNodeForm.company || undefined,
			position: newNodeForm.jobTitle || undefined,
			linkedinUrl: newNodeForm.linkedinUrl || undefined,
			relationship:
				(newNodeForm.category as
					| "colleague"
					| "mentor"
					| "recruiter"
					| "hiring_manager"
					| "industry_peer"
					| "alumni"
					| "referral"
					| "other") || "other",
			relationshipStrength: (newNodeForm.relationshipStrength as "strong" | "moderate" | "weak" | "dormant") || "weak",
			notes: newNodeForm.notes || undefined,
			tags: newNodeForm.tags || undefined,
			isFavorite: newNodeForm.isFavorite || false,
		});
		setIsAddNodeOpen(false);
		resetNodeForm();
	};

	const handleAddInteraction = () => {
		if (!selectedNode) return;

		addInteractionMutation.mutate({
			contactId: selectedNode.id,
			interactionType: newInteractionForm.type || "other",
			description: newInteractionForm.notes || undefined,
			outcome: newInteractionForm.outcome || undefined,
			followUpNeeded: !!newInteractionForm.followUpDate,
			followUpDate: newInteractionForm.followUpDate ? new Date(newInteractionForm.followUpDate) : undefined,
			interactedAt: newInteractionForm.date ? new Date(newInteractionForm.date) : new Date(),
		});

		// Also add to local state for immediate UI update
		const newInteraction: Interaction = {
			id: `int-${Date.now()}`,
			nodeId: selectedNode.id,
			type: (newInteractionForm.type as InteractionType) || "other",
			date: newInteractionForm.date || new Date().toISOString().split("T")[0],
			notes: newInteractionForm.notes || "",
			outcome: newInteractionForm.outcome,
			followUpDate: newInteractionForm.followUpDate,
		};
		setLocalInteractions((prev) => [...prev, newInteraction]);

		setIsAddInteractionOpen(false);
		resetInteractionForm();
	};

	const handleAddReminder = () => {
		if (!selectedNode) return;

		// Set follow-up date on the contact via update
		const followUpDate = newReminderForm.dueDate ? new Date(newReminderForm.dueDate) : undefined;
		if (followUpDate) {
			updateContactMutation.mutate({
				id: selectedNode.id,
				nextFollowUpAt: followUpDate,
			});
		}
		setIsReminderDialogOpen(false);
		resetReminderForm();
	};

	const handleCompleteReminder = (reminderId: string) => {
		const contactId = reminderId.replace("rem-", "");
		updateContactMutation.mutate({
			id: contactId,
			nextFollowUpAt: undefined,
		});
	};

	const handleToggleFavorite = (nodeId: string) => {
		toggleFavoriteMutation.mutate({ id: nodeId });
		if (selectedNode?.id === nodeId) {
			setSelectedNode((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
		}
	};

	const handleDeleteNode = (nodeId: string) => {
		deleteContactMutation.mutate({ id: nodeId });
		setIsNodeDetailOpen(false);
		setSelectedNode(null);
	};

	const handleExportData = (format: "json" | "csv") => {
		if (format === "json") {
			const data = { nodes, edges, interactions, reminders };
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "network-map-data.json";
			link.click();
			URL.revokeObjectURL(url);
		} else {
			const headers = [
				"Name",
				"Email",
				"Company",
				"Job Title",
				"Category",
				"Relationship",
				"Location",
				"Tags",
				"Notes",
			];
			const csvContent = [
				headers.join(","),
				...nodes.map((n) =>
					[
						n.name,
						n.email,
						n.company,
						n.jobTitle,
						n.category,
						n.relationshipStrength,
						n.location || "",
						n.tags.join(";"),
						`"${n.notes.replace(/"/g, '""')}"`,
					].join(","),
				),
			].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "network-map-data.csv";
			link.click();
			URL.revokeObjectURL(url);
		}
		setIsExportDialogOpen(false);
	};

	const handleAddSuggestedConnection = (suggestion: SuggestedConnection) => {
		createContactMutation.mutate({
			name: suggestion.name,
			email: "",
			company: suggestion.company || undefined,
			position: suggestion.jobTitle || undefined,
			relationship: "other",
			relationshipStrength: "weak",
			notes: `Added from suggestions. Reason: ${suggestion.reason}`,
		});
	};

	// Form reset functions
	const resetNodeForm = () => {
		setNewNodeForm({
			name: "",
			email: "",
			company: "",
			jobTitle: "",
			category: "other",
			relationshipStrength: "weak",
			tags: [],
			notes: "",
			isFavorite: false,
			mutualConnections: [],
		});
	};

	const resetInteractionForm = () => {
		setNewInteractionForm({
			type: "email",
			date: new Date().toISOString().split("T")[0],
			notes: "",
			outcome: "",
		});
	};

	const resetReminderForm = () => {
		setNewReminderForm({
			title: "",
			description: "",
			dueDate: "",
			frequency: "monthly",
			isRecurring: false,
		});
	};

	// Get mutual connections for selected node
	const getMutualConnections = useCallback(
		(node: NetworkNode) => {
			return node.mutualConnections
				.map((id) => nodes.find((n) => n.id === id))
				.filter((n): n is NetworkNode => n !== undefined);
		},
		[nodes],
	);

	return (
		<>
			<DashboardHeader icon={ShareNetworkIcon} title={t`Professional Network Map`} />

			<HeroSection stats={stats} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						{[
							{ value: "map", icon: ShareNetworkIcon, label: t`Network Map` },
							{ value: "timeline", icon: ClockIcon, label: t`Timeline` },
							{ value: "reminders", icon: BellIcon, label: t`Reminders`, badge: stats.pendingReminders },
							{ value: "suggestions", icon: LightbulbIcon, label: t`Suggestions` },
							{ value: "analytics", icon: ChartLineUpIcon, label: t`Analytics` },
						].map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								<tab.icon className="size-4" />
								{tab.label}
								{tab.badge && tab.badge > 0 && (
									<Badge className="ml-1 size-5 justify-center rounded-full bg-red-500 p-0 text-white text-xs">
										{tab.badge}
									</Badge>
								)}
							</TabsTrigger>
						))}
					</TabsList>

					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)} className="gap-2">
							<ExportIcon className="size-4" />
							<Trans>Export</Trans>
						</Button>
						<Button size="sm" onClick={() => setIsAddNodeOpen(true)} className="gap-2">
							<PlusIcon className="size-4" />
							<Trans>Add Connection</Trans>
						</Button>
					</div>
				</div>

				{/* Network Map Tab */}
				<TabsContent value="map">
					<MapTabContent
						searchFilteredNodes={searchFilteredNodes}
						edges={edges}
						selectedNode={selectedNode}
						hoveredNode={hoveredNode}
						onNodeClick={handleNodeClick}
						onNodeHover={setHoveredNode}
						categoryFilter={categoryFilter}
						strengthFilter={strengthFilter}
						searchQuery={searchQuery}
						setCategoryFilter={setCategoryFilter}
						setStrengthFilter={setStrengthFilter}
						setSearchQuery={setSearchQuery}
					/>
				</TabsContent>

				{/* Timeline Tab */}
				<TabsContent value="timeline" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ClockIcon className="size-5" />
								<Trans>Interaction History</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Track all your professional interactions over time</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<InteractionTimeline interactions={interactions} nodes={nodes} selectedNode={null} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Reminders Tab */}
				<TabsContent value="reminders" className="space-y-6">
					<RemindersTabContent
						reminders={reminders}
						nodes={nodes}
						onCompleteReminder={handleCompleteReminder}
						onNodeClick={handleNodeClick}
					/>
				</TabsContent>

				{/* Suggestions Tab */}
				<TabsContent value="suggestions" className="space-y-6">
					<SuggestionsTabContent
						suggestedConnections={suggestedConnections}
						nodes={nodes}
						onAddSuggested={handleAddSuggestedConnection}
						getMutualConnections={getMutualConnections}
					/>
				</TabsContent>

				{/* Analytics Tab */}
				<TabsContent value="analytics">
					<AnalyticsDashboard nodes={nodes} edges={edges} interactions={interactions} growthData={growthData} />
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			<NodeDetailDialog
				open={isNodeDetailOpen}
				onOpenChange={setIsNodeDetailOpen}
				selectedNode={selectedNode}
				interactions={interactions}
				nodes={nodes}
				getMutualConnections={getMutualConnections}
				onDelete={handleDeleteNode}
				onToggleFavorite={handleToggleFavorite}
				onOpenAddInteraction={() => setIsAddInteractionOpen(true)}
				onOpenReminder={() => setIsReminderDialogOpen(true)}
			/>

			<AddNodeDialog
				open={isAddNodeOpen}
				onOpenChange={setIsAddNodeOpen}
				form={newNodeForm}
				setForm={setNewNodeForm}
				onSubmit={handleAddNode}
			/>

			<AddInteractionDialog
				open={isAddInteractionOpen}
				onOpenChange={setIsAddInteractionOpen}
				selectedNodeName={selectedNode?.name}
				form={newInteractionForm}
				setForm={setNewInteractionForm}
				onSubmit={handleAddInteraction}
			/>

			<AddReminderDialog
				open={isReminderDialogOpen}
				onOpenChange={setIsReminderDialogOpen}
				selectedNodeName={selectedNode?.name}
				form={newReminderForm}
				setForm={setNewReminderForm}
				onSubmit={handleAddReminder}
			/>

			<ExportDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} onExport={handleExportData} />
		</>
	);
}
