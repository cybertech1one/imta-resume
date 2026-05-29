import { FileTextIcon } from "@phosphor-icons/react";
import { cn } from "@/utils/style";

type Props = React.ComponentProps<"div"> & {
	variant?: "logo" | "icon";
};

export function BrandIcon({ variant = "logo", className, ...props }: Props) {
	return (
		<div
			className={cn(
				"relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-[oklch(0.40_0.12_170)] shadow-lg shadow-primary/20",
				variant === "logo" ? "size-12" : "size-10",
				className,
			)}
			{...props}
		>
			<FileTextIcon
				aria-hidden="true"
				className={cn("text-white", variant === "logo" ? "size-6" : "size-5")}
				weight="fill"
			/>
			{/* Gold accent dot */}
			<div className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[oklch(0.65_0.15_195)] ring-2 ring-background" />
		</div>
	);
}
