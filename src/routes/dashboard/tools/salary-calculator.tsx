import { createFileRoute } from "@tanstack/react-router";
import { ErrorComponent } from "@/components/error-component";

import { SalaryCalculator } from "./-components/salary-calculator-components";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/salary-calculator" as any)({
	component: SalaryCalculator,
	errorComponent: ErrorComponent,
});
