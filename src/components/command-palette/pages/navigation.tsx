import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	AddressBookIcon,
	BriefcaseIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	CompassIcon,
	DatabaseIcon,
	GearIcon,
	GraduationCapIcon,
	HouseSimpleIcon,
	KeyIcon,
	LightbulbIcon,
	OpenAiLogoIcon,
	QuestionIcon,
	ReadCvLogoIcon,
	ShieldCheckIcon,
	TargetIcon,
	TrendUpIcon,
	UserCircleIcon,
	UsersIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { CommandItem } from "@/components/ui/command";
import { useCommandPaletteStore } from "../store";
import { BaseCommandGroup } from "./base";

export function NavigationCommandGroup() {
	const navigate = useNavigate();
	const { session } = useRouteContext({ strict: false });
	const reset = useCommandPaletteStore((state) => state.reset);
	const pushPage = useCommandPaletteStore((state) => state.pushPage);

	function onNavigate(path: string) {
		navigate({ to: path });
		reset();
	}

	return (
		<>
			<BaseCommandGroup heading={<Trans>Go to...</Trans>}>
				<CommandItem keywords={[t`Home`]} value="navigation.home" onSelect={() => onNavigate("/")}>
					<HouseSimpleIcon />
					<Trans>Home</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Dashboard`]}
					value="navigation.dashboard"
					onSelect={() => onNavigate("/dashboard")}
				>
					<ChartLineUpIcon />
					<Trans>Dashboard</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Resumes`]}
					value="navigation.resumes"
					onSelect={() => onNavigate("/dashboard/resumes")}
				>
					<ReadCvLogoIcon />
					<Trans>Resumes</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Jobs`, t`Applications`, t`Job Applications`]}
					value="navigation.jobs"
					onSelect={() => pushPage("jobs")}
				>
					<BriefcaseIcon />
					<Trans>Jobs</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Career`, t`Skills`, t`Goals`]}
					value="navigation.career"
					onSelect={() => pushPage("career")}
				>
					<TrendUpIcon />
					<Trans>Career</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Interview`, t`Practice`, t`Preparation`]}
					value="navigation.interview"
					onSelect={() => pushPage("interview")}
				>
					<ChatsCircleIcon />
					<Trans>Interview</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Networking`, t`Contacts`]}
					value="navigation.networking"
					onSelect={() => pushPage("networking")}
				>
					<UsersIcon />
					<Trans>Networking</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Settings`]}
					value="navigation.settings"
					onSelect={() => pushPage("settings")}
				>
					<GearIcon />
					<Trans>Settings</Trans>
				</CommandItem>

				<CommandItem
					disabled={!session}
					keywords={[t`Help`, t`Support`, t`FAQ`]}
					value="navigation.help"
					onSelect={() => onNavigate("/dashboard/help")}
				>
					<QuestionIcon />
					<Trans>Help</Trans>
				</CommandItem>
			</BaseCommandGroup>

			{/* Jobs sub-menu */}
			<BaseCommandGroup page="jobs" heading={<Trans>Jobs</Trans>}>
				<CommandItem
					keywords={[t`Job Applications`, t`Applications`]}
					value="navigation.jobs.applications"
					onSelect={() => onNavigate("/dashboard/jobs/applications")}
				>
					<BriefcaseIcon />
					<Trans>Job Applications</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Job Search`, t`Find Jobs`]}
					value="navigation.jobs.search"
					onSelect={() => onNavigate("/dashboard/jobs/search")}
				>
					<CompassIcon />
					<Trans>Job Search</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Job Alerts`, t`Notifications`]}
					value="navigation.jobs.alerts"
					onSelect={() => onNavigate("/dashboard/jobs/alerts")}
				>
					<LightbulbIcon />
					<Trans>Job Alerts</Trans>
				</CommandItem>
			</BaseCommandGroup>

			{/* Career sub-menu */}
			<BaseCommandGroup page="career" heading={<Trans>Career</Trans>}>
				<CommandItem
					keywords={[t`Skills`]}
					value="navigation.career.skills"
					onSelect={() => onNavigate("/dashboard/career/skills")}
				>
					<TargetIcon />
					<Trans>Skills</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Assessment`, t`Career Assessment`]}
					value="navigation.career.assessment"
					onSelect={() => onNavigate("/dashboard/career/assessment")}
				>
					<CompassIcon />
					<Trans>Career Assessment</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Goals`]}
					value="navigation.career.goals"
					onSelect={() => onNavigate("/dashboard/career")}
				>
					<TrendUpIcon />
					<Trans>Career Goals</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Certifications`]}
					value="navigation.career.certifications"
					onSelect={() => onNavigate("/dashboard/career/certifications")}
				>
					<GraduationCapIcon />
					<Trans>Certifications</Trans>
				</CommandItem>
			</BaseCommandGroup>

			{/* Interview sub-menu */}
			<BaseCommandGroup page="interview" heading={<Trans>Interview</Trans>}>
				<CommandItem
					keywords={[t`Practice`, t`Mock Interview`]}
					value="navigation.interview.practice"
					onSelect={() => onNavigate("/dashboard/interview")}
				>
					<ChatsCircleIcon />
					<Trans>Practice Interview</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Preparation`, t`Checklist`]}
					value="navigation.interview.checklist"
					onSelect={() => onNavigate("/dashboard/interview/checklist")}
				>
					<LightbulbIcon />
					<Trans>Interview Checklist</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Question Bank`, t`Questions`]}
					value="navigation.interview.questions"
					onSelect={() => onNavigate("/dashboard/interview/questions")}
				>
					<QuestionIcon />
					<Trans>Question Bank</Trans>
				</CommandItem>
			</BaseCommandGroup>

			{/* Networking sub-menu */}
			<BaseCommandGroup page="networking" heading={<Trans>Networking</Trans>}>
				<CommandItem
					keywords={[t`Contacts`]}
					value="navigation.networking.contacts"
					onSelect={() => onNavigate("/dashboard/networking/contacts")}
				>
					<AddressBookIcon />
					<Trans>Contacts</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Events`]}
					value="navigation.networking.events"
					onSelect={() => onNavigate("/dashboard/networking/events")}
				>
					<UsersIcon />
					<Trans>Networking Events</Trans>
				</CommandItem>
			</BaseCommandGroup>

			<BaseCommandGroup page="settings" heading={<Trans>Settings</Trans>}>
				<CommandItem
					keywords={[t`Profile`]}
					value="navigation.settings.profile"
					onSelect={() => onNavigate("/dashboard/settings/profile")}
				>
					<UserCircleIcon />
					<Trans>Profile</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Preferences`]}
					value="navigation.settings.preferences"
					onSelect={() => onNavigate("/dashboard/settings/preferences")}
				>
					<GearIcon />
					<Trans>Preferences</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Authentication`]}
					value="navigation.settings.authentication"
					onSelect={() => onNavigate("/dashboard/settings/authentication")}
				>
					<ShieldCheckIcon />
					<Trans>Authentication</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`API Keys`]}
					value="navigation.settings.api-keys"
					onSelect={() => onNavigate("/dashboard/settings/api-keys")}
				>
					<KeyIcon />
					<Trans>API Keys</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Artificial Intelligence`]}
					value="navigation.settings.ai"
					onSelect={() => onNavigate("/dashboard/settings/ai")}
				>
					<OpenAiLogoIcon />
					<Trans>Artificial Intelligence</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Data`, t`Export`, t`Import`, t`Backup`]}
					value="navigation.settings.data"
					onSelect={() => onNavigate("/dashboard/settings/data")}
				>
					<DatabaseIcon />
					<Trans>Data Management</Trans>
				</CommandItem>

				<CommandItem
					keywords={[t`Danger Zone`]}
					value="navigation.settings.danger-zone"
					onSelect={() => onNavigate("/dashboard/settings/danger-zone")}
				>
					<WarningIcon />
					<Trans>Danger Zone</Trans>
				</CommandItem>
			</BaseCommandGroup>
		</>
	);
}
