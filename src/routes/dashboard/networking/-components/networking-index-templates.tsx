import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, CopyIcon, DotsThreeVerticalIcon, EnvelopeIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { templateCategoryConfig } from "./networking-config";
import type { EmailTemplate } from "./networking-types";

// ============================================================================
// TemplatesTab
// ============================================================================

interface TemplatesTabProps {
	templates: EmailTemplate[];
	copyTemplateToClipboard: (template: EmailTemplate) => void;
	onViewTemplate: (template: EmailTemplate) => void;
}

export function TemplatesTab({ templates, copyTemplateToClipboard, onViewTemplate }: TemplatesTabProps) {
	return (
		<div className="space-y-6">
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<EnvelopeIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Email Templates for Outreach</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{templates.map((template, index) => {
					const categoryConf = templateCategoryConfig[template.category];

					return (
						<motion.div
							key={template.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card className="group h-full transition-all hover:shadow-md">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<Badge className={categoryConf.color}>{categoryConf.label}</Badge>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm" className="size-8 p-0">
													<DotsThreeVerticalIcon className="size-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => copyTemplateToClipboard(template)}>
													<CopyIcon className="mr-2 size-4" />
													<Trans>Copy to Clipboard</Trans>
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => onViewTemplate(template)}>
													<ArrowRightIcon className="mr-2 size-4" />
													<Trans>View Full Template</Trans>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<CardTitle className="text-lg">{template.name}</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<p className="mb-2 font-medium text-muted-foreground text-sm">
										<Trans>Subject:</Trans>
									</p>
									<p className="mb-4 line-clamp-1 text-sm">{template.subject}</p>
									<p className="line-clamp-3 text-muted-foreground text-sm">{template.body}</p>
								</CardContent>
								<CardFooter className="pt-2">
									<Button variant="outline" className="w-full gap-2" onClick={() => onViewTemplate(template)}>
										<ArrowRightIcon className="size-4" />
										<Trans>Use Template</Trans>
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
