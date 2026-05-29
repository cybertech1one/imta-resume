import { Trans } from "@lingui/react/macro";
import { InfoIcon, SparkleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AIAnalysisPanel } from "@/components/ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { orpc } from "@/integrations/orpc/client";
import { SectionBase } from "../shared/section-base";

export function AIAnalysisSectionBuilder() {
	const [isOpen, setIsOpen] = useState(false);
	const { data: aiStatus, isLoading: isStatusLoading } = useQuery(orpc.aiConfig.status.check.queryOptions());

	const isConfigured = aiStatus?.available ?? false;

	return (
		<SectionBase type="ai-analysis">
			<div className="space-y-4">
				<Alert>
					<SparkleIcon className="size-4" />
					<AlertTitle>
						<Trans>AI-Powered Resume Analysis</Trans>
					</AlertTitle>
					<AlertDescription>
						<Trans>
							Get comprehensive feedback on your resume including SWOT analysis, ATS compatibility score, and Morocco
							job market fit assessment designed for IMTA students.
						</Trans>
					</AlertDescription>
				</Alert>

				{!isConfigured && !isStatusLoading ? (
					<Alert variant="destructive">
						<InfoIcon className="size-4" />
						<AlertTitle>
							<Trans>AI Not Available</Trans>
						</AlertTitle>
						<AlertDescription>
							<Trans>AI features are not currently available. Please contact your administrator.</Trans>
						</AlertDescription>
					</Alert>
				) : null}

				<div className="flex flex-col gap-2">
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button disabled={!isConfigured && !isStatusLoading} className="w-full gap-2">
								<SparkleIcon className="size-4" />
								<Trans>Open AI Analysis</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
							<DialogHeader className="sr-only">
								<DialogTitle>
									<Trans>AI Resume Analysis</Trans>
								</DialogTitle>
								<DialogDescription>
									<Trans>Get comprehensive AI-powered feedback on your resume</Trans>
								</DialogDescription>
							</DialogHeader>
							<AIAnalysisPanel language="en" onClose={() => setIsOpen(false)} />
						</DialogContent>
					</Dialog>
				</div>

				{/* Features list */}
				<div className="rounded-lg border bg-muted/50 p-4">
					<h4 className="mb-3 font-medium text-sm">
						<Trans>Analysis includes:</Trans>
					</h4>
					<ul className="space-y-2 text-muted-foreground text-sm">
						<li className="flex items-center gap-2">
							<span className="size-1.5 rounded-full bg-green-500" />
							<Trans>SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)</Trans>
						</li>
						<li className="flex items-center gap-2">
							<span className="size-1.5 rounded-full bg-blue-500" />
							<Trans>ATS (Applicant Tracking System) compatibility score</Trans>
						</li>
						<li className="flex items-center gap-2">
							<span className="size-1.5 rounded-full bg-purple-500" />
							<Trans>Morocco job market fit assessment</Trans>
						</li>
						<li className="flex items-center gap-2">
							<span className="size-1.5 rounded-full bg-amber-500" />
							<Trans>Section-by-section improvement suggestions</Trans>
						</li>
						<li className="flex items-center gap-2">
							<span className="size-1.5 rounded-full bg-red-500" />
							<Trans>Quick fixes you can apply immediately</Trans>
						</li>
					</ul>
				</div>

				{/* Morocco-specific note */}
				<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
					<h4 className="mb-2 flex items-center gap-2 font-medium text-sm">
						<span>Designed for IMTA Students</span>
					</h4>
					<p className="text-muted-foreground text-xs">
						<Trans>
							Our analysis is specifically tailored for the Moroccan job market, considering French language
							requirements, photo expectations, certification preferences, and local hiring practices.
						</Trans>
					</p>
				</div>
			</div>
		</SectionBase>
	);
}
