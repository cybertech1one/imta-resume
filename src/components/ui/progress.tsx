import type * as React from "react";
import { cn } from "@/utils/style";

type ProgressProps = React.ComponentProps<"div"> & {
	value?: number;
	max?: number;
	label?: string;
};

function Progress({ className, value = 0, max = 100, label, ...props }: ProgressProps) {
	const percentage = Math.round((value / max) * 100);

	return (
		<div
			data-slot="progress"
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
			aria-label={label}
			aria-valuetext={`${percentage}% complete`}
			className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
			{...props}
		>
			<div
				data-slot="progress-indicator"
				className="h-full bg-primary transition-all duration-300"
				style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
			/>
		</div>
	);
}

export { Progress };
