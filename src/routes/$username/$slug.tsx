import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ErrorComponent } from "@/components/error-component";

export const Route = createFileRoute("/$username/$slug")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function RouteComponent() {
	return <Outlet />;
}
