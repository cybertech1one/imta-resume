import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	FloppyDiskIcon,
	HashIcon,
	PencilSimpleIcon,
	PlusIcon,
	SpinnerIcon,
	StarIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/linkedin/content" as any)({
	component: LinkedInContentGenerator,
	errorComponent: ErrorComponent,
});

type PostType = "career_update" | "thought_leadership" | "engagement" | "story" | "achievement" | "tip" | "question";
type PostTone = "professional" | "friendly" | "inspirational" | "analytical" | "conversational";
type PostStatus = "draft" | "scheduled" | "published" | "archived";

const POST_TYPES: { value: PostType; label: string; icon: string; description: string }[] = [
	{
		value: "career_update",
		label: "Career Update",
		icon: "🎉",
		description: "New position, promotion, certification",
	},
	{
		value: "thought_leadership",
		label: "Thought Leadership",
		icon: "💡",
		description: "Industry insights and reflections",
	},
	{ value: "engagement", label: "Engagement", icon: "❓", description: "Questions and discussions" },
	{ value: "story", label: "Story", icon: "📖", description: "Personal stories and journeys" },
	{ value: "achievement", label: "Achievement", icon: "🏆", description: "Projects and accomplishments" },
	{ value: "tip", label: "Tip", icon: "📌", description: "Tips and recommendations" },
	{ value: "question", label: "Question", icon: "🤔", description: "Ask your network for their opinion" },
];

const POST_TONES: { value: PostTone; label: string }[] = [
	{ value: "professional", label: "Professional" },
	{ value: "friendly", label: "Friendly" },
	{ value: "inspirational", label: "Inspirational" },
	{ value: "analytical", label: "Analytical" },
	{ value: "conversational", label: "Conversational" },
];

const LANGUAGES = [
	{ value: "fr", label: "Français" },
	{ value: "en", label: "English" },
	{ value: "ar", label: "العربية" },
	{ value: "darija", label: "Darija" },
];

function LinkedInContentGenerator() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("create");
	const [showNewPostDialog, setShowNewPostDialog] = useState(false);

	// Form state
	const [postType, setPostType] = useState<PostType>("career_update");
	const [tone, setTone] = useState<PostTone>("professional");
	const [language, setLanguage] = useState("fr");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [hashtags, setHashtags] = useState<string[]>([]);

	// Fetch posts
	const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
		...orpc.linkedinContent.listPosts.queryOptions(),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
	});

	// Fetch templates - used for future template selection UI
	useQuery({
		...orpc.linkedinContent.getPostTemplates.queryOptions(),
		enabled: !!session?.user,
		staleTime: 10 * 60 * 1000,
	});

	// Fetch hashtag suggestions
	const { data: hashtagSuggestions = [] } = useQuery({
		...orpc.linkedinContent.getHashtagSuggestions.queryOptions({
			input: { industry: "general" },
		}),
		enabled: !!session?.user,
		staleTime: 10 * 60 * 1000,
	});

	// Create post mutation
	const createPostMutation = useMutation({
		mutationFn: async (input: {
			postType: PostType;
			tone: PostTone;
			language: string;
			title?: string;
			content: string;
			hashtags?: string[];
		}) => {
			return orpc.linkedinContent.createPost.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["linkedinContent", "listPosts"] });
			toast.success(t`Post created successfully`);
			resetForm();
			setShowNewPostDialog(false);
		},
		onError: () => {
			toast.error(t`Error creating post`);
		},
	});

	// Update post mutation
	const updatePostMutation = useMutation({
		mutationFn: async (input: { id: string; content?: string; status?: PostStatus; isFavorite?: boolean }) => {
			return orpc.linkedinContent.updatePost.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["linkedinContent", "listPosts"] });
		},
	});

	// Delete post mutation
	const deletePostMutation = useMutation({
		mutationFn: async (id: string) => {
			return orpc.linkedinContent.deletePost.call({ id });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["linkedinContent", "listPosts"] });
			toast.success(t`Post deleted`);
		},
	});

	const resetForm = useCallback(() => {
		setPostType("career_update");
		setTone("professional");
		setLanguage("fr");
		setTitle("");
		setContent("");
		setHashtags([]);
	}, []);

	const removeHashtag = useCallback((tag: string) => {
		setHashtags((prev) => prev.filter((t) => t !== tag));
	}, []);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	}, []);

	// Filter posts by status
	const draftPosts = useMemo(() => posts.filter((p) => p.status === "draft"), [posts]);
	const publishedPosts = useMemo(() => posts.filter((p) => p.status === "published"), [posts]);

	return (
		<div className="space-y-6">
			<DashboardHeader icon={PencilSimpleIcon} title={t`LinkedIn Post Generator`} />

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
								<PencilSimpleIcon className="size-5 text-blue-500" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Total Posts</Trans>
								</p>
								<p className="font-bold text-xl">{posts.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
								<ClockIcon className="size-5 text-amber-500" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Drafts</Trans>
								</p>
								<p className="font-bold text-xl">{draftPosts.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
								<CheckCircleIcon className="size-5 text-green-500" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Published</Trans>
								</p>
								<p className="font-bold text-xl">{publishedPosts.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<Button onClick={() => setShowNewPostDialog(true)} className="w-full gap-2">
							<PlusIcon className="size-4" />
							<Trans>New Post</Trans>
						</Button>
					</CardContent>
				</Card>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="create">
						<Trans>Create</Trans>
					</TabsTrigger>
					<TabsTrigger value="drafts">
						<Trans>Drafts</Trans> ({draftPosts.length})
					</TabsTrigger>
					<TabsTrigger value="templates">
						<Trans>Templates</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="create" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Post Type Selection */}
						<Card>
							<CardHeader>
								<CardTitle>
									<Trans>Post Type</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Choose the type of content to create</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-3 sm:grid-cols-2">
								{POST_TYPES.map((type) => (
									<button
										key={type.value}
										type="button"
										onClick={() => setPostType(type.value)}
										className={cn(
											"flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
											postType === type.value ? "border-primary bg-primary/5" : "hover:bg-accent/50",
										)}
									>
										<span className="text-xl">{type.icon}</span>
										<div>
											<p className="font-medium text-sm">{type.label}</p>
											<p className="text-muted-foreground text-xs">{type.description}</p>
										</div>
									</button>
								))}
							</CardContent>
						</Card>

						{/* Settings */}
						<Card>
							<CardHeader>
								<CardTitle>
									<Trans>Settings</Trans>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label>
											<Trans>Tone</Trans>
										</Label>
										<Select value={tone} onValueChange={(v) => setTone(v as PostTone)}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{POST_TONES.map((t) => (
													<SelectItem key={t.value} value={t.value}>
														{t.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>
											<Trans>Language</Trans>
										</Label>
										<Select value={language} onValueChange={setLanguage}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{LANGUAGES.map((l) => (
													<SelectItem key={l.value} value={l.value}>
														{l.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label>
										<Trans>Title (optional)</Trans>
									</Label>
									<Input
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder={t`e.g. My new professional adventure`}
									/>
								</div>

								{/* Hashtag suggestions */}
								<div className="space-y-2">
									<Label className="flex items-center gap-2">
										<HashIcon className="size-4" />
										<Trans>Suggested hashtags</Trans>
									</Label>
									<div className="flex flex-wrap gap-1">
										{hashtagSuggestions.slice(0, 8).map((tag) => (
											<Badge
												key={tag}
												variant={hashtags.includes(tag) ? "default" : "outline"}
												className="cursor-pointer text-xs"
												onClick={() => {
													if (hashtags.includes(tag)) {
														removeHashtag(tag);
													} else {
														setHashtags([...hashtags, tag]);
													}
												}}
											>
												{tag}
											</Badge>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Content Editor */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<PencilSimpleIcon className="size-5" />
								<Trans>Post Content</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder={t`Write your post here...`}
								className="min-h-[200px]"
							/>
							<div className="flex items-center justify-between">
								<p className="text-muted-foreground text-sm">{content.length} / 3000</p>
								<div className="flex gap-2">
									<Button variant="outline" onClick={resetForm}>
										<Trans>Reset</Trans>
									</Button>
									<Button
										onClick={() =>
											createPostMutation.mutate({
												postType,
												tone,
												language,
												title: title || undefined,
												content,
												hashtags,
											})
										}
										disabled={!content || createPostMutation.isPending}
									>
										{createPostMutation.isPending ? (
											<SpinnerIcon className="mr-2 size-4 animate-spin" />
										) : (
											<FloppyDiskIcon className="mr-2 size-4" />
										)}
										<Trans>Save</Trans>
									</Button>
								</div>
							</div>

							{/* Selected hashtags */}
							{hashtags.length > 0 && (
								<div className="flex flex-wrap gap-1 pt-2">
									{hashtags.map((tag) => (
										<Badge key={tag} variant="secondary" className="gap-1">
											{tag}
											<button type="button" onClick={() => removeHashtag(tag)} className="hover:text-destructive">
												×
											</button>
										</Badge>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="drafts" className="space-y-4">
					{isLoadingPosts ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardContent className="pt-6">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 space-y-3">
												<Skeleton className="h-5 w-48" />
												<Skeleton className="h-20 w-full" />
												<div className="flex gap-2">
													<Skeleton className="h-5 w-16" />
													<Skeleton className="h-5 w-16" />
												</div>
												<Skeleton className="h-4 w-32" />
											</div>
											<div className="flex gap-2">
												<Skeleton className="size-8" />
												<Skeleton className="size-8" />
												<Skeleton className="size-8" />
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : draftPosts.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<PencilSimpleIcon className="size-12 text-muted-foreground" />
								<p className="mt-4 text-muted-foreground">
									<Trans>No drafts yet</Trans>
								</p>
								<Button className="mt-4" onClick={() => setActiveTab("create")}>
									<PlusIcon className="mr-2 size-4" />
									<Trans>Create a post</Trans>
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{draftPosts.map((post) => (
								<motion.div key={post.id} initial={false} animate={{ opacity: 1, y: 0 }}>
									<Card>
										<CardContent className="pt-6">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													{post.title && <h4 className="mb-2 font-medium">{post.title}</h4>}
													<p className="whitespace-pre-wrap text-sm">{post.content}</p>
													<div className="mt-3 flex flex-wrap gap-1">
														{post.hashtags?.map((tag) => (
															<Badge key={tag} variant="secondary" className="text-xs">
																{tag}
															</Badge>
														))}
													</div>
													<p className="mt-2 text-muted-foreground text-xs">
														<Trans>Created on</Trans> {new Date(post.createdAt).toLocaleDateString("fr-FR")}
													</p>
												</div>
												<div className="flex gap-2">
													<Button
														size="icon"
														variant="ghost"
														onClick={() => copyToClipboard(post.content)}
														aria-label={t`Copy content`}
													>
														<CopyIcon className="size-4" />
													</Button>
													<Button
														size="icon"
														variant="ghost"
														aria-label={post.isFavorite ? t`Remove from favorites` : t`Add to favorites`}
														onClick={() =>
															updatePostMutation.mutate({
																id: post.id,
																isFavorite: !post.isFavorite,
															})
														}
													>
														<StarIcon className={cn("size-4", post.isFavorite && "fill-amber-500 text-amber-500")} />
													</Button>
													<Button
														size="icon"
														variant="ghost"
														onClick={() => deletePostMutation.mutate(post.id)}
														aria-label={t`Delete post`}
													>
														<TrashIcon className="size-4 text-destructive" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="templates" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>
								<Trans>Post Templates</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Use these templates as a starting point</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 sm:grid-cols-2">
								{POST_TYPES.slice(0, 4).map((type) => (
									<Card key={type.value} className="cursor-pointer hover:bg-accent/50">
										<CardContent className="pt-6">
											<div className="mb-3 flex items-center gap-3">
												<span className="text-2xl">{type.icon}</span>
												<div>
													<h4 className="font-medium">{type.label}</h4>
													<p className="text-muted-foreground text-xs">{type.description}</p>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="w-full"
												onClick={() => {
													setPostType(type.value);
													setActiveTab("create");
												}}
											>
												<Trans>Use this template</Trans>
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* New Post Dialog */}
			<Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							<Trans>New LinkedIn Post</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Create a new post for your LinkedIn network</Trans>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-3">
							<div className="space-y-2">
								<Label>
									<Trans>Type</Trans>
								</Label>
								<Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{POST_TYPES.map((t) => (
											<SelectItem key={t.value} value={t.value}>
												{t.icon} {t.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Tone</Trans>
								</Label>
								<Select value={tone} onValueChange={(v) => setTone(v as PostTone)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{POST_TONES.map((t) => (
											<SelectItem key={t.value} value={t.value}>
												{t.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Language</Trans>
								</Label>
								<Select value={language} onValueChange={setLanguage}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{LANGUAGES.map((l) => (
											<SelectItem key={l.value} value={l.value}>
												{l.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Content</Trans>
							</Label>
							<Textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder={t`Write your post here...`}
								className="min-h-[150px]"
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button
							onClick={() =>
								createPostMutation.mutate({
									postType,
									tone,
									language,
									content,
									hashtags,
								})
							}
							disabled={!content || createPostMutation.isPending}
						>
							{createPostMutation.isPending ? (
								<SpinnerIcon className="mr-2 size-4 animate-spin" />
							) : (
								<FloppyDiskIcon className="mr-2 size-4" />
							)}
							<Trans>Save</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
