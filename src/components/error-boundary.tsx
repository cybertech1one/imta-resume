import { Trans } from "@lingui/react/macro";
import { ArrowClockwiseIcon, WarningIcon } from "@phosphor-icons/react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

type ErrorBoundaryProps = {
	children: ReactNode;
	/** Optional custom fallback component */
	fallback?: ReactNode;
	/** Callback when an error is caught */
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	/** Optional section name for better error messages */
	section?: string;
};

type ErrorBoundaryState = {
	hasError: boolean;
	error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log error for debugging
		console.error("[ErrorBoundary] Caught error:", error);
		console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

		// Call optional error handler
		this.props.onError?.(error, errorInfo);
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default fallback UI
			return <ErrorFallback error={this.state.error} section={this.props.section} onReset={this.handleReset} />;
		}

		return this.props.children;
	}
}

type ErrorFallbackProps = {
	error: Error | null;
	section?: string;
	onReset: () => void;
};

function ErrorFallback({ error, section, onReset }: ErrorFallbackProps) {
	const sectionLabel = section ? ` in ${section}` : "";

	return (
		<div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-y-4 p-4">
			<Alert variant="destructive" className="max-w-md">
				<WarningIcon className="size-4" />
				<AlertTitle>
					<Trans>Something went wrong{sectionLabel}</Trans>
				</AlertTitle>
				<AlertDescription>
					{error?.message || <Trans>An unexpected error occurred. Please try again.</Trans>}
				</AlertDescription>
			</Alert>

			<Button variant="outline" onClick={onReset}>
				<ArrowClockwiseIcon />
				<Trans>Try Again</Trans>
			</Button>
		</div>
	);
}
