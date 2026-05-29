import { t } from "@lingui/core/macro";
import { EnvelopeIcon, FileTextIcon, LightbulbIcon, PlusIcon, UsersIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	EmailTemplateModal,
	EmailTemplatesTab,
	FilterBar,
	RecommenderModal,
	RecommendersTab,
	RequestModal,
	RequestsTab,
	SampleLetterModal,
	SampleLettersTab,
	StatisticsCards,
	TipsTab,
} from "./-components/recommendation-request-components";
import { createInitialRequestForm, INITIAL_RECOMMENDER_FORM } from "./-components/recommendation-request-config";
import type {
	EmailTemplate,
	RecommendationRequest,
	Recommender,
	RecommenderFormData,
	RecommenderType,
	RequestFormData,
	RequestStatus,
	SampleLetter,
} from "./-components/recommendation-request-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/networking/recommendation-request" as any)({
	component: RecommendationRequestPage,
	errorComponent: ErrorComponent,
});

function RecommendationRequestPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("requests");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("all");
	const [filterType, setFilterType] = useState<RecommenderType | "all">("all");

	// Modal states
	const [isRecommenderModalOpen, setIsRecommenderModalOpen] = useState(false);
	const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
	const [editingRecommender, setEditingRecommender] = useState<Recommender | null>(null);
	const [editingRequest, setEditingRequest] = useState<RecommendationRequest | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
	const [selectedSample, setSelectedSample] = useState<SampleLetter | null>(null);
	const [selectedRecommenderForEmail, setSelectedRecommenderForEmail] = useState<Recommender | null>(null);

	// Form states
	const [recommenderForm, setRecommenderForm] = useState<RecommenderFormData>(INITIAL_RECOMMENDER_FORM);
	const [requestForm, setRequestForm] = useState<RequestFormData>(createInitialRequestForm());

	const [newTalkingPoint, setNewTalkingPoint] = useState("");

	// Queries
	const recommendersQuery = useQuery({
		...orpc.recommendationRequest.recommenders.list.queryOptions({}),
		enabled: !!session?.user,
	});
	const requestsQuery = useQuery({
		...orpc.recommendationRequest.requests.list.queryOptions({}),
		enabled: !!session?.user,
	});
	const statisticsQuery = useQuery({
		...orpc.recommendationRequest.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	const recommenders = (recommendersQuery.data ?? []) as Recommender[];
	const requests = (requestsQuery.data ?? []) as RecommendationRequest[];
	const stats = statisticsQuery.data ?? { total: 0, pending: 0, received: 0, sent: 0, urgent: 0, recommenders: 0 };

	// Mutations
	const createRecommenderMutation = useMutation({
		...orpc.recommendationRequest.recommenders.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.recommenders.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.getStatistics.key() });
			toast.success(t`Recommender added`);
			setIsRecommenderModalOpen(false);
		},
		onError: () => {
			toast.error(t`Error adding recommender`);
		},
	});

	const updateRecommenderMutation = useMutation({
		...orpc.recommendationRequest.recommenders.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.recommenders.list.key() });
			toast.success(t`Recommender updated`);
			setIsRecommenderModalOpen(false);
		},
		onError: () => {
			toast.error(t`Error updating recommender`);
		},
	});

	const deleteRecommenderMutation = useMutation({
		...orpc.recommendationRequest.recommenders.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.recommenders.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.getStatistics.key() });
			toast.success(t`Recommender deleted`);
		},
		onError: (error) => {
			if (error.message.includes("associated requests")) {
				toast.error(t`This recommender has associated requests`);
			} else {
				toast.error(t`Error deleting recommender`);
			}
		},
	});

	const createRequestMutation = useMutation({
		...orpc.recommendationRequest.requests.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.requests.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.getStatistics.key() });
			toast.success(t`Request created`);
			setIsRequestModalOpen(false);
		},
		onError: () => {
			toast.error(t`Error creating request`);
		},
	});

	const updateRequestMutation = useMutation({
		...orpc.recommendationRequest.requests.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.requests.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.getStatistics.key() });
			toast.success(t`Request updated`);
			setIsRequestModalOpen(false);
		},
		onError: () => {
			toast.error(t`Error updating request`);
		},
	});

	const updateRequestStatusMutation = useMutation({
		...orpc.recommendationRequest.requests.updateStatus.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.requests.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.getStatistics.key() });
			toast.success(t`Status updated`);
		},
		onError: () => {
			toast.error(t`Error updating status`);
		},
	});

	const deleteRequestMutation = useMutation({
		...orpc.recommendationRequest.requests.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.requests.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.recommendationRequest.getStatistics.key() });
			toast.success(t`Request deleted`);
		},
		onError: () => {
			toast.error(t`Error deleting request`);
		},
	});

	// Computed values
	const filteredRequests = useMemo(() => {
		return requests.filter((req) => {
			const recommender = recommenders.find((r) => r.id === req.recommenderId);
			const matchesSearch =
				recommender?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				req.purpose.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = filterStatus === "all" || req.status === filterStatus;
			const matchesType = filterType === "all" || recommender?.relationship === filterType;
			return matchesSearch && matchesStatus && matchesType;
		});
	}, [requests, recommenders, searchQuery, filterStatus, filterType]);

	const filteredRecommenders = useMemo(() => {
		return recommenders.filter((rec) => {
			const matchesSearch =
				rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				rec.company.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesType = filterType === "all" || rec.relationship === filterType;
			return matchesSearch && matchesType;
		});
	}, [recommenders, searchQuery, filterType]);

	// Handlers
	const openRecommenderModal = useCallback((recommender?: Recommender) => {
		if (recommender) {
			setEditingRecommender(recommender);
			setRecommenderForm({
				name: recommender.name,
				email: recommender.email,
				phone: recommender.phone,
				title: recommender.title,
				company: recommender.company,
				relationship: recommender.relationship,
				yearsKnown: recommender.yearsKnown,
				notes: recommender.notes,
			});
		} else {
			setEditingRecommender(null);
			setRecommenderForm(INITIAL_RECOMMENDER_FORM);
		}
		setIsRecommenderModalOpen(true);
	}, []);

	const saveRecommender = useCallback(() => {
		if (!recommenderForm.name || !recommenderForm.email) {
			toast.error(t`Please fill in the required fields`);
			return;
		}

		if (editingRecommender) {
			updateRecommenderMutation.mutate({
				id: editingRecommender.id,
				...recommenderForm,
			});
		} else {
			createRecommenderMutation.mutate(recommenderForm);
		}
	}, [recommenderForm, editingRecommender, updateRecommenderMutation, createRecommenderMutation]);

	const deleteRecommender = useCallback(
		(id: string) => {
			deleteRecommenderMutation.mutate({ id });
		},
		[deleteRecommenderMutation],
	);

	const openRequestModal = useCallback(
		(request?: RecommendationRequest) => {
			if (request) {
				setEditingRequest(request);
				setRequestForm({
					recommenderId: request.recommenderId,
					purpose: request.purpose,
					deadline: request.deadline,
					status: request.status,
					requestDate: request.requestDate,
					receivedDate: request.receivedDate ?? undefined,
					sentToDate: request.sentToDate ?? undefined,
					talkingPoints: [...request.talkingPoints],
					followUpReminder: request.followUpReminder,
					lastReminderSent: request.lastReminderSent ?? undefined,
					notes: request.notes,
				});
			} else {
				setEditingRequest(null);
				setRequestForm(createInitialRequestForm(recommenders[0]?.id || ""));
			}
			setIsRequestModalOpen(true);
		},
		[recommenders],
	);

	const saveRequest = useCallback(() => {
		if (!requestForm.recommenderId || !requestForm.purpose || !requestForm.deadline) {
			toast.error(t`Please fill in the required fields`);
			return;
		}

		if (editingRequest) {
			updateRequestMutation.mutate({
				id: editingRequest.id,
				...requestForm,
			});
		} else {
			createRequestMutation.mutate(requestForm);
		}
	}, [requestForm, editingRequest, updateRequestMutation, createRequestMutation]);

	const deleteRequest = useCallback(
		(id: string) => {
			deleteRequestMutation.mutate({ id });
		},
		[deleteRequestMutation],
	);

	const updateRequestStatus = useCallback(
		(id: string, status: RequestStatus) => {
			updateRequestStatusMutation.mutate({ id, status });
		},
		[updateRequestStatusMutation],
	);

	const addTalkingPoint = useCallback(() => {
		if (!newTalkingPoint.trim()) return;
		setRequestForm((prev) => ({
			...prev,
			talkingPoints: [...prev.talkingPoints, newTalkingPoint.trim()],
		}));
		setNewTalkingPoint("");
	}, [newTalkingPoint]);

	const removeTalkingPoint = useCallback((index: number) => {
		setRequestForm((prev) => ({
			...prev,
			talkingPoints: prev.talkingPoints.filter((_, i) => i !== index),
		}));
	}, []);

	const openEmailModal = useCallback((recommender: Recommender, template: EmailTemplate) => {
		setSelectedRecommenderForEmail(recommender);
		setSelectedTemplate(template);
		setIsEmailModalOpen(true);
	}, []);

	const copyEmailTemplate = useCallback(() => {
		if (!selectedTemplate || !selectedRecommenderForEmail) return;
		const request = requests.find((r) => r.recommenderId === selectedRecommenderForEmail.id);
		let body = selectedTemplate.body
			.replace("[NOM]", selectedRecommenderForEmail.name)
			.replace("[ENTREPRISE]", selectedRecommenderForEmail.company);
		if (request) {
			body = body
				.replace("[OBJECTIF]", request.purpose)
				.replace("[DATE]", new Date(request.deadline).toLocaleDateString())
				.replace("[POINTS_CLES]", request.talkingPoints.map((p) => `- ${p}`).join("\n"));
		}
		navigator.clipboard.writeText(body);
		toast.success(t`Template copied to clipboard`);
	}, [selectedTemplate, selectedRecommenderForEmail, requests]);

	const openSampleModal = useCallback((sample: SampleLetter) => {
		setSelectedSample(sample);
		setIsSampleModalOpen(true);
	}, []);

	const isLoading = recommendersQuery.isLoading || requestsQuery.isLoading;

	return (
		<div className="flex min-h-screen flex-col">
			<DashboardHeader icon={FileTextIcon} title={t`Recommendation Requests`} />

			<main className="flex-1 p-6">
				<div className="mx-auto max-w-7xl space-y-6">
					<StatisticsCards stats={stats} isLoading={statisticsQuery.isLoading} />

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<motion.div
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
							className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<TabsList>
								<TabsTrigger value="requests" className="gap-2">
									<FileTextIcon className="size-4" />
									{t`Requests`}
								</TabsTrigger>
								<TabsTrigger value="recommenders" className="gap-2">
									<UsersIcon className="size-4" />
									{t`Recommenders`}
								</TabsTrigger>
								<TabsTrigger value="templates" className="gap-2">
									<EnvelopeIcon className="size-4" />
									{t`Templates`}
								</TabsTrigger>
								<TabsTrigger value="samples" className="gap-2">
									<FileTextIcon className="size-4" />
									{t`Examples`}
								</TabsTrigger>
								<TabsTrigger value="tips" className="gap-2">
									<LightbulbIcon className="size-4" />
									{t`Tips`}
								</TabsTrigger>
							</TabsList>

							{(activeTab === "requests" || activeTab === "recommenders") && (
								<Button
									onClick={() => (activeTab === "requests" ? openRequestModal() : openRecommenderModal())}
									className="gap-2"
								>
									<PlusIcon className="size-4" />
									{activeTab === "requests" ? t`New request` : t`New recommender`}
								</Button>
							)}
						</motion.div>

						{(activeTab === "requests" || activeTab === "recommenders") && (
							<FilterBar
								activeTab={activeTab}
								searchQuery={searchQuery}
								setSearchQuery={setSearchQuery}
								filterStatus={filterStatus}
								setFilterStatus={setFilterStatus}
								filterType={filterType}
								setFilterType={setFilterType}
							/>
						)}

						<TabsContent value="requests" className="mt-4">
							<RequestsTab
								isLoading={isLoading}
								filteredRequests={filteredRequests}
								recommenders={recommenders}
								openRequestModal={openRequestModal}
								openEmailModal={openEmailModal}
								updateRequestStatus={updateRequestStatus}
								deleteRequest={deleteRequest}
							/>
						</TabsContent>

						<TabsContent value="recommenders" className="mt-4">
							<RecommendersTab
								isLoading={isLoading}
								filteredRecommenders={filteredRecommenders}
								requests={requests}
								openRecommenderModal={openRecommenderModal}
								openEmailModal={openEmailModal}
								deleteRecommender={deleteRecommender}
							/>
						</TabsContent>

						<TabsContent value="templates" className="mt-4">
							<EmailTemplatesTab />
						</TabsContent>

						<TabsContent value="samples" className="mt-4">
							<SampleLettersTab openSampleModal={openSampleModal} />
						</TabsContent>

						<TabsContent value="tips" className="mt-4">
							<TipsTab />
						</TabsContent>
					</Tabs>
				</div>
			</main>

			<RecommenderModal
				isOpen={isRecommenderModalOpen}
				onOpenChange={setIsRecommenderModalOpen}
				editingRecommender={editingRecommender}
				recommenderForm={recommenderForm}
				setRecommenderForm={setRecommenderForm}
				saveRecommender={saveRecommender}
				isSaving={createRecommenderMutation.isPending || updateRecommenderMutation.isPending}
			/>

			<RequestModal
				isOpen={isRequestModalOpen}
				onOpenChange={setIsRequestModalOpen}
				editingRequest={editingRequest}
				requestForm={requestForm}
				setRequestForm={setRequestForm}
				saveRequest={saveRequest}
				isSaving={createRequestMutation.isPending || updateRequestMutation.isPending}
				recommenders={recommenders}
				newTalkingPoint={newTalkingPoint}
				setNewTalkingPoint={setNewTalkingPoint}
				addTalkingPoint={addTalkingPoint}
				removeTalkingPoint={removeTalkingPoint}
			/>

			<EmailTemplateModal
				isOpen={isEmailModalOpen}
				onOpenChange={setIsEmailModalOpen}
				selectedTemplate={selectedTemplate}
				setSelectedTemplate={setSelectedTemplate}
				selectedRecommenderForEmail={selectedRecommenderForEmail}
				copyEmailTemplate={copyEmailTemplate}
			/>

			<SampleLetterModal
				isOpen={isSampleModalOpen}
				onOpenChange={setIsSampleModalOpen}
				selectedSample={selectedSample}
			/>
		</div>
	);
}
