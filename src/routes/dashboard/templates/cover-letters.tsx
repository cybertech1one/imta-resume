import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	ClipboardTextIcon,
	EnvelopeSimpleIcon,
	LightbulbIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "../-components/header";
import {
	DomainTabContent,
	EmptyState,
	FilterPills,
	HeroSection,
	TemplateGrid,
	TemplatePreviewDialog,
	TipsTabContent,
	TypeTabContent,
} from "./-components/cover-letters-components";
import { coverLetterTemplates } from "./-components/cover-letters-config";
import type { CoverLetterTemplate, DomainCategory, TypeCategory } from "./-components/cover-letters-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/templates/cover-letters" as any)({
	component: CoverLetterTemplatesPage,
	errorComponent: ErrorComponent,
});

function CoverLetterTemplatesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const [selectedDomain, setSelectedDomain] = useState<DomainCategory | "all">("all");
	const [selectedType, setSelectedType] = useState<TypeCategory | "all">("all");
	const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplate | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const filteredTemplates = coverLetterTemplates.filter((template) => {
		const matchesSearch =
			searchQuery === "" ||
			template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesDomain = selectedDomain === "all" || template.domain === selectedDomain;
		const matchesType = selectedType === "all" || template.type === selectedType;

		return matchesSearch && matchesDomain && matchesType;
	});

	const copyToClipboard = useCallback((content: string) => {
		navigator.clipboard.writeText(content);
		toast.success(t`Letter copied to clipboard`);
	}, []);

	const downloadAsTextFile = useCallback((template: CoverLetterTemplate) => {
		const blob = new Blob([template.content], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${template.id}-cover-letter.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		toast.success(t`Letter downloaded`);
	}, []);

	const openPreview = useCallback((template: CoverLetterTemplate) => {
		setSelectedTemplate(template);
		setIsPreviewOpen(true);
	}, []);

	return (
		<>
			<DashboardHeader icon={ClipboardTextIcon} title={t`Cover Letter Templates`} />

			<HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					<TabsTrigger
						value="all"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<SparkleIcon className="size-4" />
						<Trans>All templates</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="domain"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<BriefcaseIcon className="size-4" />
						<Trans>By domain</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="type"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<EnvelopeSimpleIcon className="size-4" />
						<Trans>By type</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="tips"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<LightbulbIcon className="size-4" />
						<Trans>Tips</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-8">
					<FilterPills
						selectedDomain={selectedDomain}
						selectedType={selectedType}
						searchQuery={searchQuery}
						onDomainChange={setSelectedDomain}
						onTypeChange={setSelectedType}
						onClearFilters={() => {
							setSelectedDomain("all");
							setSelectedType("all");
							setSearchQuery("");
						}}
					/>

					<p className="text-muted-foreground text-sm">
						{filteredTemplates.length} <Trans>template(s) found</Trans>
					</p>

					<TemplateGrid templates={filteredTemplates} onPreview={openPreview} onCopy={copyToClipboard} />

					{filteredTemplates.length === 0 && <EmptyState />}
				</TabsContent>

				<TabsContent value="domain" className="space-y-8">
					<DomainTabContent onPreview={openPreview} onCopy={copyToClipboard} />
				</TabsContent>

				<TabsContent value="type" className="space-y-8">
					<TypeTabContent onPreview={openPreview} onCopy={copyToClipboard} />
				</TabsContent>

				<TabsContent value="tips" className="space-y-10">
					<TipsTabContent onNavigateToAll={() => setActiveTab("all")} />
				</TabsContent>
			</Tabs>

			<TemplatePreviewDialog
				template={selectedTemplate}
				isOpen={isPreviewOpen}
				onOpenChange={setIsPreviewOpen}
				onCopy={copyToClipboard}
				onDownload={downloadAsTextFile}
			/>
		</>
	);
}
