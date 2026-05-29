import { t } from "@lingui/core/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";

import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { RecordingDetailView, RecordingListView } from "./-components/review-components";
import type { ProgressData } from "./-components/review-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/review" as any)({
	component: InterviewRecordingReview,
	errorComponent: ErrorComponent,
});

// Main Component
function InterviewRecordingReview() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("recordings");
	const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterField, setFilterField] = useState<string>("all");
	const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	// Upload form state
	const [uploadForm, setUploadForm] = useState({
		title: "",
		field: "healthcare" as "healthcare" | "industrial" | "hse" | "general",
		program: "",
	});

	// ============================================
	// QUERIES
	// ============================================

	// Recordings list query
	const {
		data: recordingsData,
		isLoading: recordingsLoading,
		error: recordingsError,
	} = useQuery({
		...orpc.interviewRecording.recordings.list.queryOptions({
			field: filterField !== "all" ? filterField : undefined,
		}),
		enabled: !!session?.user,
	});

	// Statistics query
	const { data: stats } = useQuery({
		...orpc.interviewRecording.recordings.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Progress data query
	const { data: progressData } = useQuery({
		...orpc.interviewRecording.progress.list.queryOptions({ limit: 12 }),
		enabled: !!session?.user,
	});

	// Selected recording query
	const { data: selectedRecording, isLoading: selectedRecordingLoading } = useQuery({
		...orpc.interviewRecording.recordings.getById.queryOptions({ input: { id: selectedRecordingId ?? "" } }),
		enabled: !!session?.user && !!selectedRecordingId,
	});

	// ============================================
	// MUTATIONS
	// ============================================

	// Create recording mutation
	const createRecordingMutation = useMutation(
		orpc.interviewRecording.recordings.create.mutationOptions({
			onSuccess: async (recording) => {
				// Immediately trigger analysis
				await analyzeMutation.mutateAsync({ id: recording.id });
			},
			onError: () => {
				toast.error(t`Error creating recording`);
			},
		}),
	);

	// Analyze recording mutation
	const analyzeMutation = useMutation(
		orpc.interviewRecording.recordings.analyze.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewRecording"] });
				setIsUploadDialogOpen(false);
				setUploadForm({ title: "", field: "healthcare", program: "" });
				toast.success(t`Recording analyzed successfully!`);
			},
			onError: () => {
				toast.error(t`Error during analysis`);
			},
		}),
	);

	// Delete recording mutation
	const deleteRecordingMutation = useMutation(
		orpc.interviewRecording.recordings.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewRecording"] });
				setDeletingId(null);
				if (selectedRecordingId === deletingId) {
					setSelectedRecordingId(null);
				}
				toast.success(t`Recording deleted`);
			},
			onError: () => {
				setDeletingId(null);
				toast.error(t`Error during deletion`);
			},
		}),
	);

	// ============================================
	// HANDLERS
	// ============================================

	const handleUpload = useCallback(async () => {
		if (!uploadForm.title) {
			toast.error(t`Please enter a title`);
			return;
		}

		await createRecordingMutation.mutateAsync({
			title: uploadForm.title,
			date: new Date().toISOString().split("T")[0],
			duration: Math.floor(Math.random() * 300) + 180, // Simulated duration
			field: uploadForm.field,
			program: uploadForm.program || undefined,
		});
	}, [uploadForm, createRecordingMutation]);

	const handleDelete = useCallback(
		(id: string) => {
			setDeletingId(id);
			deleteRecordingMutation.mutate({ id });
		},
		[deleteRecordingMutation],
	);

	// Filter recordings by search query
	const filteredRecordings = useMemo(() => {
		if (!recordingsData?.items) return [];
		if (!searchQuery) return recordingsData.items;

		const query = searchQuery.toLowerCase();
		return recordingsData.items.filter(
			(rec) => rec.title.toLowerCase().includes(query) || rec.program?.toLowerCase().includes(query),
		);
	}, [recordingsData?.items, searchQuery]);

	// Map progress data to chart format
	const chartProgressData: ProgressData[] = useMemo(() => {
		if (!progressData) return [];
		return progressData.map((p) => ({
			date: p.date,
			overallScore: p.overallScore,
			speakingPace: p.speakingPace,
			clarity: p.clarity,
			contentQuality: p.contentQuality,
			bodyLanguage: p.bodyLanguage,
			fillerWords: p.fillerWords,
		}));
	}, [progressData]);

	// Calculate aggregate filler words from selected recording segments
	const aggregateFillerWords = useMemo(() => {
		if (!selectedRecording?.segments) return [];
		const fillerMap = new Map<string, { word: string; count: number; timestamps: number[] }>();

		for (const segment of selectedRecording.segments) {
			for (const fw of segment.fillerWords) {
				const existing = fillerMap.get(fw.word);
				if (existing) {
					existing.count += fw.count;
					existing.timestamps.push(...fw.timestamps);
				} else {
					fillerMap.set(fw.word, { ...fw });
				}
			}
		}

		return Array.from(fillerMap.values()).sort((a, b) => b.count - a.count);
	}, [selectedRecording?.segments]);

	const isUploading = createRecordingMutation.isPending || analyzeMutation.isPending;

	// Render detail view
	if (selectedRecordingId && selectedRecording) {
		return (
			<RecordingDetailView
				selectedRecording={selectedRecording}
				selectedRecordingLoading={selectedRecordingLoading}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				expandedSegment={expandedSegment}
				setExpandedSegment={setExpandedSegment}
				aggregateFillerWords={aggregateFillerWords}
				onBack={() => setSelectedRecordingId(null)}
			/>
		);
	}

	// Render main list view
	return (
		<RecordingListView
			stats={stats}
			chartProgressData={chartProgressData}
			filteredRecordings={filteredRecordings}
			recordingsLoading={recordingsLoading}
			recordingsError={recordingsError}
			searchQuery={searchQuery}
			setSearchQuery={setSearchQuery}
			filterField={filterField}
			setFilterField={setFilterField}
			isUploadDialogOpen={isUploadDialogOpen}
			setIsUploadDialogOpen={setIsUploadDialogOpen}
			uploadForm={uploadForm}
			setUploadForm={setUploadForm}
			isUploading={isUploading}
			analyzeMutation={analyzeMutation}
			deletingId={deletingId}
			onUpload={handleUpload}
			onDelete={handleDelete}
			onSelectRecording={setSelectedRecordingId}
			onRetry={() => queryClient.invalidateQueries({ queryKey: ["interviewRecording"] })}
		/>
	);
}
