import { Trans } from "@lingui/react/macro";
import { cn } from "@/utils/style";

type Props = React.ComponentProps<"div">;

export function Copyright({ className, ...props }: Props) {
	return (
		<div className={cn("text-muted-foreground/80 text-xs leading-relaxed", className)} {...props}>
			<p>&copy; {new Date().getFullYear()} IMTA Resume</p>

			<p className="mt-2">
				<Trans>
					Official resume builder for{" "}
					<a
						href="https://imta.ma"
						target="_blank"
						rel="noopener"
						className="font-medium underline underline-offset-2 hover:text-primary"
					>
						IMTA Trade School
					</a>
				</Trans>
			</p>

			<p className="mt-2">
				<Trans>Made with love in Morocco</Trans> 🇲🇦
			</p>

			<p className="mt-4 text-muted-foreground/60">v{__APP_VERSION__}</p>
		</div>
	);
}
