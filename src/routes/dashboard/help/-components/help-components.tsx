import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BugIcon,
	CaretRightIcon,
	ChatsCircleIcon,
	ClockIcon,
	CommandIcon,
	CompassIcon,
	EnvelopeIcon,
	GlobeIcon,
	HeadsetIcon,
	type Icon,
	KeyboardIcon,
	LightbulbIcon,
	QuestionIcon,
	ReadCvLogoIcon,
	RobotIcon,
	RocketLaunchIcon,
	SparkleIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/components/keyboard-shortcuts-provider";
import { WikiLinkCard } from "@/components/shared/wiki-link-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

import { getQuickHelpCards, getVideoTutorials } from "./help-config";
import type { FAQCategory, FAQItem } from "./help-types";
import { formatKey, isMac } from "./help-utils";

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
	return (
		<div className="border-border border-b last:border-0">
			<button
				type="button"
				className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-primary"
				onClick={onToggle}
			>
				<span className="font-medium">{item.question}</span>
				<motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
					<CaretRightIcon className="size-5 shrink-0 text-muted-foreground" />
				</motion.div>
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<p className="pb-4 text-muted-foreground">{item.answer}</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function HeroSection({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-green-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10 text-center">
				<motion.div
					className="mb-3 flex items-center justify-center gap-2"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<HeadsetIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Support IMTA</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Help Center</Trans>
				</motion.h2>

				<motion.p
					className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Quickly find answers to your questions. Explore our guides, tutorials, and FAQ to get the most out of the
						platform.
					</Trans>
				</motion.p>

				<motion.div
					className="mx-auto max-w-xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<div className="relative">
						<QuestionIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="text"
							placeholder={t`Search help...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-12 rounded-full border-2 border-primary/20 bg-background/80 pr-4 pl-12 text-base backdrop-blur-sm transition-all focus:border-primary/50 focus:shadow-lg"
						/>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

function QuickHelpCardsSection() {
	const quickHelpCards = getQuickHelpCards();

	return (
		<section className="mb-10">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<RocketLaunchIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Quick Guides</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{quickHelpCards.map((card, index) => {
					const CardIcon = card.icon;
					return (
						<motion.div
							key={card.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Link to={card.link as "/dashboard/resumes"}>
								<Card
									className={cn(
										"group h-full cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl",
										"bg-gradient-to-br",
										card.color,
									)}
								>
									<CardHeader className="pb-2">
										<div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-background/80 shadow-sm transition-transform group-hover:scale-110">
											<CardIcon className="size-6 text-primary" weight="duotone" />
										</div>
										<CardTitle className="text-lg">{card.title}</CardTitle>
										<CardDescription className="text-sm">{card.description}</CardDescription>
									</CardHeader>
									<CardContent className="pt-2">
										<div className="flex items-center gap-1 text-primary text-sm">
											<Trans>Learn more</Trans>
											<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
										</div>
									</CardContent>
								</Card>
							</Link>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

function FAQSection({
	faqCategories,
	filteredCategories,
	selectedCategory,
	setSelectedCategory,
	searchQuery,
	openFAQs,
	toggleFAQ,
}: {
	faqCategories: FAQCategory[];
	filteredCategories: FAQCategory[];
	selectedCategory: string;
	setSelectedCategory: (id: string) => void;
	searchQuery: string;
	openFAQs: Record<string, boolean>;
	toggleFAQ: (categoryId: string, questionIndex: number) => void;
}) {
	return (
		<section className="mb-10">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<LightbulbIcon className="size-6 text-amber-500" weight="fill" />
				<Trans>Frequently Asked Questions</Trans>
			</h3>

			<div className="grid gap-6 lg:grid-cols-4">
				<div className="lg:col-span-1">
					<Card className="sticky top-4">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">
								<Trans>Categories</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-1 pt-0">
							{faqCategories.map((category) => {
								const CategoryIcon = category.icon;
								const isActive = selectedCategory === category.id;
								return (
									<button
										key={category.id}
										type="button"
										onClick={() => setSelectedCategory(category.id)}
										className={cn(
											"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
											isActive
												? "bg-primary/10 font-medium text-primary"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
										)}
									>
										<div className={cn("flex size-8 items-center justify-center rounded-lg", category.color)}>
											<CategoryIcon className="size-4" weight={isActive ? "fill" : "regular"} />
										</div>
										<span>{category.title}</span>
									</button>
								);
							})}
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-3">
					{searchQuery ? (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<QuestionIcon className="size-5" />
									<Trans>Search results</Trans>
								</CardTitle>
								<CardDescription>
									{filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} <Trans>results found</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								{filteredCategories.length > 0 ? (
									filteredCategories.map((category) => (
										<div key={category.id} className="mb-6 last:mb-0">
											<Badge className={cn("mb-3", category.color)}>{category.title}</Badge>
											{category.items.map((item, index) => (
												<FAQAccordionItem
													key={index}
													item={item}
													isOpen={openFAQs[`${category.id}-${index}`] || false}
													onToggle={() => toggleFAQ(category.id, index)}
												/>
											))}
										</div>
									))
								) : (
									<div className="py-8 text-center text-muted-foreground">
										<QuestionIcon className="mx-auto mb-3 size-12 opacity-50" />
										<p>
											<Trans>No results found for "{searchQuery}"</Trans>
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					) : (
						<AnimatePresence mode="wait">
							{faqCategories
								.filter((cat) => cat.id === selectedCategory)
								.map((category) => {
									const CategoryIcon = category.icon;
									return (
										<motion.div
											key={category.id}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -20 }}
											transition={{ duration: 0.3 }}
										>
											<Card>
												<CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
													<div className="flex items-center gap-3">
														<div className={cn("flex size-12 items-center justify-center rounded-xl", category.color)}>
															<CategoryIcon className="size-6" weight="duotone" />
														</div>
														<div>
															<CardTitle>{category.title}</CardTitle>
															<CardDescription>
																{category.items.length} <Trans>questions</Trans>
															</CardDescription>
														</div>
													</div>
												</CardHeader>
												<CardContent className="pt-4">
													{category.items.map((item, index) => (
														<FAQAccordionItem
															key={index}
															item={item}
															isOpen={openFAQs[`${category.id}-${index}`] || false}
															onToggle={() => toggleFAQ(category.id, index)}
														/>
													))}
												</CardContent>
											</Card>
										</motion.div>
									);
								})}
						</AnimatePresence>
					)}
				</div>
			</div>
		</section>
	);
}

const GUIDE_ICONS: Record<string, Icon> = {
	"cv-pro": ReadCvLogoIcon,
	"interview-success": ChatsCircleIcon,
	"career-explore": CompassIcon,
	"linkedin-optimize": GlobeIcon,
	"networking-techniques": UsersIcon,
	"salary-negotiation": TrophyIcon,
};

function VideoTutorialsSection() {
	const videoTutorials = getVideoTutorials();

	return (
		<section className="mb-10">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<BookOpenIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Guides and Resources</Trans>
			</h3>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{videoTutorials.map((guide, index) => {
					const GuideIcon = GUIDE_ICONS[guide.id] ?? BookOpenIcon;
					return (
						<motion.div
							key={guide.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Link to={guide.url as "/dashboard/resumes"}>
								<Card className="group h-full cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
									<div
										className={cn(
											"relative flex aspect-video items-center justify-center bg-gradient-to-br",
											guide.gradient,
										)}
									>
										<div className="flex size-16 items-center justify-center rounded-2xl bg-background/80 shadow-md transition-transform group-hover:scale-110">
											<GuideIcon className="size-8 text-primary" weight="duotone" />
										</div>
										<Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">{guide.category}</Badge>
										<Badge className="absolute right-3 bottom-3 gap-1 bg-background/80 backdrop-blur-sm">
											<ClockIcon className="size-3" />
											{guide.duration}
										</Badge>
									</div>
									<CardHeader className="pb-2">
										<CardTitle className="text-lg group-hover:text-primary">{guide.title}</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<p className="mb-3 text-muted-foreground text-sm">{guide.description}</p>
										<div className="flex items-center gap-1 text-primary text-sm">
											<Trans>Access guide</Trans>
											<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
										</div>
									</CardContent>
								</Card>
							</Link>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

function ContactSection() {
	const [contactForm, setContactForm] = useState<{
		email: string;
		subject: string;
		message: string;
		type: "support" | "bug" | "feature" | "other";
		name?: string;
	}>({
		email: "",
		subject: "",
		message: "",
		type: "support",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const contactMutation = useMutation({
		mutationFn: async (data: typeof contactForm) => {
			return await client.support.submitContactForm(data);
		},
		onSuccess: (result) => {
			if (result.success) {
				toast.success(result.message);
				setContactForm({ email: "", subject: "", message: "", type: "support" });
			} else {
				toast.error(result.message);
			}
		},
		onError: () => {
			toast.error(t`An error occurred. Please try again.`);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		await contactMutation.mutateAsync(contactForm);
		setIsSubmitting(false);
	};

	return (
		<section className="mb-10">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<EnvelopeIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Contact Us</Trans>
			</h3>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-4">
					<Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
								<EnvelopeIcon className="size-7 text-blue-600 dark:text-blue-400" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Email Support</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">support@imta.ma</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Response within 24h</Trans>
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">
								<Trans>Quick Links</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 pt-0">
							<button
								type="button"
								onClick={() => setContactForm((prev) => ({ ...prev, type: "bug" }))}
								className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
							>
								<BugIcon className="size-5 text-red-500" />
								<span className="text-sm">
									<Trans>Report a bug</Trans>
								</span>
							</button>
							<button
								type="button"
								onClick={() => setContactForm((prev) => ({ ...prev, type: "feature" }))}
								className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
							>
								<SparkleIcon className="size-5 text-amber-500" />
								<span className="text-sm">
									<Trans>Suggest a feature</Trans>
								</span>
							</button>
							<button
								type="button"
								onClick={() => setContactForm((prev) => ({ ...prev, type: "support" }))}
								className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
							>
								<HeadsetIcon className="size-5 text-green-500" />
								<span className="text-sm">
									<Trans>General support</Trans>
								</span>
							</button>
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{contactForm.type === "bug" && <BugIcon className="size-5 text-red-500" />}
								{contactForm.type === "feature" && <SparkleIcon className="size-5 text-amber-500" />}
								{contactForm.type === "support" && <HeadsetIcon className="size-5 text-green-500" />}
								{contactForm.type === "bug" && <Trans>Report a Bug</Trans>}
								{contactForm.type === "feature" && <Trans>Suggest a Feature</Trans>}
								{contactForm.type === "support" && <Trans>Support Request</Trans>}
							</CardTitle>
							<CardDescription>
								<Trans>Fill out the form below and we'll get back to you quickly</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="email">
											<Trans>Email</Trans>
										</Label>
										<Input
											id="email"
											type="email"
											placeholder="your@email.com"
											value={contactForm.email}
											onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="subject">
											<Trans>Subject</Trans>
										</Label>
										<Input
											id="subject"
											type="text"
											placeholder={t`Briefly describe your request`}
											value={contactForm.subject}
											onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
											required
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="message">
										<Trans>Message</Trans>
									</Label>
									<Textarea
										id="message"
										placeholder={t`Describe your request in detail...`}
										rows={5}
										value={contactForm.message}
										onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
										required
									/>
								</div>
								<Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<motion.div
												animate={{ rotate: 360 }}
												transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
											>
												<SparkleIcon className="size-4" />
											</motion.div>
											<Trans>Sending...</Trans>
										</>
									) : (
										<>
											<EnvelopeIcon className="size-4" />
											<Trans>Send message</Trans>
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}

function KeyboardShortcutsSection() {
	const { data: session } = authClient.useSession();
	const { openShortcutsModal } = useKeyboardShortcuts();

	const { data: shortcuts } = useQuery({
		...orpc.shortcuts.getAll.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	return (
		<section className="mb-10">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<KeyboardIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Keyboard Shortcuts</Trans>
			</h3>

			<Card>
				<CardHeader className="border-b">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2 text-lg">
								<CommandIcon className="size-5" />
								<Trans>Available shortcuts</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Use these shortcuts to navigate the application faster</Trans>
							</CardDescription>
						</div>
						<Button variant="outline" className="gap-2" onClick={openShortcutsModal}>
							<KeyboardIcon className="size-4" />
							<Trans>View all shortcuts</Trans>
							<KbdGroup>
								<Kbd className="ml-2">{isMac ? "Cmd" : "Ctrl"}</Kbd>
								<span className="text-muted-foreground text-xs">+</span>
								<Kbd>/</Kbd>
							</KbdGroup>
						</Button>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="grid gap-0 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
						<div className="p-6">
							<h4 className="mb-4 flex items-center gap-2 font-medium">
								<Badge variant="outline">
									<Trans>Navigation</Trans>
								</Badge>
							</h4>
							<div className="space-y-3">
								{shortcuts
									?.filter((s) => s.category === "navigation" && s.enabled)
									.slice(0, 5)
									.map((shortcut) => (
										<div key={shortcut.id} className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">{shortcut.label}</span>
											<KbdGroup>
												{shortcut.keys.map((key, i) => (
													<span key={`${key}-${i}`} className="flex items-center gap-0.5">
														<Kbd>{formatKey(key)}</Kbd>
														{i < shortcut.keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
													</span>
												))}
											</KbdGroup>
										</div>
									))}
							</div>
						</div>

						<div className="p-6">
							<h4 className="mb-4 flex items-center gap-2 font-medium">
								<Badge variant="outline">
									<Trans>General</Trans>
								</Badge>
							</h4>
							<div className="space-y-3">
								{shortcuts
									?.filter((s) => s.category === "general" && s.enabled)
									.slice(0, 5)
									.map((shortcut) => (
										<div key={shortcut.id} className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">{shortcut.label}</span>
											<KbdGroup>
												{shortcut.keys.map((key, i) => (
													<span key={`${key}-${i}`} className="flex items-center gap-0.5">
														<Kbd>{formatKey(key)}</Kbd>
														{i < shortcut.keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
													</span>
												))}
											</KbdGroup>
										</div>
									))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

function StillNeedHelpSection() {
	return (
		<>
			<motion.section initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
				<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
					<CardContent className="flex flex-col items-center py-8 text-center">
						<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
							<HeadsetIcon className="size-8 text-primary" weight="duotone" />
						</div>
						<h3 className="mb-2 font-bold text-2xl">
							<Trans>Still have questions?</Trans>
						</h3>
						<p className="mb-6 max-w-md text-muted-foreground">
							<Trans>Our support team is available to help you. Don't hesitate to contact us with any questions.</Trans>
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Button size="lg" className="gap-2">
								<ChatsCircleIcon className="size-5" />
								<Trans>Chat with Support</Trans>
							</Button>
							<Link to="/dashboard/interview/chatbot">
								<Button size="lg" variant="outline" className="gap-2">
									<RobotIcon className="size-5" />
									<Trans>Ask the AI a question</Trans>
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</motion.section>

			<div className="mt-6">
				<WikiLinkCard
					title={t`Knowledge Base & Wiki`}
					description={t`Browse our full library of guides, tutorials, and career resources`}
					wikiPath="/dashboard/wiki"
				/>
			</div>
		</>
	);
}

export {
	ContactSection,
	FAQSection,
	HeroSection,
	KeyboardShortcutsSection,
	QuickHelpCardsSection,
	StillNeedHelpSection,
	VideoTutorialsSection,
};
