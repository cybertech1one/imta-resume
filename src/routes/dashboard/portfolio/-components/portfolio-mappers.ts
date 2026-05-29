import type { RouterOutput } from "@/integrations/orpc/client";
import type { CaseStudy, Project } from "./portfolio-types";

// Backend types inferred from the router output
type BackendProject = RouterOutput["workSamples"]["listProjects"][number];
type BackendCaseStudy = RouterOutput["workSamples"]["listCaseStudies"][number];

// Map project type enum to a user-friendly category label
const TYPE_TO_CATEGORY: Record<string, string> = {
	web: "Web Development",
	mobile: "Mobile Development",
	design: "Design",
	backend: "Backend",
	fullstack: "Web Development",
	data: "Data",
	devops: "DevOps",
};

/**
 * Convert a backend workSampleProject row into the frontend Project shape
 * that the existing UI components expect.
 */
export function mapBackendProjectToFrontend(bp: BackendProject): Project {
	// Flatten technologies + skills into a single tags array
	const techNames = (bp.technologies ?? []).map((t) => t.name);
	const tags = [...techNames, ...(bp.skills ?? [])];
	// Remove duplicates
	const uniqueTags = [...new Set(tags)];

	// Convert link array [{type, url, label}] to the object shape {live?, github?, demo?, documentation?}
	const links: Project["links"] = {};
	for (const link of bp.links ?? []) {
		if (link.type === "live") links.live = link.url;
		else if (link.type === "github") links.github = link.url;
		else if (link.type === "demo") links.demo = link.url;
		else if (link.type === "documentation") links.documentation = link.url;
	}

	return {
		id: bp.id,
		title: bp.title,
		description: bp.description,
		longDescription: bp.longDescription || undefined,
		images: bp.images ?? [],
		thumbnail: bp.thumbnail ?? "",
		tags: uniqueTags,
		links,
		featured: bp.featured,
		category: TYPE_TO_CATEGORY[bp.type] ?? bp.type,
		date: bp.startDate ?? bp.createdAt.toISOString().slice(0, 10),
		status: bp.status,
		// The backend metrics use {label, value, change} arrays.
		// The frontend expects {views?, likes?, shares?}. Map if available.
		metrics: bp.metrics
			? (() => {
					const m: Project["metrics"] = {};
					for (const metric of bp.metrics) {
						const key = metric.label.toLowerCase();
						const num = Number.parseInt(metric.value, 10) || 0;
						if (key === "views") m.views = num;
						else if (key === "likes") m.likes = num;
						else if (key === "shares") m.shares = num;
					}
					return Object.keys(m).length > 0 ? m : undefined;
				})()
			: undefined,
	};
}

/**
 * Convert a backend workSampleCaseStudy row into the frontend CaseStudy shape.
 */
export function mapBackendCaseStudyToFrontend(bc: BackendCaseStudy): CaseStudy {
	// Map timeline phases to the frontend process steps
	const process = (bc.timeline ?? []).map((phase, index) => ({
		step: index + 1,
		title: phase.phase,
		description: phase.description,
	}));

	return {
		id: bc.id,
		projectId: bc.projectId,
		title: bc.title,
		overview: bc.overview,
		challenge: bc.challenge,
		solution: bc.solution,
		results: bc.results,
		process,
		technologies: bc.keyFeatures ?? [],
		duration: "",
		role: "",
	};
}
