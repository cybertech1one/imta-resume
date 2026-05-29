import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";

const checkUserIsAdmin = createServerFn({ method: "GET" })
	.inputValidator(z.string())
	.handler(async ({ data: userId }) => {
		const { db } = await import("@/integrations/drizzle/client");
		const { user } = await import("@/integrations/drizzle/schema");

		const [userRecord] = await db.select({ role: user.role }).from(user).where(eq(user.id, userId)).limit(1);

		return userRecord?.role === "admin";
	});

export const Route = createFileRoute("/dashboard/admin")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	beforeLoad: async ({ context }) => {
		if (!context.session) {
			throw redirect({ to: "/auth/login", replace: true });
		}

		// Check if user is admin
		const isAdmin = await checkUserIsAdmin({ data: context.session.user.id });

		if (!isAdmin) {
			throw redirect({ to: "/dashboard/resumes", replace: true });
		}

		return { session: context.session, isAdmin: true };
	},
});

function RouteComponent() {
	return <Outlet />;
}
