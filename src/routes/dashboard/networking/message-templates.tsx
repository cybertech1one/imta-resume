import { createFileRoute } from "@tanstack/react-router";
import { ErrorComponent } from "@/components/error-component";

import { MessageTemplatesPage } from "./-components/message-templates-components";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/networking/message-templates" as any)({
	component: MessageTemplatesPage,
	errorComponent: ErrorComponent,
});
