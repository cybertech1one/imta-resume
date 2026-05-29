import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowClockwiseIcon, BugIcon, HouseIcon, WarningIcon } from "@phosphor-icons/react";
import { Component, type ReactNode } from "react";
import { addBreadcrumb, captureException } from "@/utils/error-tracking";
import { Button } from "./button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
	variant?: "default" | "minimal" | "card" | "inline";
	showDetails?: boolean;
	/** Optional component name for better error tracking context */
	componentName?: string;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({ errorInfo });

		// Call optional error handler (for logging)
		this.props.onError?.(error, errorInfo);

		// Capture error in error tracking system
		captureException(error, {
			componentName: this.props.componentName || "Unknown",
			componentStack: errorInfo.componentStack || undefined,
			variant: this.props.variant || "default",
		});

		// Add breadcrumb for error trail
		addBreadcrumb("error", "ErrorBoundary caught an error", {
			errorMessage: error.message,
			componentName: this.props.componentName,
		});

		// Log to console in development
		if (process.env.NODE_ENV === "development") {
			console.error("ErrorBoundary caught an error:", error, errorInfo);
		}
	}

	handleReset = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	handleReload = () => {
		window.location.reload();
	};

	handleGoHome = () => {
		window.location.href = "/dashboard";
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const { variant = "default", showDetails = false } = this.props;

			// Minimal variant - just a small message
			if (variant === "minimal") {
				return (
					<div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-destructive text-sm">
						<WarningIcon className="size-4" />
						<span>
							<Trans>Something went wrong</Trans>
						</span>
						<Button size="sm" variant="ghost" onClick={this.handleReset}>
							<ArrowClockwiseIcon className="size-3" />
						</Button>
					</div>
				);
			}

			// Inline variant - for components in a flow
			if (variant === "inline") {
				return (
					<div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 border-dashed bg-destructive/5 p-4 text-center">
						<WarningIcon className="mb-2 size-6 text-destructive" />
						<p className="font-medium text-destructive text-sm">
							<Trans>This section encountered an error</Trans>
						</p>
						<p className="mt-1 text-muted-foreground text-xs">{this.state.error?.message}</p>
						<Button size="sm" variant="outline" onClick={this.handleReset} className="mt-3">
							<ArrowClockwiseIcon className="mr-1 size-3" />
							<Trans>Try again</Trans>
						</Button>
					</div>
				);
			}

			// Card variant - for dashboard sections
			if (variant === "card") {
				return (
					<Card className="border-destructive/50">
						<CardHeader>
							<div className="flex items-center gap-2">
								<WarningIcon className="size-5 text-destructive" />
								<CardTitle className="text-destructive">
									<Trans>Error Loading Content</Trans>
								</CardTitle>
							</div>
							<CardDescription>{this.state.error?.message || t`An unexpected error occurred`}</CardDescription>
						</CardHeader>
						<CardFooter className="gap-2">
							<Button variant="outline" onClick={this.handleReset}>
								<ArrowClockwiseIcon className="mr-2 size-4" />
								<Trans>Retry</Trans>
							</Button>
						</CardFooter>
					</Card>
				);
			}

			// Default variant - full page error
			return (
				<div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
					<div className="mb-6 rounded-full bg-destructive/10 p-4">
						<BugIcon className="size-12 text-destructive" />
					</div>
					<h2 className="font-semibold text-2xl">
						<Trans>Oops! Something went wrong</Trans>
					</h2>
					<p className="mt-2 max-w-md text-muted-foreground">
						<Trans>
							We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or go back to
							the dashboard.
						</Trans>
					</p>

					{showDetails && this.state.error && (
						<details className="mt-4 w-full max-w-lg text-left">
							<summary className="cursor-pointer text-muted-foreground text-sm hover:text-foreground">
								<Trans>Technical details</Trans>
							</summary>
							<pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs">
								{this.state.error.message}
								{this.state.errorInfo?.componentStack && (
									<>
										{"\n\nComponent Stack:"}
										{this.state.errorInfo.componentStack}
									</>
								)}
							</pre>
						</details>
					)}

					<div className="mt-6 flex gap-3">
						<Button variant="outline" onClick={this.handleReset}>
							<ArrowClockwiseIcon className="mr-2 size-4" />
							<Trans>Try again</Trans>
						</Button>
						<Button variant="outline" onClick={this.handleReload}>
							<Trans>Refresh page</Trans>
						</Button>
						<Button onClick={this.handleGoHome}>
							<HouseIcon className="mr-2 size-4" />
							<Trans>Go to Dashboard</Trans>
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Convenience wrapper for AI features
export function AIErrorBoundary({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary
			variant="inline"
			fallback={
				<div className="flex flex-col items-center justify-center rounded-lg border border-purple-300 border-dashed bg-purple-50 p-4 text-center dark:border-purple-800 dark:bg-purple-950/30">
					<WarningIcon className="mb-2 size-6 text-purple-600 dark:text-purple-400" />
					<p className="font-medium text-purple-700 text-sm dark:text-purple-300">
						<Trans>AI feature temporarily unavailable</Trans>
					</p>
					<p className="mt-1 text-muted-foreground text-xs">
						<Trans>Please try again or contact support if the issue persists</Trans>
					</p>
				</div>
			}
		>
			{children}
		</ErrorBoundary>
	);
}

// Convenience wrapper for form sections
export function FormSectionErrorBoundary({ children }: { children: ReactNode }) {
	return <ErrorBoundary variant="card">{children}</ErrorBoundary>;
}

// Convenience wrapper for dashboard cards
export function DashboardCardErrorBoundary({ children }: { children: ReactNode }) {
	return <ErrorBoundary variant="inline">{children}</ErrorBoundary>;
}
