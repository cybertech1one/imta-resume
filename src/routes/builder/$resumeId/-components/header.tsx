import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	AddressBookIcon,
	CaretDownIcon,
	CopySimpleIcon,
	HouseSimpleIcon,
	LockSimpleIcon,
	LockSimpleOpenIcon,
	PencilSimpleLineIcon,
	QuestionIcon,
	SidebarSimpleIcon,
	TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialogStore } from "@/dialogs/store";
import { useConfirm } from "@/hooks/use-confirm";
import { orpc } from "@/integrations/orpc/client";
import { downloadVCard } from "@/utils/vcard";
import { useBuilderSidebar } from "../-store/sidebar";

export function BuilderHeader() {
	const name = useResumeStore((state) => state.resume.name);
	const isLocked = useResumeStore((state) => state.resume.isLocked);
	const { toggleSidebar, isCollapsed } = useBuilderSidebar((state) => ({
		toggleSidebar: state.toggleSidebar,
		isCollapsed: state.isCollapsed,
	}));

	const isLeftCollapsed = isCollapsed("left");
	const isRightCollapsed = isCollapsed("right");

	return (
		<header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between border-b bg-popover px-1.5">
			<Button
				size="icon"
				variant="ghost"
				onClick={() => toggleSidebar("left")}
				aria-label={isLeftCollapsed ? t`Expand left sidebar` : t`Collapse left sidebar`}
				aria-expanded={!isLeftCollapsed}
				aria-controls="left"
			>
				<SidebarSimpleIcon aria-hidden="true" />
			</Button>

			<nav className="flex items-center gap-x-1" aria-label={t`Resume navigation`}>
				<Button asChild size="icon" variant="ghost" aria-label={t`Go to dashboard`}>
					<Link to="/dashboard/resumes" search={{ sort: "lastUpdatedAt", tags: [] }}>
						<HouseSimpleIcon aria-hidden="true" />
					</Link>
				</Button>
				<span className="me-2.5 text-muted-foreground" aria-hidden="true">
					/
				</span>
				<h1 className="flex-1 truncate font-medium">{name}</h1>
				{isLocked && <LockSimpleIcon className="ms-2 text-muted-foreground" aria-label={t`Resume is locked`} />}
				<BuilderHeaderDropdown />
				<Button asChild size="icon" variant="ghost" aria-label={t`Help Center`}>
					{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
					<Link to={"/dashboard/help" as any}>
						<QuestionIcon aria-hidden="true" />
					</Link>
				</Button>
			</nav>

			<Button
				size="icon"
				variant="ghost"
				onClick={() => toggleSidebar("right")}
				aria-label={isRightCollapsed ? t`Expand right sidebar` : t`Collapse right sidebar`}
				aria-expanded={!isRightCollapsed}
				aria-controls="right"
			>
				<SidebarSimpleIcon className="-scale-x-100" aria-hidden="true" />
			</Button>
		</header>
	);
}

function BuilderHeaderDropdown() {
	const confirm = useConfirm();
	const navigate = useNavigate();
	const { openDialog } = useDialogStore();

	const id = useResumeStore((state) => state.resume.id);
	const name = useResumeStore((state) => state.resume.name);
	const slug = useResumeStore((state) => state.resume.slug);
	const tags = useResumeStore((state) => state.resume.tags);
	const isLocked = useResumeStore((state) => state.resume.isLocked);
	const resumeData = useResumeStore((state) => state.resume.data);

	const { mutate: deleteResume } = useMutation(orpc.resume.delete.mutationOptions());
	const { mutate: setLockedResume } = useMutation(orpc.resume.setLocked.mutationOptions());

	const handleUpdate = () => {
		openDialog("resume.update", { id, name, slug, tags });
	};

	const handleDuplicate = () => {
		openDialog("resume.duplicate", { id, name, slug, tags, shouldRedirect: true });
	};

	const handleDownloadVCard = () => {
		downloadVCard(resumeData, name);
		toast.success(t`vCard downloaded successfully.`);
	};

	const handleToggleLock = async () => {
		if (!isLocked) {
			const confirmation = await confirm(t`Are you sure you want to lock this resume?`, {
				description: t`When locked, the resume cannot be updated or deleted.`,
			});

			if (!confirmation) return;
		}

		setLockedResume(
			{ id, isLocked: !isLocked },
			{
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	const handleDelete = async () => {
		const confirmation = await confirm(t`Are you sure you want to delete this resume?`, {
			description: t`This action cannot be undone.`,
		});

		if (!confirmation) return;

		const toastId = toast.loading(t`Deleting your resume...`);

		deleteResume(
			{ id },
			{
				onSuccess: () => {
					toast.success(t`Your resume has been deleted successfully.`, { id: toastId });
					navigate({ to: "/dashboard/resumes", search: { sort: "lastUpdatedAt", tags: [] } });
				},
				onError: (error) => {
					toast.error(error.message, { id: toastId });
				},
			},
		);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="ghost" aria-label={t`Resume actions menu`}>
					<CaretDownIcon aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem disabled={isLocked} onSelect={handleUpdate}>
					<PencilSimpleLineIcon className="me-2" />
					<Trans>Update</Trans>
				</DropdownMenuItem>

				<DropdownMenuItem onSelect={handleDuplicate}>
					<CopySimpleIcon className="me-2" />
					<Trans>Duplicate</Trans>
				</DropdownMenuItem>

				<DropdownMenuItem onSelect={handleDownloadVCard}>
					<AddressBookIcon className="me-2" />
					<Trans>Download vCard</Trans>
				</DropdownMenuItem>

				<DropdownMenuItem onSelect={handleToggleLock}>
					{isLocked ? <LockSimpleOpenIcon className="me-2" /> : <LockSimpleIcon className="me-2" />}
					{isLocked ? <Trans>Unlock</Trans> : <Trans>Lock</Trans>}
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem variant="destructive" disabled={isLocked} onSelect={handleDelete}>
					<TrashSimpleIcon className="me-2" />
					<Trans>Delete</Trans>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
