import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ChatCircleIcon,
	CheckCircleIcon,
	CopyIcon,
	LinkedinLogoIcon,
	PencilSimpleIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	TrendUpIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/linkedin/" as any)({
	component: LinkedInProfileOptimizer,
	errorComponent: ErrorComponent,
});

type Industry =
	| "technology"
	| "finance"
	| "healthcare"
	| "marketing"
	| "engineering"
	| "education"
	| "consulting"
	| "general";

function LinkedInProfileOptimizer() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("profile");

	// Fetch profile data
	const { data: profile, isLoading } = useQuery({
		...orpc.linkedin.getProfile.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch industries
	const { data: industries = [] } = useQuery({
		...orpc.linkedin.getIndustries.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch content stats
	const { data: contentStats } = useQuery({
		...orpc.linkedinContent.getStats.queryOptions(),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
	});

	// Current values
	const selectedIndustry = (profile?.industry ?? "general") as Industry;
	const currentRole = profile?.currentRole ?? "";
	const currentHeadline = profile?.currentHeadline ?? "";
	const currentSummary = profile?.currentSummary ?? "";
	const yearsExperience = profile?.yearsExperience ?? 5;

	// Update profile mutation
	const updateProfileMutation = useMutation(
		orpc.linkedin.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
			},
		}),
	);

	// Generate headlines mutation
	const generateHeadlinesMutation = useMutation(
		orpc.linkedin.generateHeadlines.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
				toast.success(t`Title suggestions generated`);
			},
		}),
	);

	// Generate summaries mutation
	const generateSummariesMutation = useMutation(
		orpc.linkedin.generateSummaries.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
				toast.success(t`Summary suggestions generated`);
			},
		}),
	);

	// Calculate profile score
	const profileScore = useMemo(() => {
		if (!profile) return { overall: 0, headline: 0, summary: 0, photo: 0, skills: 0 };

		const photo = profile.hasProfilePhoto ? 100 : 0;
		const headline = Math.min(100, ((profile.currentHeadline?.length ?? 0) / 120) * 100);
		const summary = Math.min(100, ((profile.currentSummary?.length ?? 0) / 2000) * 100);
		const skills = Math.min(100, (profile.skillsCount / 50) * 100);
		const connections = Math.min(100, (profile.connectionsCount / 500) * 100);

		const overall = Math.round((photo + headline + summary + skills + connections) / 5);

		return {
			overall,
			headline: Math.round(headline),
			summary: Math.round(summary),
			photo,
			skills: Math.round(skills),
		};
	}, [profile]);

	const handleUpdateField = useCallback(
		(field: string, value: string | number | boolean) => {
			updateProfileMutation.mutate({ [field]: value });
		},
		[updateProfileMutation],
	);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	}, []);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<DashboardHeader icon={LinkedinLogoIcon} title={t`LinkedIn`} />
				<div className="grid gap-4 md:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="pt-6">
								<Skeleton className="mb-2 h-4 w-24" />
								<Skeleton className="h-8 w-16" />
							</CardContent>
						</Card>
					))}
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="space-y-3 pt-6">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-9 w-24" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<DashboardHeader icon={LinkedinLogoIcon} title={t`LinkedIn`} />

			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Profile Score</Trans>
								</p>
								<p className="font-bold text-2xl">{profileScore.overall}%</p>
							</div>
							<div
								className={cn(
									"flex size-12 items-center justify-center rounded-full",
									profileScore.overall >= 70 ? "bg-green-500/10" : "bg-amber-500/10",
								)}
							>
								<TrendUpIcon
									className={cn("size-6", profileScore.overall >= 70 ? "text-green-500" : "text-amber-500")}
									weight="fill"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Generated Posts</Trans>
								</p>
								<p className="font-bold text-2xl">{contentStats?.totalPosts || 0}</p>
							</div>
							<div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10">
								<PencilSimpleIcon className="size-6 text-blue-500" weight="fill" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Messages Sent</Trans>
								</p>
								<p className="font-bold text-2xl">{contentStats?.sentMessages || 0}</p>
							</div>
							<div className="flex size-12 items-center justify-center rounded-full bg-purple-500/10">
								<ChatCircleIcon className="size-6 text-purple-500" weight="fill" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Response Rate</Trans>
								</p>
								<p className="font-bold text-2xl">{contentStats?.responseRate || 0}%</p>
							</div>
							<div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
								<CheckCircleIcon className="size-6 text-green-500" weight="fill" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-3">
				<Link to="/dashboard/linkedin/content">
					<Card className="cursor-pointer transition-colors hover:bg-accent/50">
						<CardContent className="flex items-center gap-4 pt-6">
							<div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
								<PencilSimpleIcon className="size-6 text-white" weight="fill" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">
									<Trans>Post Generator</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Create engaging content with AI</Trans>
								</p>
							</div>
							<ArrowRightIcon className="size-5 text-muted-foreground" />
						</CardContent>
					</Card>
				</Link>

				<Link to="/dashboard/linkedin/messages">
					<Card className="cursor-pointer transition-colors hover:bg-accent/50">
						<CardContent className="flex items-center gap-4 pt-6">
							<div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
								<ChatCircleIcon className="size-6 text-white" weight="fill" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">
									<Trans>Networking Messages</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Create personalized messages</Trans>
								</p>
							</div>
							<ArrowRightIcon className="size-5 text-muted-foreground" />
						</CardContent>
					</Card>
				</Link>

				<Link to="/dashboard/linkedin/strategies">
					<Card className="cursor-pointer transition-colors hover:bg-accent/50">
						<CardContent className="flex items-center gap-4 pt-6">
							<div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
								<TargetIcon className="size-6 text-white" weight="fill" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">
									<Trans>Connection Strategies</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Grow your network effectively</Trans>
								</p>
							</div>
							<ArrowRightIcon className="size-5 text-muted-foreground" />
						</CardContent>
					</Card>
				</Link>
			</div>

			<Separator />

			{/* Profile Optimizer */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
					<TabsTrigger value="profile">
						<Trans>Profile</Trans>
					</TabsTrigger>
					<TabsTrigger value="headline">
						<Trans>Title</Trans>
					</TabsTrigger>
					<TabsTrigger value="summary">
						<Trans>Summary</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UserCircleIcon className="size-5" />
								<Trans>Basic Information</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Configure your profile for personalized suggestions</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label>
										<Trans>Industry</Trans>
									</Label>
									<Select value={selectedIndustry} onValueChange={(value) => handleUpdateField("industry", value)}>
										<SelectTrigger>
											<SelectValue placeholder={t`Select your industry`} />
										</SelectTrigger>
										<SelectContent>
											{industries.map((industry) => (
												<SelectItem key={industry.value} value={industry.value}>
													{industry.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>
										<Trans>Current position</Trans>
									</Label>
									<Input
										value={currentRole}
										onChange={(e) => handleUpdateField("currentRole", e.target.value)}
										placeholder={t`e.g. Software Engineer`}
									/>
								</div>

								<div className="space-y-2">
									<Label>
										<Trans>Years of experience</Trans>
									</Label>
									<Input
										type="number"
										value={yearsExperience}
										onChange={(e) => handleUpdateField("yearsExperience", Number(e.target.value))}
										min={0}
										max={50}
									/>
								</div>
							</div>

							{/* Score Breakdown */}
							<div className="mt-6 space-y-4">
								<h4 className="font-medium">
									<Trans>Your profile score</Trans>
								</h4>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm">
											<Trans>Profile photo</Trans>
										</span>
										<div className="flex items-center gap-2">
											<Progress value={profileScore.photo} className="w-24" />
											<span className="w-8 text-right text-sm">{profileScore.photo}%</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">
											<Trans>Title</Trans>
										</span>
										<div className="flex items-center gap-2">
											<Progress value={profileScore.headline} className="w-24" />
											<span className="w-8 text-right text-sm">{profileScore.headline}%</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">
											<Trans>Summary</Trans>
										</span>
										<div className="flex items-center gap-2">
											<Progress value={profileScore.summary} className="w-24" />
											<span className="w-8 text-right text-sm">{profileScore.summary}%</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">
											<Trans>Skills</Trans>
										</span>
										<div className="flex items-center gap-2">
											<Progress value={profileScore.skills} className="w-24" />
											<span className="w-8 text-right text-sm">{profileScore.skills}%</span>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="headline" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<SparkleIcon className="size-5" />
								<Trans>Title Generator</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Create a catchy professional title for your LinkedIn profile</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>
									<Trans>Your current title</Trans>
								</Label>
								<Textarea
									value={currentHeadline}
									onChange={(e) => handleUpdateField("currentHeadline", e.target.value)}
									placeholder={t`Enter your current LinkedIn title`}
									className="min-h-[80px]"
								/>
								<p className="text-muted-foreground text-xs">
									{currentHeadline.length}/120 <Trans>characters</Trans>
								</p>
							</div>

							<Button
								onClick={() =>
									generateHeadlinesMutation.mutate({
										currentRole,
										industry: selectedIndustry,
									})
								}
								disabled={generateHeadlinesMutation.isPending || !currentRole}
							>
								{generateHeadlinesMutation.isPending ? (
									<SpinnerIcon className="mr-2 size-4 animate-spin" />
								) : (
									<SparkleIcon className="mr-2 size-4" />
								)}
								<Trans>Generate suggestions</Trans>
							</Button>

							{profile?.headlineSuggestions && profile.headlineSuggestions.length > 0 && (
								<div className="mt-4 space-y-3">
									<h4 className="font-medium">
										<Trans>Suggestions</Trans>
									</h4>
									{profile.headlineSuggestions.map((suggestion) => (
										<motion.div
											key={suggestion.id}
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											className="rounded-lg border p-4"
										>
											<div className="flex items-start justify-between gap-2">
												<p className="flex-1 text-sm">{suggestion.headline}</p>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => copyToClipboard(suggestion.headline)}
													aria-label={t`Copy title`}
												>
													<CopyIcon className="size-4" />
												</Button>
											</div>
											<div className="mt-2 flex flex-wrap gap-1">
												{suggestion.keywords.map((keyword, idx) => (
													<Badge key={idx} variant="secondary" className="text-xs">
														{keyword}
													</Badge>
												))}
												<Badge variant="outline" className="text-xs">
													{suggestion.tone}
												</Badge>
											</div>
										</motion.div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="summary" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<SparkleIcon className="size-5" />
								<Trans>Summary Generator</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Create an impactful professional summary</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>
									<Trans>Your current summary</Trans>
								</Label>
								<Textarea
									value={currentSummary}
									onChange={(e) => handleUpdateField("currentSummary", e.target.value)}
									placeholder={t`Enter your current LinkedIn summary`}
									className="min-h-[160px]"
								/>
								<p className="text-muted-foreground text-xs">
									{currentSummary.length}/2000 <Trans>characters</Trans>
								</p>
							</div>

							<Button
								onClick={() =>
									generateSummariesMutation.mutate({
										currentRole,
										industry: selectedIndustry,
										yearsExperience,
									})
								}
								disabled={generateSummariesMutation.isPending || !currentRole}
							>
								{generateSummariesMutation.isPending ? (
									<SpinnerIcon className="mr-2 size-4 animate-spin" />
								) : (
									<SparkleIcon className="mr-2 size-4" />
								)}
								<Trans>Generate suggestions</Trans>
							</Button>

							{profile?.summarySuggestions && profile.summarySuggestions.length > 0 && (
								<div className="mt-4 space-y-3">
									<h4 className="font-medium">
										<Trans>Suggestions</Trans>
									</h4>
									{profile.summarySuggestions.map((suggestion) => (
										<motion.div
											key={suggestion.id}
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											className="rounded-lg border p-4"
										>
											<div className="flex items-start justify-between gap-2">
												<p className="flex-1 whitespace-pre-wrap text-sm">{suggestion.summary}</p>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => copyToClipboard(suggestion.summary)}
													aria-label={t`Copy summary`}
												>
													<CopyIcon className="size-4" />
												</Button>
											</div>
											<div className="mt-2 flex flex-wrap gap-1">
												<Badge variant="outline" className="text-xs">
													{suggestion.wordCount} <Trans>words</Trans>
												</Badge>
												{suggestion.keywords.slice(0, 3).map((keyword, idx) => (
													<Badge key={idx} variant="secondary" className="text-xs">
														{keyword}
													</Badge>
												))}
											</div>
										</motion.div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
