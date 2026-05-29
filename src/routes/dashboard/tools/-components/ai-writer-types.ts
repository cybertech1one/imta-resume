import type { Icon } from "@phosphor-icons/react";

import type { AiWriterIndustry, AiWriterTone } from "@/integrations/drizzle/schema";

export interface ToneOption {
	value: AiWriterTone;
	label: string;
	description: string;
	icon: Icon;
}

export interface IndustryOption {
	value: AiWriterIndustry;
	label: string;
}

export interface ToolConfig {
	id: string;
	icon: Icon;
	title: string;
	description: string;
	gradient: string;
	iconBg: string;
	iconColor: string;
}

export interface IndustryTerms {
	keywords: string[];
	phrases: string[];
}
