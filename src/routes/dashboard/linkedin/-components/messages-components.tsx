import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckCircleIcon,
	CopyIcon,
	EnvelopeSimpleIcon,
	FloppyDiskIcon,
	PaperPlaneRightIcon,
	PlusIcon,
	SpinnerIcon,
	StarIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { FORMALITY_OPTIONS, LANGUAGES, MESSAGE_TYPES } from "./messages-config";
import type { MessageFormality, MessageType } from "./messages-types";

export function StatsCards({
	totalCount,
	sentCount,
	favoriteCount,
	onNewMessage,
}: {
	totalCount: number;
	sentCount: number;
	favoriteCount: number;
	onNewMessage: () => void;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
							<EnvelopeSimpleIcon className="size-5 text-blue-500" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Total Messages</Trans>
							</p>
							<p className="font-bold text-xl">{totalCount}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
							<PaperPlaneRightIcon className="size-5 text-green-500" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Sent</Trans>
							</p>
							<p className="font-bold text-xl">{sentCount}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
							<StarIcon className="size-5 text-amber-500" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Favorites</Trans>
							</p>
							<p className="font-bold text-xl">{favoriteCount}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<Button onClick={onNewMessage} className="w-full gap-2">
						<PlusIcon className="size-4" />
						<Trans>New Message</Trans>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export function MessageTypeSelector({
	messageType,
	onSelect,
}: {
	messageType: MessageType;
	onSelect: (type: MessageType) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Message Type</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Choose the type of message to write</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{MESSAGE_TYPES.map((type) => (
					<button
						key={type.value}
						type="button"
						onClick={() => onSelect(type.value)}
						className={cn(
							"flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
							messageType === type.value ? "border-primary bg-primary/5" : "hover:bg-accent/50",
						)}
					>
						<div
							className={cn(
								"flex size-10 items-center justify-center rounded-lg",
								messageType === type.value ? "bg-primary text-primary-foreground" : "bg-muted",
							)}
						>
							{type.icon}
						</div>
						<div>
							<p className="font-medium text-sm">{type.label}</p>
							<p className="text-muted-foreground text-xs">{type.description}</p>
						</div>
					</button>
				))}
			</CardContent>
		</Card>
	);
}

export function RecipientSettingsCard({
	recipientName,
	recipientRole,
	recipientCompany,
	context,
	formality,
	language,
	onRecipientNameChange,
	onRecipientRoleChange,
	onRecipientCompanyChange,
	onContextChange,
	onFormalityChange,
	onLanguageChange,
}: {
	recipientName: string;
	recipientRole: string;
	recipientCompany: string;
	context: string;
	formality: MessageFormality;
	language: string;
	onRecipientNameChange: (v: string) => void;
	onRecipientRoleChange: (v: string) => void;
	onRecipientCompanyChange: (v: string) => void;
	onContextChange: (v: string) => void;
	onFormalityChange: (v: MessageFormality) => void;
	onLanguageChange: (v: string) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Recipient & Settings</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Recipient name</Trans>
						</Label>
						<Input
							value={recipientName}
							onChange={(e) => onRecipientNameChange(e.target.value)}
							placeholder={t`e.g. Jane Smith`}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Position</Trans>
						</Label>
						<Input
							value={recipientRole}
							onChange={(e) => onRecipientRoleChange(e.target.value)}
							placeholder={t`e.g. HR Director`}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Company</Trans>
					</Label>
					<Input
						value={recipientCompany}
						onChange={(e) => onRecipientCompanyChange(e.target.value)}
						placeholder={t`e.g. Google`}
					/>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Context</Trans>
					</Label>
					<Input
						value={context}
						onChange={(e) => onContextChange(e.target.value)}
						placeholder={t`e.g. Met at the IMTA job fair`}
					/>
				</div>

				<Separator />

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Formality level</Trans>
						</Label>
						<Select value={formality} onValueChange={(v) => onFormalityChange(v as MessageFormality)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FORMALITY_OPTIONS.map((f) => (
									<SelectItem key={f.value} value={f.value}>
										{f.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Language</Trans>
						</Label>
						<Select value={language} onValueChange={onLanguageChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{LANGUAGES.map((l) => (
									<SelectItem key={l.value} value={l.value}>
										{l.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function MessageEditor({
	content,
	onContentChange,
	onReset,
	onSave,
	isPending,
}: {
	content: string;
	onContentChange: (v: string) => void;
	onReset: () => void;
	onSave: () => void;
	isPending: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<EnvelopeSimpleIcon className="size-5" />
					<Trans>Message Content</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Textarea
					value={content}
					onChange={(e) => onContentChange(e.target.value)}
					placeholder={t`Write your message here...`}
					className="min-h-[200px]"
				/>
				<div className="flex items-center justify-between">
					<p className="text-muted-foreground text-sm">{content.length} / 300</p>
					<div className="flex gap-2">
						<Button variant="outline" onClick={onReset}>
							<Trans>Reset</Trans>
						</Button>
						<Button onClick={onSave} disabled={!content || isPending}>
							{isPending ? (
								<SpinnerIcon className="mr-2 size-4 animate-spin" />
							) : (
								<FloppyDiskIcon className="mr-2 size-4" />
							)}
							<Trans>Save</Trans>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function MessageLoadingSkeleton({ count }: { count: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }, (_, i) => i + 1).map((i) => (
				<Card key={i}>
					<CardContent className="pt-6">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 space-y-3">
								<div className="flex gap-2">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-5 w-32" />
								</div>
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-4 w-28" />
							</div>
							<div className="flex gap-2">
								<Skeleton className="size-8" />
								<Skeleton className="size-8" />
								<Skeleton className="size-8" />
								<Skeleton className="size-8" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function SentMessageLoadingSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2].map((i) => (
				<Card key={i}>
					<CardContent className="pt-6">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 space-y-3">
								<div className="flex gap-2">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-5 w-32" />
								</div>
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-4 w-28" />
							</div>
							<Skeleton className="size-8" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function DraftsTab({
	isLoading,
	draftMessages,
	getTypeConfig,
	copyToClipboard,
	updateMessageMutation,
	deleteMessageMutation,
	onCreateClick,
}: {
	isLoading: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC query result type
	draftMessages: any[];
	getTypeConfig: (type: MessageType) => {
		value: MessageType;
		label: string;
		icon: React.ReactNode;
		description: string;
	};
	copyToClipboard: (text: string) => void;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC mutation result type
	updateMessageMutation: UseMutationResult<any, any, { id: string; isSent?: boolean; isFavorite?: boolean }>;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC mutation result type
	deleteMessageMutation: UseMutationResult<any, any, string>;
	onCreateClick: () => void;
}) {
	if (isLoading) {
		return <MessageLoadingSkeleton count={3} />;
	}

	if (draftMessages.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<EnvelopeSimpleIcon className="size-12 text-muted-foreground" />
					<p className="mt-4 text-muted-foreground">
						<Trans>No drafts yet</Trans>
					</p>
					<Button className="mt-4" onClick={onCreateClick}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Create a message</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{draftMessages.map((message) => {
				const typeConfig = getTypeConfig(message.messageType as MessageType);
				return (
					<motion.div key={message.id} initial={false} animate={{ opacity: 1, y: 0 }}>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="mb-2 flex items-center gap-2">
											<Badge variant="outline">{typeConfig.label}</Badge>
											{message.recipientName && <span className="font-medium text-sm">{message.recipientName}</span>}
											{message.recipientCompany && (
												<span className="text-muted-foreground text-sm">@ {message.recipientCompany}</span>
											)}
										</div>
										<p className="whitespace-pre-wrap text-sm">{message.content}</p>
										<p className="mt-2 text-muted-foreground text-xs">
											<Trans>Created on</Trans> {new Date(message.createdAt).toLocaleDateString("fr-FR")}
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											size="icon"
											variant="ghost"
											onClick={() => copyToClipboard(message.content)}
											aria-label={t`Copy message`}
										>
											<CopyIcon className="size-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											aria-label={message.isFavorite ? t`Remove from favorites` : t`Add to favorites`}
											onClick={() =>
												updateMessageMutation.mutate({
													id: message.id,
													isFavorite: !message.isFavorite,
												})
											}
										>
											<StarIcon className={cn("size-4", message.isFavorite && "fill-amber-500 text-amber-500")} />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											aria-label={t`Mark as sent`}
											onClick={() =>
												updateMessageMutation.mutate({
													id: message.id,
													isSent: true,
												})
											}
										>
											<CheckCircleIcon className="size-4 text-green-500" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											aria-label={t`Delete message`}
											onClick={() => deleteMessageMutation.mutate(message.id)}
										>
											<TrashIcon className="size-4 text-destructive" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

export function SentTab({
	isLoading,
	sentMessages,
	getTypeConfig,
	copyToClipboard,
}: {
	isLoading: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC query result type
	sentMessages: any[];
	getTypeConfig: (type: MessageType) => {
		value: MessageType;
		label: string;
		icon: React.ReactNode;
		description: string;
	};
	copyToClipboard: (text: string) => void;
}) {
	if (isLoading) {
		return <SentMessageLoadingSkeleton />;
	}

	if (sentMessages.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<PaperPlaneRightIcon className="size-12 text-muted-foreground" />
					<p className="mt-4 text-muted-foreground">
						<Trans>No messages sent yet</Trans>
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{sentMessages.map((message) => {
				const typeConfig = getTypeConfig(message.messageType as MessageType);
				return (
					<motion.div key={message.id} initial={false} animate={{ opacity: 1, y: 0 }}>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="mb-2 flex items-center gap-2">
											<Badge variant="default" className="bg-green-500">
												<CheckCircleIcon className="mr-1 size-3" />
												<Trans>Sent</Trans>
											</Badge>
											<Badge variant="outline">{typeConfig.label}</Badge>
											{message.recipientName && <span className="font-medium text-sm">{message.recipientName}</span>}
										</div>
										<p className="whitespace-pre-wrap text-sm">{message.content}</p>
										<p className="mt-2 text-muted-foreground text-xs">
											<Trans>Sent on</Trans>{" "}
											{message.sentAt
												? new Date(message.sentAt).toLocaleDateString("fr-FR")
												: new Date(message.createdAt).toLocaleDateString("fr-FR")}
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											size="icon"
											variant="ghost"
											onClick={() => copyToClipboard(message.content)}
											aria-label={t`Copy message`}
										>
											<CopyIcon className="size-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

export function TemplatesTab({ onSelectType }: { onSelectType: (type: MessageType) => void }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Message Templates</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Use these templates as a starting point for your messages</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 sm:grid-cols-2">
					{MESSAGE_TYPES.map((type) => (
						<Card key={type.value} className="cursor-pointer hover:bg-accent/50">
							<CardContent className="pt-6">
								<div className="mb-3 flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-muted">{type.icon}</div>
									<div>
										<h4 className="font-medium">{type.label}</h4>
										<p className="text-muted-foreground text-xs">{type.description}</p>
									</div>
								</div>
								<Button variant="outline" size="sm" className="w-full" onClick={() => onSelectType(type.value)}>
									<Trans>Use this template</Trans>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function NewMessageDialog({
	open,
	onOpenChange,
	messageType,
	formality,
	language,
	recipientName,
	recipientCompany,
	content,
	onMessageTypeChange,
	onFormalityChange,
	onLanguageChange,
	onRecipientNameChange,
	onRecipientCompanyChange,
	onContentChange,
	onSave,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	messageType: MessageType;
	formality: MessageFormality;
	language: string;
	recipientName: string;
	recipientCompany: string;
	content: string;
	onMessageTypeChange: (v: MessageType) => void;
	onFormalityChange: (v: MessageFormality) => void;
	onLanguageChange: (v: string) => void;
	onRecipientNameChange: (v: string) => void;
	onRecipientCompanyChange: (v: string) => void;
	onContentChange: (v: string) => void;
	onSave: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						<Trans>New Networking Message</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Create a personalized message for your network</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-3">
						<div className="space-y-2">
							<Label>
								<Trans>Type</Trans>
							</Label>
							<Select value={messageType} onValueChange={(v) => onMessageTypeChange(v as MessageType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{MESSAGE_TYPES.map((t) => (
										<SelectItem key={t.value} value={t.value}>
											{t.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Formality</Trans>
							</Label>
							<Select value={formality} onValueChange={(v) => onFormalityChange(v as MessageFormality)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{FORMALITY_OPTIONS.map((f) => (
										<SelectItem key={f.value} value={f.value}>
											{f.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Language</Trans>
							</Label>
							<Select value={language} onValueChange={onLanguageChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{LANGUAGES.map((l) => (
										<SelectItem key={l.value} value={l.value}>
											{l.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Recipient</Trans>
							</Label>
							<Input
								value={recipientName}
								onChange={(e) => onRecipientNameChange(e.target.value)}
								placeholder={t`Recipient name`}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Company</Trans>
							</Label>
							<Input
								value={recipientCompany}
								onChange={(e) => onRecipientCompanyChange(e.target.value)}
								placeholder={t`Company`}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Message</Trans>
						</Label>
						<Textarea
							value={content}
							onChange={(e) => onContentChange(e.target.value)}
							placeholder={t`Write your message here...`}
							className="min-h-[150px]"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSave} disabled={!content || isPending}>
						{isPending ? (
							<SpinnerIcon className="mr-2 size-4 animate-spin" />
						) : (
							<FloppyDiskIcon className="mr-2 size-4" />
						)}
						<Trans>Save</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
