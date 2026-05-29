import { Trans } from "@lingui/react/macro";
import { ArrowSquareOutIcon, BookOpenIcon, CalendarIcon, ClockIcon, StarIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
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
import { cn } from "@/utils/style";
import { CATEGORY_CONFIG } from "./gap-analysis-config";
import type { SkillGap, TargetRole } from "./gap-analysis-types";

// ─── Resources Tab ──────────────────────────────────────────────────────────────

interface ResourcesTabContentProps {
	selectedRole: TargetRole | undefined;
	skillGaps: SkillGap[];
}

export function ResourcesTabContent({ selectedRole, skillGaps }: ResourcesTabContentProps) {
	if (selectedRole && skillGaps.filter((g) => g.gapSize > 0).length > 0) {
		return (
			<>
				{skillGaps
					.filter((g) => g.gapSize > 0)
					.slice(0, 6)
					.map((gap) => {
						const config = CATEGORY_CONFIG[gap.category];
						const CategoryIcon = config.icon;

						return (
							<Card key={gap.skillName}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<div className={cn("rounded-lg p-1.5", config.color)}>
											<CategoryIcon className="size-4" />
										</div>
										<Trans>Resources for {gap.skillName}</Trans>
										<Badge
											variant="outline"
											className={cn(
												gap.importance === "critical" && "border-red-500 text-red-500",
												gap.importance === "important" && "border-amber-500 text-amber-500",
											)}
										>
											{gap.importance === "critical" && "Critical"}
											{gap.importance === "important" && "Important"}
											{gap.importance === "nice-to-have" && "Nice to have"}
										</Badge>
									</CardTitle>
									<CardDescription>
										<Trans>
											Current level: {gap.currentLevel}/5 | Required level: {gap.requiredLevel}/5 | Estimated time:{" "}
											{gap.timeToClose} weeks
										</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{gap.learningResources.map((resource) => (
											<Card key={resource.id} className="h-full transition-all hover:shadow-md">
												<CardContent className="p-4">
													<div className="mb-2 flex items-start justify-between">
														<Badge variant="secondary" className="text-xs">
															{resource.type === "course" && "Course"}
															{resource.type === "book" && "Book"}
															{resource.type === "certification" && "Certification"}
															{resource.type === "tutorial" && "Tutorial"}
															{resource.type === "practice" && "Practice"}
															{resource.type === "mentorship" && "Mentorship"}
														</Badge>
														<Badge
															variant="outline"
															className={cn(
																resource.cost === "free" && "border-green-500 text-green-500",
																resource.cost === "paid" && "border-amber-500 text-amber-500",
																resource.cost === "subscription" && "border-blue-500 text-blue-500",
															)}
														>
															{resource.cost === "free" && "Free"}
															{resource.cost === "paid" && "Paid"}
															{resource.cost === "subscription" && "Subscription"}
														</Badge>
													</div>
													<h4 className="mb-1 font-medium">{resource.title}</h4>
													<p className="mb-2 text-muted-foreground text-sm">{resource.platform}</p>
													<div className="flex items-center justify-between text-muted-foreground text-xs">
														<span>{resource.duration}</span>
														<div className="flex items-center gap-1">
															<StarIcon className="size-3 text-amber-500" weight="fill" />
															<span>{resource.rating}</span>
														</div>
													</div>
													{resource.url !== "#" && (
														<Button
															variant="outline"
															size="sm"
															className="mt-3 w-full gap-1"
															onClick={() => window.open(resource.url, "_blank")}
														>
															<ArrowSquareOutIcon className="size-3" />
															<Trans>Access</Trans>
														</Button>
													)}
												</CardContent>
											</Card>
										))}
									</div>
								</CardContent>
							</Card>
						);
					})}
			</>
		);
	}

	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<BookOpenIcon className="mb-4 size-12 text-muted-foreground/50" />
				<h3 className="mb-2 font-medium text-lg">
					<Trans>No Resources to Display</Trans>
				</h3>
				<p className="max-w-sm text-muted-foreground">
					{selectedRole ? (
						<Trans>Congratulations! You have all the required skills for this role.</Trans>
					) : (
						<Trans>Select a target role to see recommended learning resources.</Trans>
					)}
				</p>
			</CardContent>
		</Card>
	);
}

// ─── Resources Dialog ───────────────────────────────────────────────────────────

interface ResourcesDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedGap: SkillGap | null;
}

export function ResourcesDialog({ isOpen, onOpenChange, selectedGap }: ResourcesDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						<Trans>Resources for {selectedGap?.skillName}</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>
							Current level: {selectedGap?.currentLevel}/5 | Required level: {selectedGap?.requiredLevel}/5 | Estimated
							time: {selectedGap?.timeToClose} weeks
						</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-96 space-y-4 overflow-y-auto py-4">
					{selectedGap?.learningResources.map((resource) => (
						<Card key={resource.id} className="transition-all hover:shadow-md">
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0 flex-1">
										<div className="mb-2 flex items-center gap-2">
											<Badge variant="secondary">
												{resource.type === "course" && "Course"}
												{resource.type === "book" && "Book"}
												{resource.type === "certification" && "Certification"}
												{resource.type === "tutorial" && "Tutorial"}
												{resource.type === "practice" && "Practice"}
												{resource.type === "mentorship" && "Mentorship"}
											</Badge>
											<Badge
												variant="outline"
												className={cn(
													resource.difficulty === "beginner" && "border-green-500 text-green-500",
													resource.difficulty === "intermediate" && "border-amber-500 text-amber-500",
													resource.difficulty === "advanced" && "border-red-500 text-red-500",
												)}
											>
												{resource.difficulty === "beginner" && "Beginner"}
												{resource.difficulty === "intermediate" && "Intermediate"}
												{resource.difficulty === "advanced" && "Advanced"}
											</Badge>
										</div>
										<h4 className="font-medium">{resource.title}</h4>
										<p className="mt-1 text-muted-foreground text-sm">{resource.platform}</p>
										<div className="mt-2 flex items-center gap-4 text-muted-foreground text-xs">
											<span className="flex items-center gap-1">
												<ClockIcon className="size-3" />
												{resource.duration}
											</span>
											<span className="flex items-center gap-1">
												<StarIcon className="size-3 text-amber-500" weight="fill" />
												{resource.rating}
											</span>
											<Badge
												variant="outline"
												className={cn(
													resource.cost === "free" && "border-green-500 text-green-500",
													resource.cost === "paid" && "border-amber-500 text-amber-500",
													resource.cost === "subscription" && "border-blue-500 text-blue-500",
												)}
											>
												{resource.cost === "free" && "Free"}
												{resource.cost === "paid" && "Paid"}
												{resource.cost === "subscription" && "Subscription"}
											</Badge>
										</div>
									</div>
									{resource.url !== "#" && (
										<Button variant="outline" size="sm" onClick={() => window.open(resource.url, "_blank")}>
											<ArrowSquareOutIcon className="size-4" />
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Close</Trans>
						</Button>
					</DialogClose>
					<Link to={"/dashboard/career/study-plan" as string}>
						<Button className="gap-2">
							<CalendarIcon className="size-4" />
							<Trans>Create a Study Plan</Trans>
						</Button>
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
