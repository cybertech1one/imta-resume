import { CheckCircleIcon, InfoIcon, SpinnerIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import { useTheme } from "../theme/provider";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group print:hidden"
			position="bottom-right"
			expand={false}
			richColors
			closeButton
			duration={4000}
			icons={{
				success: <CheckCircleIcon className="size-5" weight="fill" />,
				info: <InfoIcon className="size-5" weight="fill" />,
				warning: <WarningIcon className="size-5" weight="fill" />,
				error: <XCircleIcon className="size-5" weight="fill" />,
				loading: <SpinnerIcon className="size-5 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "0.75rem",
					"--success-bg": "oklch(0.95 0.05 150)",
					"--success-text": "oklch(0.35 0.1 150)",
					"--success-border": "oklch(0.8 0.1 150)",
					"--error-bg": "oklch(0.95 0.05 25)",
					"--error-text": "oklch(0.35 0.15 25)",
					"--error-border": "oklch(0.8 0.1 25)",
					"--warning-bg": "oklch(0.95 0.08 195)",
					"--warning-text": "oklch(0.4 0.12 195)",
					"--warning-border": "oklch(0.8 0.1 195)",
					"--info-bg": "oklch(0.95 0.05 250)",
					"--info-text": "oklch(0.35 0.12 250)",
					"--info-border": "oklch(0.8 0.1 250)",
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: "cn-toast shadow-lg border-2 backdrop-blur-sm",
					content: "space-y-1",
					title: "font-semibold text-sm",
					description: "text-muted-foreground text-xs leading-relaxed",
					actionButton:
						"bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs px-3 py-1.5 rounded-md",
					cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80 font-medium text-xs px-3 py-1.5 rounded-md",
					closeButton: "bg-background border border-border hover:bg-muted transition-colors",
				},
			}}
			{...props}
		/>
	);
};

// Helper functions for consistent toast usage
const showToast = {
	success: (message: string, options?: Parameters<typeof toast.success>[1]) => toast.success(message, { ...options }),
	error: (message: string, options?: Parameters<typeof toast.error>[1]) => toast.error(message, { ...options }),
	warning: (message: string, options?: Parameters<typeof toast.warning>[1]) => toast.warning(message, { ...options }),
	info: (message: string, options?: Parameters<typeof toast.info>[1]) => toast.info(message, { ...options }),
	loading: (message: string, options?: Parameters<typeof toast.loading>[1]) => toast.loading(message, { ...options }),
	promise: <T,>(promise: Promise<T>, messages: Parameters<typeof toast.promise<T>>[1]) =>
		toast.promise(promise, messages),
	dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export { Toaster, showToast };
