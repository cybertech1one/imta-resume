import { sanitizeUrl } from "@/utils/sanitize";
import { cn } from "@/utils/style";

type Props = {
	url: string;
	label?: string;
	className?: string;
};

export function PageLink({ url, label, className }: Props) {
	if (!url) return null;

	return (
		<a
			href={sanitizeUrl(url)}
			target="_blank"
			rel="noopener noreferrer"
			className={cn("inline-block text-wrap break-all", className)}
		>
			{label || url}
		</a>
	);
}
