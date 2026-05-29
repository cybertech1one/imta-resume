import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BrainIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	PencilSimpleIcon,
	PlayIcon,
	PlusIcon,
	SpinnerIcon,
	StarIcon,
	ToggleLeftIcon,
	ToggleRightIcon,
	TrashIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";
import {
	AIProviderManagementSkeleton,
	PerformanceMetricsTab,
	ProviderFormDialog,
} from "./-components/ai-providers-components";
import { DEFAULT_FORM_DATA, PROVIDER_OPTIONS } from "./-components/ai-providers-config";
import type { AIProvider, ProviderFormData } from "./-components/ai-providers-types";

export const Route = createFileRoute("/dashboard/admin/ai-providers/")({
	component: RouteComponent,
	pendingComponent: AIProviderManagementSkeleton,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={BrainIcon} title={t`AI Provider Management`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load AI providers</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async () => {
		return await client.aiConfig.providers.list();
	},
});

function RouteComponent() {
	const router = useRouter();
	const providers = Route.useLoaderData() as AIProvider[];

	const [activeTab, setActiveTab] = useState("providers");
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [editProvider, setEditProvider] = useState<AIProvider | null>(null);
	const [deleteProviderId, setDeleteProviderId] = useState<string | null>(null);
	const [testingProvider, setTestingProvider] = useState<string | null>(null);
	const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

	const { mutate: createProvider } = useMutation(orpc.aiConfig.providers.create.mutationOptions());
	const { mutate: updateProvider } = useMutation(orpc.aiConfig.providers.update.mutationOptions());
	const { mutate: deleteProvider } = useMutation(orpc.aiConfig.providers.delete.mutationOptions());
	const { mutate: setDefault } = useMutation(orpc.aiConfig.providers.setDefault.mutationOptions());
	const { mutate: toggleEnabled } = useMutation(orpc.aiConfig.providers.toggleEnabled.mutationOptions());

	const handleTestConnection = async (provider: AIProvider) => {
		if (!provider.isEnabled) {
			toast.error(t`Enable the provider first to test the connection`);
			return;
		}

		setTestingProvider(provider.id);
		setTestResult(null);
		const toastId = toast.loading(t`Testing connection to ${provider.displayName}...`);

		try {
			let response = "";
			const stream = await client.ai.testConnection();
			for await (const chunk of stream) {
				response += chunk;
			}

			if (response.includes("1")) {
				setTestResult({ id: provider.id, success: true, message: t`Connection successful!` });
				toast.success(t`Connection to ${provider.displayName} successful!`, { id: toastId });
			} else {
				setTestResult({ id: provider.id, success: false, message: t`Unexpected response: ${response}` });
				toast.error(t`Unexpected response from ${provider.displayName}`, { id: toastId });
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : t`Unknown error`;
			setTestResult({ id: provider.id, success: false, message: errorMessage });
			toast.error(t`Connection failed: ${errorMessage}`, { id: toastId });
		} finally {
			setTestingProvider(null);
		}
	};

	const handleCreateProvider = (data: ProviderFormData) => {
		const toastId = toast.loading(t`Creating provider...`);
		createProvider(
			{
				provider: data.provider as
					| "openai"
					| "anthropic"
					| "gemini"
					| "ollama"
					| "vercel-ai-gateway"
					| "deepseek"
					| "groq"
					| "mistral"
					| "togetherai"
					| "openrouter",
				displayName: data.displayName,
				apiKey: data.apiKey,
				model: data.model,
				baseUrl: data.baseUrl || undefined,
				maxTokensPerRequest: data.maxTokensPerRequest,
				temperature: String(data.temperature),
				priority: data.priority,
				isDefault: data.isDefault,
			},
			{
				onSuccess: () => {
					toast.success(t`Provider created successfully`, { id: toastId });
					setAddDialogOpen(false);
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to create provider`, { id: toastId });
				},
			},
		);
	};

	const handleUpdateProvider = (data: ProviderFormData) => {
		if (!editProvider) return;

		const toastId = toast.loading(t`Updating provider...`);
		updateProvider(
			{
				id: editProvider.id,
				provider: data.provider as
					| "openai"
					| "anthropic"
					| "gemini"
					| "ollama"
					| "vercel-ai-gateway"
					| "deepseek"
					| "groq"
					| "mistral"
					| "togetherai"
					| "openrouter",
				displayName: data.displayName,
				apiKey: data.apiKey || undefined,
				model: data.model,
				baseUrl: data.baseUrl || undefined,
				maxTokensPerRequest: data.maxTokensPerRequest,
				temperature: String(data.temperature),
				priority: data.priority,
				isDefault: data.isDefault,
			},
			{
				onSuccess: () => {
					toast.success(t`Provider updated successfully`, { id: toastId });
					setEditProvider(null);
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to update provider`, { id: toastId });
				},
			},
		);
	};

	const handleDeleteProvider = () => {
		if (!deleteProviderId) return;

		const toastId = toast.loading(t`Deleting provider...`);
		deleteProvider(
			{ id: deleteProviderId },
			{
				onSuccess: () => {
					toast.success(t`Provider deleted successfully`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete provider`, { id: toastId });
				},
			},
		);
		setDeleteProviderId(null);
	};

	const handleToggleEnabled = (provider: AIProvider) => {
		const toastId = toast.loading(provider.isEnabled ? t`Disabling provider...` : t`Enabling provider...`);
		toggleEnabled(
			{ id: provider.id },
			{
				onSuccess: () => {
					toast.success(provider.isEnabled ? t`Provider disabled successfully` : t`Provider enabled successfully`, {
						id: toastId,
					});
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to toggle provider`, { id: toastId });
				},
			},
		);
	};

	const handleSetDefault = (provider: AIProvider) => {
		if (provider.isDefault) return;

		const toastId = toast.loading(t`Setting default provider...`);
		setDefault(
			{ id: provider.id },
			{
				onSuccess: () => {
					toast.success(t`Default provider updated`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to set default provider`, { id: toastId });
				},
			},
		);
	};

	const getProviderLabel = (providerValue: string) => {
		const option = PROVIDER_OPTIONS.find((opt) => opt.value === providerValue);
		return option?.label ?? providerValue;
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={BrainIcon} title={t`AI Provider Management`} />

			<div className="space-y-6 rounded-xl border bg-background p-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							to="/dashboard/admin"
							className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
						>
							<ArrowLeftIcon size={20} />
						</Link>
						<p className="text-muted-foreground text-sm">
							{providers.length} <Trans>configured providers</Trans>
						</p>
					</div>
					<Button onClick={() => setAddDialogOpen(true)}>
						<PlusIcon size={18} className="mr-1" />
						<Trans>Add Provider</Trans>
					</Button>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="providers" className="flex items-center gap-2">
							<BrainIcon className="size-4" />
							<Trans>Providers</Trans>
						</TabsTrigger>
						<TabsTrigger value="metrics" className="flex items-center gap-2">
							<ChartLineUpIcon className="size-4" />
							<Trans>Performance Metrics</Trans>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="providers" className="mt-6">
						{/* Providers Table */}
						{providers.length === 0 ? (
							<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
								<BrainIcon size={48} className="text-muted-foreground" />
								<p className="mt-4 font-medium text-muted-foreground">
									<Trans>No AI providers configured</Trans>
								</p>
								<p className="mt-1 text-muted-foreground text-sm">
									<Trans>Add a provider to enable AI-powered resume features.</Trans>
								</p>
								<Button onClick={() => setAddDialogOpen(true)} className="mt-4">
									<PlusIcon size={18} className="mr-1" />
									<Trans>Add Your First Provider</Trans>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto rounded-lg border">
								<Table className="min-w-[700px]">
									<TableHeader>
										<TableRow>
											<TableHead>
												<Trans>Provider</Trans>
											</TableHead>
											<TableHead>
												<Trans>Model</Trans>
											</TableHead>
											<TableHead>
												<Trans>Status</Trans>
											</TableHead>
											<TableHead>
												<Trans>Default</Trans>
											</TableHead>
											<TableHead>
												<Trans>Priority</Trans>
											</TableHead>
											<TableHead className="text-right">
												<Trans>Actions</Trans>
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{providers.map((provider) => (
											<TableRow key={provider.id}>
												<TableCell>
													<div>
														<p className="font-medium">{provider.displayName}</p>
														<p className="text-muted-foreground text-xs">{getProviderLabel(provider.provider)}</p>
													</div>
												</TableCell>
												<TableCell>
													<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{provider.model}</code>
												</TableCell>
												<TableCell>
													{provider.isEnabled ? (
														<Badge variant="default">
															<Trans>Enabled</Trans>
														</Badge>
													) : (
														<Badge variant="secondary">
															<Trans>Disabled</Trans>
														</Badge>
													)}
												</TableCell>
												<TableCell>
													{provider.isDefault && (
														<Badge variant="outline" className="gap-1">
															<StarIcon size={12} weight="fill" className="text-yellow-500" />
															<Trans>Default</Trans>
														</Badge>
													)}
												</TableCell>
												<TableCell>
													<span className="text-sm">{provider.priority}</span>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end gap-1">
														<Button
															variant="ghost"
															size="icon"
															title={t`Test Connection`}
															disabled={testingProvider === provider.id || !provider.isEnabled}
															onClick={() => handleTestConnection(provider)}
														>
															{testingProvider === provider.id ? (
																<SpinnerIcon size={18} className="animate-spin text-blue-500" />
															) : testResult?.id === provider.id ? (
																testResult.success ? (
																	<CheckCircleIcon size={18} className="text-green-500" />
																) : (
																	<XCircleIcon size={18} className="text-red-500" />
																)
															) : (
																<PlayIcon
																	size={18}
																	className={provider.isEnabled ? "text-blue-500" : "text-muted-foreground"}
																/>
															)}
														</Button>
														<Button
															variant="ghost"
															size="icon"
															title={provider.isEnabled ? t`Disable` : t`Enable`}
															onClick={() => handleToggleEnabled(provider)}
														>
															{provider.isEnabled ? (
																<ToggleRightIcon size={18} className="text-green-600" />
															) : (
																<ToggleLeftIcon size={18} className="text-muted-foreground" />
															)}
														</Button>
														<Button
															variant="ghost"
															size="icon"
															title={t`Set as Default`}
															disabled={provider.isDefault}
															onClick={() => handleSetDefault(provider)}
														>
															<StarIcon
																size={18}
																weight={provider.isDefault ? "fill" : "regular"}
																className={provider.isDefault ? "text-yellow-500" : "text-muted-foreground"}
															/>
														</Button>
														<Button
															variant="ghost"
															size="icon"
															title={t`Edit`}
															onClick={() => setEditProvider(provider)}
														>
															<PencilSimpleIcon size={18} />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="text-destructive hover:text-destructive"
															title={t`Delete`}
															onClick={() => setDeleteProviderId(provider.id)}
														>
															<TrashIcon size={18} />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</TabsContent>

					<TabsContent value="metrics" className="mt-6">
						<PerformanceMetricsTab />
					</TabsContent>
				</Tabs>
			</div>

			{/* Add Provider Dialog */}
			<ProviderFormDialog
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				initialData={DEFAULT_FORM_DATA}
				onSubmit={handleCreateProvider}
				isEdit={false}
			/>

			{/* Edit Provider Dialog */}
			{editProvider && (
				<ProviderFormDialog
					open={!!editProvider}
					onOpenChange={(open) => {
						if (!open) setEditProvider(null);
					}}
					initialData={{
						provider: editProvider.provider,
						displayName: editProvider.displayName,
						apiKey: "",
						model: editProvider.model,
						baseUrl: editProvider.baseUrl ?? "",
						maxTokensPerRequest: editProvider.maxTokensPerRequest,
						temperature: Number(editProvider.temperature) || 0.7,
						priority: editProvider.priority,
						isDefault: editProvider.isDefault,
					}}
					onSubmit={handleUpdateProvider}
					isEdit={true}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteProviderId} onOpenChange={() => setDeleteProviderId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Delete Provider</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans>
								Are you sure you want to delete this AI provider? This action cannot be undone. Any users relying on
								this provider will need to be reassigned.
							</Trans>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDeleteProvider}
						>
							<Trans>Delete</Trans>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
