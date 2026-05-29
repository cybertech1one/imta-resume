import { t } from "@lingui/core/macro";
import { SparkleIcon } from "@phosphor-icons/react";
import { cn } from "@/utils/style";

type AiDisclaimerProps = {
	className?: string;
	variant?: "badge" | "inline" | "footer";
};

export function AiDisclaimer({ className, variant = "badge" }: AiDisclaimerProps) {
	if (variant === "footer") {
		return (
			<p className={cn("text-muted-foreground/70 text-xs", className)}>
				<SparkleIcon className="mr-1 inline-block size-3" />
				{t`AI-generated content. Review for accuracy before use.`}
			</p>
		);
	}

	if (variant === "inline") {
		return (
			<span className={cn("inline-flex items-center gap-1 text-muted-foreground/70 text-xs", className)}>
				<SparkleIcon className="size-3" />
				{t`AI-generated`}
			</span>
		);
	}

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs",
				className,
			)}
		>
			<SparkleIcon className="size-3" weight="fill" />
			{t`AI`}
		</span>
	);
}
