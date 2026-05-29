import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	ClockIcon,
	DotsThreeVerticalIcon,
	FunnelIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	PlusIcon,
	StarIcon,
	TrashIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { categoryConfig, strengthConfig } from "./networking-config";
import type { ConnectionStrength, Contact, Reminder } from "./networking-types";

// ============================================================================
// ConnectionStrengthIndicator (internal helper)
// ============================================================================

function ConnectionStrengthIndicator({ strength }: { strength: ConnectionStrength }) {
	const config = strengthConfig[strength];
	const percentage = strength === "strong" ? 100 : strength === "moderate" ? 66 : strength === "weak" ? 33 : 10;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex items-center gap-2">
					<Progress
						value={percentage}
						className={cn(
							"h-2 w-16",
							strength === "strong" && "[&>div]:bg-green-500",
							strength === "moderate" && "[&>div]:bg-blue-500",
							strength === "weak" && "[&>div]:bg-amber-500",
							strength === "new" && "[&>div]:bg-gray-400",
						)}
					/>
					<span className="text-muted-foreground text-xs">{config.label}</span>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<Trans>Connection Strength: {config.label}</Trans>
			</TooltipContent>
		</Tooltip>
	);
}

// ============================================================================
// ContactsTab
// ============================================================================

interface ContactsTabProps {
	filteredContacts: Contact[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	categoryFilter: string;
	setCategoryFilter: (filter: string) => void;
	strengthFilter: string;
	setStrengthFilter: (filter: string) => void;
	showFavoritesOnly: boolean;
	setShowFavoritesOnly: (show: boolean) => void;
	hasActiveFilters: boolean;
	clearFilters: () => void;
	getContactReminders: (contactId: string) => Reminder[];
	openContactDetail: (contact: Contact) => void;
	openEditContact: (contact: Contact) => void;
	handleToggleFavorite: (contactId: string) => void;
	handleDeleteContact: (contactId: string) => void;
	onAddContact: () => void;
}

export function ContactsTab({
	filteredContacts,
	searchQuery,
	setSearchQuery,
	categoryFilter,
	setCategoryFilter,
	strengthFilter,
	setStrengthFilter,
	showFavoritesOnly,
	setShowFavoritesOnly,
	hasActiveFilters,
	clearFilters,
	getContactReminders,
	openContactDetail,
	openEditContact,
	handleToggleFavorite,
	handleDeleteContact,
	onAddContact,
}: ContactsTabProps) {
	return (
		<div className="space-y-6">
			{/* Filters */}
			<section className="rounded-xl border bg-muted/30 p-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-center">
					<div className="flex items-center gap-2">
						<FunnelIcon className="size-5 text-muted-foreground" />
						<span className="font-medium text-sm">
							<Trans>Filter:</Trans>
						</span>
					</div>

					<div className="flex flex-1 flex-col gap-3 md:flex-row">
						{/* Search */}
						<div className="relative flex-1">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={t`Search contacts, companies, tags...`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Category Filter */}
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-full md:w-44">
								<SelectValue placeholder={t`Category`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Categories`}</SelectItem>
								{Object.entries(categoryConfig).map(([key, { label, icon: Icon }]) => (
									<SelectItem key={key} value={key}>
										<div className="flex items-center gap-2">
											<Icon className="size-4" />
											{label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Strength Filter */}
						<Select value={strengthFilter} onValueChange={setStrengthFilter}>
							<SelectTrigger className="w-full md:w-44">
								<SelectValue placeholder={t`Connection`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Strengths`}</SelectItem>
								{Object.entries(strengthConfig).map(([key, { label }]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Favorites Toggle */}
						<Button
							variant={showFavoritesOnly ? "default" : "outline"}
							size="sm"
							className="gap-2"
							onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
						>
							<StarIcon className="size-4" weight={showFavoritesOnly ? "fill" : "regular"} />
							<Trans>Favorites</Trans>
						</Button>
					</div>

					{hasActiveFilters && (
						<Button variant="ghost" size="sm" className="gap-1" onClick={clearFilters}>
							<XIcon className="size-4" />
							<Trans>Clear</Trans>
						</Button>
					)}
				</div>
			</section>

			{/* Results count */}
			<p className="text-muted-foreground text-sm">
				{filteredContacts.length} <Trans>contacts found</Trans>
			</p>

			{/* Contacts Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence mode="popLayout">
					{filteredContacts.map((contact, index) => {
						const category = categoryConfig[contact.category];
						const CategoryIcon = category.icon;
						const contactReminders = getContactReminders(contact.id);

						return (
							<motion.div
								key={contact.id}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.02 }}
								layout
							>
								<Card
									className="group h-full cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
									onClick={() => openContactDetail(contact)}
								>
									<CardContent className="p-4">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-3">
												<div
													className={cn(
														"flex size-12 shrink-0 items-center justify-center rounded-full",
														category.color,
													)}
												>
													<span className="font-semibold text-lg">
														{contact.firstName[0]}
														{contact.lastName[0]}
													</span>
												</div>
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<h4 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">
															{contact.firstName} {contact.lastName}
														</h4>
														{contact.isFavorite && <StarIcon className="size-4 text-amber-500" weight="fill" />}
													</div>
													<p className="line-clamp-1 text-muted-foreground text-sm">{contact.jobTitle}</p>
													<p className="line-clamp-1 text-muted-foreground text-sm">{contact.company}</p>
												</div>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="size-8 p-0 opacity-0 group-hover:opacity-100"
														onClick={(e) => e.stopPropagation()}
													>
														<DotsThreeVerticalIcon className="size-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															openEditContact(contact);
														}}
													>
														<PencilSimpleIcon className="mr-2 size-4" />
														<Trans>Edit</Trans>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															handleToggleFavorite(contact.id);
														}}
													>
														<StarIcon className="mr-2 size-4" weight={contact.isFavorite ? "fill" : "regular"} />
														{contact.isFavorite ? <Trans>Remove Favorite</Trans> : <Trans>Add to Favorites</Trans>}
													</DropdownMenuItem>
													{contact.linkedinUrl && (
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																window.open(contact.linkedinUrl, "_blank");
															}}
														>
															<LinkedinLogoIcon className="mr-2 size-4" />
															<Trans>View LinkedIn</Trans>
														</DropdownMenuItem>
													)}
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteContact(contact.id);
														}}
													>
														<TrashIcon className="mr-2 size-4" />
														<Trans>Delete</Trans>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										<div className="mt-4 space-y-3">
											{/* Connection Strength */}
											<ConnectionStrengthIndicator strength={contact.connectionStrength} />

											{/* Category Badge */}
											<div className="flex items-center gap-2">
												<Badge className={cn("gap-1", category.color)}>
													<CategoryIcon className="size-3" />
													{category.label}
												</Badge>
												{contactReminders.length > 0 && (
													<Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
														<BellIcon className="size-3" />
														{contactReminders.length}
													</Badge>
												)}
											</div>

											{/* Tags */}
											{contact.tags.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{contact.tags.slice(0, 3).map((tag) => (
														<Badge key={tag} variant="outline" className="text-xs">
															{tag}
														</Badge>
													))}
													{contact.tags.length > 3 && (
														<Badge variant="outline" className="text-xs">
															+{contact.tags.length - 3}
														</Badge>
													)}
												</div>
											)}

											{/* Last Contacted */}
											{contact.lastContactedAt && (
												<p className="text-muted-foreground text-xs">
													<ClockIcon className="mr-1 inline size-3" />
													Last contact: {new Date(contact.lastContactedAt).toLocaleDateString()}
												</p>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>

			{filteredContacts.length === 0 && (
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center justify-center py-16 text-center"
				>
					<UsersIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
					{hasActiveFilters ? (
						<>
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>No contacts match your filters</Trans>
							</h3>
							<p className="mb-6 max-w-sm text-muted-foreground text-sm">
								<Trans>Try adjusting your search criteria or clearing the filters to see all your contacts.</Trans>
							</p>
							<Button variant="outline" onClick={clearFilters}>
								<XIcon className="mr-2 size-4" />
								<Trans>Clear filters</Trans>
							</Button>
						</>
					) : (
						<>
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>No contacts yet</Trans>
							</h3>
							<p className="mb-6 max-w-sm text-muted-foreground text-sm">
								<Trans>Start building your professional network by adding your first contact.</Trans>
							</p>
							<Button onClick={onAddContact}>
								<PlusIcon className="mr-2 size-4" />
								<Trans>Add Contact</Trans>
							</Button>
						</>
					)}
				</motion.div>
			)}
		</div>
	);
}
