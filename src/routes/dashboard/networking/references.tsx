import { t } from "@lingui/core/macro";
import { UsersIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	EmailTemplateModal,
	FiltersBar,
	ReferenceFormModal,
	ReferenceList,
	StatsCards,
} from "./-components/references-components";
import { emailTemplates, REFERENCE_TAG, relationshipToContactType } from "./-components/references-config";
import type { NetworkingContact, Reference, RelationshipType, RequestStatus } from "./-components/references-types";
import { contactToReference, daysSinceContact, updateRequestStatusInNotes } from "./-components/references-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/networking/references" as any)({
	component: ReferencesPage,
	errorComponent: ErrorComponent,
});

function ReferencesPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [filterRelationship, setFilterRelationship] = useState<RelationshipType | "all">("all");
	const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [editingReference, setEditingReference] = useState<Reference | null>(null);
	const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("formal");

	const [formData, setFormData] = useState<Omit<Reference, "id">>({
		name: "",
		title: "",
		company: "",
		email: "",
		phone: "",
		relationshipType: "supervisor",
		lastContactDate: new Date().toISOString().split("T")[0],
		requestStatus: "not_asked",
		notes: "",
	});

	const {
		data: contactsData,
		isLoading: isQueryLoading,
		isError,
	} = useQuery({
		...orpc.networking.list.queryOptions({
			input: { tags: [REFERENCE_TAG] },
		}),
		enabled: !!session?.user,
	});

	const isLoading = isQueryLoading || !contactsData;

	const references: Reference[] = useMemo(() => {
		if (!contactsData) return [];
		return contactsData.map(contactToReference);
	}, [contactsData]);

	const createMutation = useMutation({
		...orpc.networking.create.mutationOptions(),
		onMutate: async (newReference) => {
			await queryClient.cancelQueries({ queryKey: ["networking", "list"] });
			const previousContacts = queryClient.getQueryData(orpc.networking.list.key({ input: { tags: [REFERENCE_TAG] } }));
			queryClient.setQueryData(
				orpc.networking.list.key({ input: { tags: [REFERENCE_TAG] } }),
				(old: NetworkingContact[] | undefined) => {
					if (!old) return old;
					const optimisticContact: NetworkingContact = {
						id: `temp-${Date.now()}`,
						userId: "",
						name: newReference.name,
						email: newReference.email || null,
						phone: newReference.phone || null,
						company: newReference.company || null,
						position: newReference.position || null,
						linkedinUrl: null,
						relationship: newReference.relationship ?? "colleague",
						relationshipStrength: null,
						howMet: null,
						notes: newReference.notes || null,
						tags: newReference.tags || null,
						lastContactedAt: newReference.lastContactedAt
							? new Date(newReference.lastContactedAt as string | Date)
							: null,
						nextFollowUpAt: null,
						isFavorite: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
					return [optimisticContact, ...old];
				},
			);
			setIsModalOpen(false);
			return { previousContacts };
		},
		onSuccess: () => {
			toast.success(t`Reference added`);
		},
		onError: (_error, _newReference, context) => {
			if (context?.previousContacts) {
				queryClient.setQueryData(
					orpc.networking.list.key({ input: { tags: [REFERENCE_TAG] } }),
					context.previousContacts,
				);
			}
			toast.error(t`Error adding reference`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["networking", "list"] });
		},
	});

	const updateMutation = useMutation(
		orpc.networking.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["networking", "list"] });
				toast.success(t`Reference updated`);
				setIsModalOpen(false);
			},
			onError: () => {
				toast.error(t`Error during update`);
			},
		}),
	);

	const deleteMutation = useMutation(
		orpc.networking.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["networking", "list"] });
				toast.success(t`Reference deleted`);
			},
			onError: () => {
				toast.error(t`Error during deletion`);
			},
		}),
	);

	const filteredReferences = useMemo(() => {
		return references.filter((ref) => {
			const matchesSearch =
				searchQuery === "" ||
				ref.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ref.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ref.title.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesRelationship = filterRelationship === "all" || ref.relationshipType === filterRelationship;
			const matchesStatus = filterStatus === "all" || ref.requestStatus === filterStatus;
			return matchesSearch && matchesRelationship && matchesStatus;
		});
	}, [references, searchQuery, filterRelationship, filterStatus]);

	const stats = useMemo(() => {
		const total = references.length;
		const confirmed = references.filter((r) => r.requestStatus === "confirmed").length;
		const pending = references.filter((r) => r.requestStatus === "pending").length;
		const needsFollowUp = references.filter((r) => daysSinceContact(r.lastContactDate) > 30).length;
		return { total, confirmed, pending, needsFollowUp };
	}, [references]);

	const openAddModal = useCallback(() => {
		setEditingReference(null);
		setFormData({
			name: "",
			title: "",
			company: "",
			email: "",
			phone: "",
			relationshipType: "supervisor",
			lastContactDate: new Date().toISOString().split("T")[0],
			requestStatus: "not_asked",
			notes: "",
		});
		setIsModalOpen(true);
	}, []);

	const openEditModal = useCallback((reference: Reference) => {
		setEditingReference(reference);
		setFormData({
			name: reference.name,
			title: reference.title,
			company: reference.company,
			email: reference.email,
			phone: reference.phone,
			relationshipType: reference.relationshipType,
			lastContactDate: reference.lastContactDate,
			requestStatus: reference.requestStatus,
			notes: reference.notes,
		});
		setIsModalOpen(true);
	}, []);

	const openEmailModal = useCallback((reference: Reference) => {
		setSelectedReference(reference);
		setSelectedTemplate(reference.relationshipType === "professor" ? "academic" : "formal");
		setIsEmailModalOpen(true);
	}, []);

	const handleSave = useCallback(() => {
		if (!formData.name || !formData.email) {
			toast.error(t`Please fill in the required fields`);
			return;
		}

		const notesWithStatus = updateRequestStatusInNotes(formData.notes, formData.requestStatus);
		const contactRelationship = relationshipToContactType[formData.relationshipType];

		if (editingReference) {
			updateMutation.mutate({
				id: editingReference.id,
				name: formData.name,
				email: formData.email || undefined,
				phone: formData.phone || undefined,
				company: formData.company || undefined,
				position: formData.title || undefined,
				relationship: contactRelationship as
					| "colleague"
					| "mentor"
					| "recruiter"
					| "hiring_manager"
					| "industry_peer"
					| "alumni"
					| "referral"
					| "other",
				notes: notesWithStatus,
				tags: [REFERENCE_TAG],
				lastContactedAt: formData.lastContactDate ? new Date(formData.lastContactDate) : undefined,
			});
		} else {
			createMutation.mutate({
				name: formData.name,
				email: formData.email || undefined,
				phone: formData.phone || undefined,
				company: formData.company || undefined,
				position: formData.title || undefined,
				relationship: contactRelationship as
					| "colleague"
					| "mentor"
					| "recruiter"
					| "hiring_manager"
					| "industry_peer"
					| "alumni"
					| "referral"
					| "other",
				notes: notesWithStatus,
				tags: [REFERENCE_TAG],
				lastContactedAt: formData.lastContactDate ? new Date(formData.lastContactDate) : undefined,
			});
		}
	}, [formData, editingReference, createMutation, updateMutation]);

	const handleDelete = useCallback(
		(id: string) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	const copyEmailTemplate = useCallback(() => {
		if (!selectedReference) return;

		const template = emailTemplates[selectedTemplate];
		const emailBody = template.body
			.replace("[NOM]", selectedReference.name.split(" ")[0])
			.replace("[ENTREPRISE]", selectedReference.company);

		navigator.clipboard.writeText(emailBody);
		toast.success(t`Email template copied`);
	}, [selectedReference, selectedTemplate]);

	const updateStatus = useCallback(
		(id: string, status: RequestStatus) => {
			const reference = references.find((ref) => ref.id === id);
			if (!reference) return;

			const notesWithStatus = updateRequestStatusInNotes(reference.notes, status);
			const newLastContactDate =
				status !== "not_asked"
					? new Date()
					: reference.lastContactDate
						? new Date(reference.lastContactDate)
						: undefined;

			updateMutation.mutate({
				id,
				notes: notesWithStatus,
				lastContactedAt: newLastContactDate,
			});
		},
		[references, updateMutation],
	);

	return (
		<div className="flex min-h-screen flex-col">
			<DashboardHeader icon={UsersIcon} title={t`Reference Manager`} />

			<main className="flex-1 p-6">
				<div className="mx-auto max-w-7xl space-y-6">
					<StatsCards stats={stats} isLoading={isLoading} />

					<FiltersBar
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						filterRelationship={filterRelationship}
						setFilterRelationship={setFilterRelationship}
						filterStatus={filterStatus}
						setFilterStatus={setFilterStatus}
						onAddClick={openAddModal}
					/>

					<ReferenceList
						isLoading={isLoading}
						isError={isError}
						filteredReferences={filteredReferences}
						onEdit={openEditModal}
						onEmail={openEmailModal}
						onUpdateStatus={updateStatus}
						onDelete={handleDelete}
						updateMutation={updateMutation}
						deleteMutation={deleteMutation}
					/>
				</div>
			</main>

			<ReferenceFormModal
				isOpen={isModalOpen}
				onOpenChange={setIsModalOpen}
				editingReference={editingReference}
				formData={formData}
				setFormData={setFormData}
				onSave={handleSave}
				createIsPending={createMutation.isPending}
				updateIsPending={updateMutation.isPending}
			/>

			<EmailTemplateModal
				isOpen={isEmailModalOpen}
				onOpenChange={setIsEmailModalOpen}
				selectedReference={selectedReference}
				selectedTemplate={selectedTemplate}
				setSelectedTemplate={setSelectedTemplate}
				onCopyTemplate={copyEmailTemplate}
			/>
		</div>
	);
}
