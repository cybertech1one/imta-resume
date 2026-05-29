import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	CrownIcon,
	DownloadSimpleIcon,
	LinkIcon,
	PencilSimpleIcon,
	PlusIcon,
	QuotesIcon,
	StarIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { CometCard } from "@/components/animation/comet-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/utils/style";

import { SAMPLE_CERTIFICATIONS, SAMPLE_TESTIMONIALS } from "./portfolio-config";
import type { CaseStudy } from "./portfolio-types";

// ─── Certifications Tab Content ───────────────────────────────────────────

export function CertificationsTabContent() {
	return (
		<TabsContent value="certifications" className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Certifications & Badges</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Display your professional credentials</Trans>
					</p>
				</div>
				<Button className="gap-2">
					<PlusIcon className="size-4" />
					<Trans>Add Certification</Trans>
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{SAMPLE_CERTIFICATIONS.map((cert, index) => (
					<motion.div key={cert.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
						<CometCard>
							<Card className="h-full overflow-hidden">
								<CardHeader className="relative bg-gradient-to-br from-card to-muted/30">
									<div className="absolute top-4 right-4">
										<cert.icon className={cn("size-10", cert.color)} weight="duotone" />
									</div>
									<Badge variant="outline" className="mb-2 w-fit">
										{cert.issuer}
									</Badge>
									<CardTitle className="text-lg">{cert.name}</CardTitle>
									<CardDescription className="flex items-center gap-1">
										<CalendarIcon className="size-3" />
										{cert.date}
										{cert.expiryDate && (
											<span className="text-muted-foreground">
												{" "}
												- <Trans>Expires</Trans> {cert.expiryDate}
											</span>
										)}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-4">
									{cert.credentialId && (
										<div className="mb-3 flex items-center gap-2 text-sm">
											<span className="text-muted-foreground">
												<Trans>Credential ID:</Trans>
											</span>
											<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{cert.credentialId}</code>
										</div>
									)}
									{cert.credentialUrl && (
										<Button variant="outline" size="sm" className="gap-2" asChild>
											<a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
												<LinkIcon className="size-4" />
												<Trans>Verify Credential</Trans>
											</a>
										</Button>
									)}
								</CardContent>
							</Card>
						</CometCard>
					</motion.div>
				))}
			</div>
		</TabsContent>
	);
}

// ─── Testimonials Tab Content ─────────────────────────────────────────────

export function TestimonialsTabContent() {
	return (
		<TabsContent value="testimonials" className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Testimonials & Recommendations</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>What others say about working with you</Trans>
					</p>
				</div>
				<Button className="gap-2">
					<PlusIcon className="size-4" />
					<Trans>Request Testimonial</Trans>
				</Button>
			</div>

			{/* Featured Testimonials */}
			<div className="grid gap-6 lg:grid-cols-2">
				{SAMPLE_TESTIMONIALS.filter((t) => t.featured).map((testimonial, index) => (
					<motion.div
						key={testimonial.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.15 }}
					>
						<Card className="relative h-full overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
							<div className="absolute top-4 right-4">
								<CrownIcon className="size-6 text-amber-500" weight="fill" />
							</div>
							<CardContent className="pt-6">
								<QuotesIcon className="mb-4 size-10 text-primary/30" weight="fill" />
								<p className="mb-6 text-lg italic leading-relaxed">"{testimonial.content}"</p>
								<div className="flex items-center gap-4">
									<Avatar size="lg">
										<AvatarImage src={testimonial.avatar} />
										<AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-semibold">{testimonial.author}</p>
										<p className="text-muted-foreground text-sm">
											{testimonial.role} at {testimonial.company}
										</p>
										<div className="mt-1 flex items-center gap-1">
											{Array.from({ length: 5 }).map((_, i) => (
												<StarIcon
													key={i}
													className={cn(
														"size-4",
														i < testimonial.rating ? "text-amber-500" : "text-muted-foreground/30",
													)}
													weight={i < testimonial.rating ? "fill" : "regular"}
												/>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* All Testimonials */}
			<div className="space-y-4">
				{SAMPLE_TESTIMONIALS.filter((t) => !t.featured).map((testimonial, index) => (
					<motion.div
						key={testimonial.id}
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card>
							<CardContent className="flex items-start gap-4 pt-6">
								<Avatar>
									<AvatarImage src={testimonial.avatar} />
									<AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="mb-2 flex items-center justify-between">
										<div>
											<p className="font-semibold">{testimonial.author}</p>
											<p className="text-muted-foreground text-sm">
												{testimonial.role} at {testimonial.company}
											</p>
										</div>
										<div className="flex items-center gap-1">
											{Array.from({ length: 5 }).map((_, i) => (
												<StarIcon
													key={i}
													className={cn(
														"size-4",
														i < testimonial.rating ? "text-amber-500" : "text-muted-foreground/30",
													)}
													weight={i < testimonial.rating ? "fill" : "regular"}
												/>
											))}
										</div>
									</div>
									<p className="text-muted-foreground">"{testimonial.content}"</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</TabsContent>
	);
}

// ─── Case Study Detail Dialog ─────────────────────────────────────────────

export function CaseStudyDetailDialog({
	open,
	onOpenChange,
	caseStudy,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	caseStudy: CaseStudy | null;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				{caseStudy && (
					<>
						<DialogHeader>
							<DialogTitle className="text-2xl">{caseStudy.title}</DialogTitle>
							<DialogDescription>
								{caseStudy.role} | {caseStudy.duration}
							</DialogDescription>
						</DialogHeader>
						<ScrollArea className="max-h-[60vh]">
							<div className="space-y-6 pr-4">
								{/* Overview */}
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										<Trans>Overview</Trans>
									</h4>
									<p className="text-muted-foreground">{caseStudy.overview}</p>
								</div>

								{/* Challenge */}
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										<Trans>The Challenge</Trans>
									</h4>
									<p className="text-muted-foreground">{caseStudy.challenge}</p>
								</div>

								{/* Solution */}
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										<Trans>The Solution</Trans>
									</h4>
									<p className="text-muted-foreground">{caseStudy.solution}</p>
								</div>

								{/* Process */}
								<div>
									<h4 className="mb-4 font-semibold text-lg">
										<Trans>Process</Trans>
									</h4>
									<div className="space-y-4">
										{caseStudy.process.map((step) => (
											<div key={step.step} className="flex gap-4">
												<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
													{step.step}
												</div>
												<div>
													<p className="font-semibold">{step.title}</p>
													<p className="text-muted-foreground text-sm">{step.description}</p>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Results */}
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										<Trans>Results</Trans>
									</h4>
									<p className="text-muted-foreground">{caseStudy.results}</p>
								</div>

								{/* Technologies */}
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										<Trans>Technologies</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{caseStudy.technologies.map((tech) => (
											<Badge key={tech} variant="secondary">
												{tech}
											</Badge>
										))}
									</div>
								</div>

								{/* Team */}
								{caseStudy.team && (
									<div>
										<h4 className="mb-2 font-semibold text-lg">
											<Trans>Team</Trans>
										</h4>
										<div className="flex flex-wrap gap-2">
											{caseStudy.team.map((member) => (
												<Badge key={member} variant="outline">
													<UserIcon className="mr-1 size-3" />
													{member}
												</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						</ScrollArea>
						<DialogFooter>
							<Button variant="outline" className="gap-2">
								<PencilSimpleIcon className="size-4" />
								<Trans>Edit Case Study</Trans>
							</Button>
							<Button className="gap-2">
								<DownloadSimpleIcon className="size-4" />
								<Trans>Export PDF</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
