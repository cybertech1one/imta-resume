import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	CodeBlockIcon,
	CodeSimpleIcon,
	ColumnsPlusLeftIcon,
	ColumnsPlusRightIcon,
	HighlighterCircleIcon,
	KeyReturnIcon,
	LinkBreakIcon,
	LinkIcon,
	ListBulletsIcon,
	ListNumbersIcon,
	MinusIcon,
	ParagraphIcon,
	PlusIcon,
	RowsPlusBottomIcon,
	RowsPlusTopIcon,
	SparkleIcon,
	SpinnerIcon,
	StopIcon,
	TableIcon,
	TextAaIcon,
	TextAlignCenterIcon,
	TextAlignJustifyIcon,
	TextAlignLeftIcon,
	TextAlignRightIcon,
	TextBolderIcon,
	TextHFiveIcon,
	TextHFourIcon,
	TextHOneIcon,
	TextHSixIcon,
	TextHThreeIcon,
	TextHTwoIcon,
	TextIndentIcon,
	TextItalicIcon,
	TextOutdentIcon,
	TextStrikethroughIcon,
	TextUnderlineIcon,
	TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Highlight from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import {
	type Editor,
	EditorContent,
	EditorContext,
	type UseEditorOptions,
	useEditor,
	useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { debounce } from "es-toolkit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePrompt } from "@/hooks/use-prompt";
import { stripMarkdownFences } from "@/integrations/ai/sanitize";
import { client, orpc } from "@/integrations/orpc/client";
import { isRTL } from "@/utils/locale";
import { sanitizeHtml } from "@/utils/sanitize";
import { cn } from "@/utils/style";
import { Toggle } from "../ui/toggle";
import styles from "./rich-input.module.css";

const extensions = [
	StarterKit.configure({
		heading: {
			levels: [1, 2, 3, 4, 5, 6],
		},
		codeBlock: {
			enableTabIndentation: true,
		},
		link: {
			openOnClick: false,
			enableClickSelection: true,
			defaultProtocol: "https",
			protocols: ["http", "https"],
		},
	}),
	Highlight.configure({
		HTMLAttributes: {
			class: "rounded-md px-0.5 py-px",
		},
	}),
	TextAlign.configure({ types: ["heading", "paragraph", "listItem"] }),
	TableKit.configure(),
];

type Props = UseEditorOptions & {
	value: string;
	onChange: (value: string) => void;
	style?: React.CSSProperties;
	className?: string;
	editorClassName?: string;
	aiContext?: string;
};

export function RichInput({ value, onChange, style, className, editorClassName, aiContext, ...options }: Props) {
	const { i18n } = useLingui();
	const textDirection = isRTL(i18n.locale) ? "rtl" : undefined;
	const isInternalUpdate = useRef(false);

	// Debounce onChange to prevent excessive re-renders during typing
	// 150ms provides a good balance between responsiveness and performance
	const debouncedOnChange = useMemo(() => debounce((html: string) => onChange(html), 150), [onChange]);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedOnChange.cancel();
		};
	}, [debouncedOnChange]);

	const editor = useEditor({
		...options,
		extensions,
		textDirection,
		content: value,
		immediatelyRender: false,
		shouldRerenderOnTransaction: false,
		editorProps: {
			attributes: {
				spellcheck: "false",
				"data-editor": "true",
				class: cn(
					"group/editor",
					"max-h-[400px] min-h-[100px] overflow-y-auto p-3 pb-0",
					"rounded-md rounded-t-none border outline-none focus-visible:border-ring",
					"[td:has(.selectedCell)]:bg-primary",
					styles.tiptap_content,
					styles.editor_content,
					editorClassName,
				),
			},
		},
		onUpdate: ({ editor }) => {
			isInternalUpdate.current = true;
			debouncedOnChange(editor.getHTML());
		},
	});

	// Sync external value changes (e.g., from AI generation) to the editor
	useEffect(() => {
		if (!editor) return;
		if (isInternalUpdate.current) {
			isInternalUpdate.current = false;
			return;
		}
		const currentContent = editor.getHTML();
		if (value !== currentContent) {
			editor.commands.setContent(value, { emitUpdate: false });
		}
	}, [editor, value]);

	const providerValue = useMemo(() => ({ editor }), [editor]);

	if (!editor) return null;

	return (
		<EditorContext value={providerValue}>
			<div className={cn("rounded-md", className)} style={style}>
				<EditorToolbar editor={editor} aiContext={aiContext} language={i18n.locale} />
				<EditorContent editor={editor} />
			</div>
		</EditorContext>
	);
}

function EditorToolbar({ editor, aiContext, language }: { editor: Editor; aiContext?: string; language?: string }) {
	const prompt = usePrompt();
	const [isAIStreaming, setIsAIStreaming] = useState(false);
	const [aiStreamedContent, setAIStreamedContent] = useState("");
	const aiAbortControllerRef = useRef<AbortController | null>(null);
	const [isGrammarStreaming, setIsGrammarStreaming] = useState(false);
	const [grammarStreamedContent, setGrammarStreamedContent] = useState("");
	const grammarAbortControllerRef = useRef<AbortController | null>(null);
	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());

	const aiImproveMutation = useMutation({
		mutationFn: async () => {
			const content = editor.getHTML();
			if (!content.trim() || content === "<p></p>") {
				throw new Error(t`Aucun contenu à améliorer`);
			}

			aiAbortControllerRef.current = new AbortController();
			setIsAIStreaming(true);
			setAIStreamedContent("");

			let fullContent = "";

			const stream = await client.ai.improveContent({
				content,
				context: aiContext,
				language: language || "en",
			});

			for await (const chunk of stream) {
				if (aiAbortControllerRef.current?.signal.aborted) break;
				if (typeof chunk === "string") fullContent += chunk;
				setAIStreamedContent(fullContent);
			}

			return fullContent;
		},
		onSuccess: (improvedContent) => {
			editor.commands.setContent(stripMarkdownFences(improvedContent));
			setIsAIStreaming(false);
			setAIStreamedContent("");
			toast.success(t`Contenu amélioré avec l'IA`);
		},
		onError: (error) => {
			setIsAIStreaming(false);
			setAIStreamedContent("");
			if (error.name !== "AbortError") {
				toast.error(error.message || t`Impossible d'améliorer le contenu`);
			}
		},
	});

	const handleAIStop = useCallback(() => {
		aiAbortControllerRef.current?.abort();
		setIsAIStreaming(false);
		if (aiStreamedContent) {
			editor.commands.setContent(aiStreamedContent);
		}
	}, [aiStreamedContent, editor]);

	const fixGrammarMutation = useMutation({
		mutationFn: async () => {
			const content = editor.getHTML();
			if (!content.trim() || content === "<p></p>") {
				throw new Error(t`Aucun contenu à corriger`);
			}

			grammarAbortControllerRef.current = new AbortController();
			setIsGrammarStreaming(true);
			setGrammarStreamedContent("");

			let fullContent = "";

			const stream = await client.ai.fixGrammar({
				content,
				language: language || "en",
			});

			for await (const chunk of stream) {
				if (grammarAbortControllerRef.current?.signal.aborted) break;
				if (typeof chunk === "string") fullContent += chunk;
				setGrammarStreamedContent(fullContent);
			}

			return fullContent;
		},
		onSuccess: (fixedContent) => {
			editor.commands.setContent(stripMarkdownFences(fixedContent));
			setIsGrammarStreaming(false);
			setGrammarStreamedContent("");
			toast.success(t`Grammaire corrigée avec l'IA`);
		},
		onError: (error) => {
			setIsGrammarStreaming(false);
			setGrammarStreamedContent("");
			if (error.name !== "AbortError") {
				toast.error(error.message || t`Impossible de corriger la grammaire`);
			}
		},
	});

	const handleGrammarStop = useCallback(() => {
		grammarAbortControllerRef.current?.abort();
		setIsGrammarStreaming(false);
		if (grammarStreamedContent) {
			editor.commands.setContent(grammarStreamedContent);
		}
	}, [grammarStreamedContent, editor]);

	const state = useEditorState({
		editor,
		selector: (ctx) => {
			return {
				// Bold
				isBold: ctx.editor.isActive("bold") ?? false,
				canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
				toggleBold: () => ctx.editor.chain().focus().toggleBold().run(),

				// Italic
				isItalic: ctx.editor.isActive("italic") ?? false,
				canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
				toggleItalic: () => ctx.editor.chain().focus().toggleItalic().run(),

				// Underline
				isUnderline: ctx.editor.isActive("underline") ?? false,
				canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
				toggleUnderline: () => ctx.editor.chain().focus().toggleUnderline().run(),

				// Strike
				isStrike: ctx.editor.isActive("strike") ?? false,
				canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
				toggleStrike: () => ctx.editor.chain().focus().toggleStrike().run(),

				// Highlight
				isHighlight: ctx.editor.isActive("highlight") ?? false,
				canHighlight: ctx.editor.can().chain().toggleHighlight().run() ?? false,
				toggleHighlight: () => ctx.editor.chain().focus().toggleHighlight().run(),

				// Heading 1
				isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
				canHeading1: ctx.editor.can().chain().toggleHeading({ level: 1 }).run() ?? false,
				toggleHeading1: () => ctx.editor.chain().focus().toggleHeading({ level: 1 }).run(),

				// Heading 2
				isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
				canHeading2: ctx.editor.can().chain().toggleHeading({ level: 2 }).run() ?? false,
				toggleHeading2: () => ctx.editor.chain().focus().toggleHeading({ level: 2 }).run(),

				// Heading 3
				isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
				canHeading3: ctx.editor.can().chain().toggleHeading({ level: 3 }).run() ?? false,
				toggleHeading3: () => ctx.editor.chain().focus().toggleHeading({ level: 3 }).run(),

				// Heading 4
				isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
				canHeading4: ctx.editor.can().chain().toggleHeading({ level: 4 }).run() ?? false,
				toggleHeading4: () => ctx.editor.chain().focus().toggleHeading({ level: 4 }).run(),

				// Heading 5
				isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
				canHeading5: ctx.editor.can().chain().toggleHeading({ level: 5 }).run() ?? false,
				toggleHeading5: () => ctx.editor.chain().focus().toggleHeading({ level: 5 }).run(),

				// Heading 6
				isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
				canHeading6: ctx.editor.can().chain().toggleHeading({ level: 6 }).run() ?? false,
				toggleHeading6: () => ctx.editor.chain().focus().toggleHeading({ level: 6 }).run(),

				// Paragraph
				isParagraph: ctx.editor.isActive("paragraph") ?? false,
				canParagraph: ctx.editor.can().chain().setParagraph().run() ?? false,
				setParagraph: () => ctx.editor.chain().focus().setParagraph().run(),

				// Left Align
				isLeftAlign: ctx.editor.isActive({ textAlign: "left" }) ?? false,
				canLeftAlign: ctx.editor.can().chain().toggleTextAlign("left").run() ?? false,
				toggleLeftAlign: () => ctx.editor.chain().focus().toggleTextAlign("left").run(),

				// Center Align
				isCenterAlign: ctx.editor.isActive({ textAlign: "center" }) ?? false,
				canCenterAlign: ctx.editor.can().chain().toggleTextAlign("center").run() ?? false,
				toggleCenterAlign: () => ctx.editor.chain().focus().toggleTextAlign("center").run(),

				// Right Align
				isRightAlign: ctx.editor.isActive({ textAlign: "right" }) ?? false,
				canRightAlign: ctx.editor.can().chain().toggleTextAlign("right").run() ?? false,
				toggleRightAlign: () => ctx.editor.chain().focus().toggleTextAlign("right").run(),

				// Justify Align
				isJustifyAlign: ctx.editor.isActive({ textAlign: "justify" }) ?? false,
				canJustifyAlign: ctx.editor.can().chain().toggleTextAlign("justify").run() ?? false,
				toggleJustifyAlign: () => ctx.editor.chain().focus().toggleTextAlign("justify").run(),

				// Bullet List
				isBulletList: ctx.editor.isActive("bulletList") ?? false,
				canBulletList: ctx.editor.can().chain().toggleBulletList().run() ?? false,
				toggleBulletList: () => ctx.editor.chain().focus().toggleBulletList().run(),

				// Ordered List
				isOrderedList: ctx.editor.isActive("orderedList") ?? false,
				canOrderedList: ctx.editor.can().chain().toggleOrderedList().run() ?? false,
				toggleOrderedList: () => ctx.editor.chain().focus().toggleOrderedList().run(),

				// Outdent List Item
				canLiftListItem: ctx.editor.can().chain().liftListItem("listItem").run() ?? false,
				liftListItem: () => ctx.editor.chain().focus().liftListItem("listItem").run(),

				// Indent List Item
				canSinkListItem: ctx.editor.can().chain().sinkListItem("listItem").run() ?? false,
				sinkListItem: () => ctx.editor.chain().focus().sinkListItem("listItem").run(),

				// Link
				isLink: ctx.editor.isActive("link") ?? false,
				setLink: async () => {
					const url = await prompt(t`Saisissez l'URL à associer :`, {
						defaultValue: "https://",
					});

					if (!url || url.trim() === "") {
						ctx.editor.chain().focus().unsetLink().run();
						return;
					}

					if (!z.url({ protocol: /^https?$/ }).safeParse(url).success) {
						toast.error(t`L'URL saisie n'est pas valide.`, {
							description: t`Les URL valides doivent commencer par http:// ou https://.`,
						});
						return;
					}

					ctx.editor.chain().focus().setLink({ href: url, target: "_blank", rel: "noopener nofollow" }).run();
				},
				unsetLink: () => ctx.editor.chain().focus().unsetLink().run(),

				// Inline Code
				isInlineCode: ctx.editor.isActive("code") ?? false,
				canInlineCode: ctx.editor.can().chain().toggleCode().run() ?? false,
				toggleInlineCode: () => ctx.editor.chain().focus().toggleCode().run(),

				// Code Block
				isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
				canCodeBlock: ctx.editor.can().chain().toggleCodeBlock().run() ?? false,
				toggleCodeBlock: () => ctx.editor.chain().focus().toggleCodeBlock().run(),

				// Table
				insertTable: () => ctx.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
				canInsertTable: ctx.editor.can().chain().insertTable().run() ?? false,
				addColumnBefore: () => ctx.editor.chain().focus().addColumnBefore().run(),
				canAddColumnBefore: ctx.editor.can().chain().addColumnBefore().run() ?? false,
				addColumnAfter: () => ctx.editor.chain().focus().addColumnAfter().run(),
				canAddColumnAfter: ctx.editor.can().chain().addColumnAfter().run() ?? false,
				addRowBefore: () => ctx.editor.chain().focus().addRowBefore().run(),
				canAddRowBefore: ctx.editor.can().chain().addRowBefore().run() ?? false,
				addRowAfter: () => ctx.editor.chain().focus().addRowAfter().run(),
				canAddRowAfter: ctx.editor.can().chain().addRowAfter().run() ?? false,
				deleteColumn: () => ctx.editor.chain().focus().deleteColumn().run(),
				canDeleteColumn: ctx.editor.can().chain().deleteColumn().run() ?? false,
				deleteRow: () => ctx.editor.chain().focus().deleteRow().run(),
				canDeleteRow: ctx.editor.can().chain().deleteRow().run() ?? false,
				deleteTable: () => ctx.editor.chain().focus().deleteTable().run(),
				canDeleteTable: ctx.editor.can().chain().deleteTable().run() ?? false,

				// Hard Break
				setHardBreak: () => ctx.editor.chain().focus().setHardBreak().run(),

				// Horizontal Rule
				setHorizontalRule: () => ctx.editor.chain().focus().setHorizontalRule().run(),
			};
		},
	});

	return (
		<div
			role="toolbar"
			aria-label={t`Barre de mise en forme du texte`}
			className="flex flex-wrap items-center gap-y-0.5 rounded-md rounded-b-none border border-b-0"
		>
			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Gras`}
				aria-label={t`Gras`}
				pressed={state.isBold}
				disabled={!state.canBold}
				onPressedChange={state.toggleBold}
			>
				<TextBolderIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Italique`}
				aria-label={t`Italique`}
				pressed={state.isItalic}
				disabled={!state.canItalic}
				onPressedChange={state.toggleItalic}
			>
				<TextItalicIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Souligner`}
				aria-label={t`Souligner`}
				pressed={state.isUnderline}
				disabled={!state.canUnderline}
				onPressedChange={state.toggleUnderline}
			>
				<TextUnderlineIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Barré`}
				aria-label={t`Barré`}
				pressed={state.isStrike}
				disabled={!state.canStrike}
				onPressedChange={state.toggleStrike}
			>
				<TextStrikethroughIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Surligner`}
				aria-label={t`Surligner`}
				pressed={state.isHighlight}
				disabled={!state.canHighlight}
				onPressedChange={state.toggleHighlight}
			>
				<HighlighterCircleIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="sm" tabIndex={-1} variant="ghost" className="rounded-none" aria-label={t`Style du texte`}>
						{match(state)
							.with({ isParagraph: true }, () => <ParagraphIcon className="size-3.5" aria-hidden="true" />)
							.with({ isHeading1: true }, () => <TextHOneIcon className="size-3.5" aria-hidden="true" />)
							.with({ isHeading2: true }, () => <TextHTwoIcon className="size-3.5" aria-hidden="true" />)
							.with({ isHeading3: true }, () => <TextHThreeIcon className="size-3.5" aria-hidden="true" />)
							.with({ isHeading4: true }, () => <TextHFourIcon className="size-3.5" aria-hidden="true" />)
							.with({ isHeading5: true }, () => <TextHFiveIcon className="size-3.5" aria-hidden="true" />)
							.with({ isHeading6: true }, () => <TextHSixIcon className="size-3.5" aria-hidden="true" />)
							.otherwise(() => (
								<ParagraphIcon className="size-3.5" aria-hidden="true" />
							))}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuCheckboxItem
						disabled={!state.canParagraph}
						checked={state.isParagraph}
						onCheckedChange={state.setParagraph}
					>
						<Trans>Paragraphe</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuSeparator />
					<DropdownMenuCheckboxItem
						disabled={!state.canHeading1}
						checked={state.isHeading1}
						onCheckedChange={state.toggleHeading1}
					>
						<Trans>Titre 1</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canHeading2}
						checked={state.isHeading2}
						onCheckedChange={state.toggleHeading2}
					>
						<Trans>Titre 2</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canHeading3}
						checked={state.isHeading3}
						onCheckedChange={state.toggleHeading3}
					>
						<Trans>Titre 3</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canHeading4}
						checked={state.isHeading4}
						onCheckedChange={state.toggleHeading4}
					>
						<Trans>Titre 4</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canHeading5}
						checked={state.isHeading5}
						onCheckedChange={state.toggleHeading5}
					>
						<Trans>Titre 5</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canHeading6}
						checked={state.isHeading6}
						onCheckedChange={state.toggleHeading6}
					>
						<Trans>Titre 6</Trans>
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="sm" tabIndex={-1} variant="ghost" className="rounded-none" aria-label={t`Alignement du texte`}>
						{match(state)
							.with({ isLeftAlign: true }, () => <TextAlignLeftIcon className="size-3.5" aria-hidden="true" />)
							.with({ isCenterAlign: true }, () => <TextAlignCenterIcon className="size-3.5" aria-hidden="true" />)
							.with({ isRightAlign: true }, () => <TextAlignRightIcon className="size-3.5" aria-hidden="true" />)
							.with({ isJustifyAlign: true }, () => <TextAlignJustifyIcon className="size-3.5" aria-hidden="true" />)
							.otherwise(() => (
								<TextAlignLeftIcon className="size-3.5" aria-hidden="true" />
							))}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuCheckboxItem
						disabled={!state.canLeftAlign}
						checked={state.isLeftAlign}
						onCheckedChange={state.toggleLeftAlign}
					>
						<Trans>Aligner à gauche</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canCenterAlign}
						checked={state.isCenterAlign}
						onCheckedChange={state.toggleCenterAlign}
					>
						<Trans>Centrer</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canRightAlign}
						checked={state.isRightAlign}
						onCheckedChange={state.toggleRightAlign}
					>
						<Trans>Aligner à droite</Trans>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						disabled={!state.canJustifyAlign}
						checked={state.isJustifyAlign}
						onCheckedChange={state.toggleJustifyAlign}
					>
						<Trans>Justifier</Trans>
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Liste à puces`}
				aria-label={t`Liste à puces`}
				pressed={state.isBulletList}
				disabled={!state.canBulletList}
				onPressedChange={state.toggleBulletList}
			>
				<ListBulletsIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Liste numérotée`}
				aria-label={t`Liste numérotée`}
				pressed={state.isOrderedList}
				disabled={!state.canOrderedList}
				onPressedChange={state.toggleOrderedList}
			>
				<ListNumbersIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<Button
				size="sm"
				tabIndex={-1}
				variant="ghost"
				className="rounded-none"
				title={t`Réduire le retrait`}
				aria-label={t`Réduire le retrait`}
				disabled={!state.canLiftListItem}
				onClick={state.liftListItem}
			>
				<TextOutdentIcon className="size-3.5" aria-hidden="true" />
			</Button>

			<Button
				size="sm"
				tabIndex={-1}
				variant="ghost"
				className="rounded-none"
				title={t`Augmenter le retrait`}
				aria-label={t`Augmenter le retrait`}
				disabled={!state.canSinkListItem}
				onClick={state.sinkListItem}
			>
				<TextIndentIcon className="size-3.5" aria-hidden="true" />
			</Button>

			<div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

			{state.isLink ? (
				<Button
					size="sm"
					tabIndex={-1}
					variant="ghost"
					className="rounded-none"
					title={t`Supprimer le lien`}
					aria-label={t`Supprimer le lien`}
					onClick={state.unsetLink}
				>
					<LinkBreakIcon className="size-3.5" aria-hidden="true" />
				</Button>
			) : (
				<Button
					size="sm"
					tabIndex={-1}
					variant="ghost"
					className="rounded-none"
					title={t`Ajouter un lien`}
					aria-label={t`Ajouter un lien`}
					onClick={state.setLink}
				>
					<LinkIcon className="size-3.5" aria-hidden="true" />
				</Button>
			)}

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Code en ligne`}
				aria-label={t`Code en ligne`}
				pressed={state.isInlineCode}
				disabled={!state.canInlineCode}
				onPressedChange={state.toggleInlineCode}
			>
				<CodeSimpleIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<Toggle
				size="sm"
				tabIndex={-1}
				className="rounded-none"
				title={t`Bloc de code`}
				aria-label={t`Bloc de code`}
				pressed={state.isCodeBlock}
				disabled={!state.canCodeBlock}
				onPressedChange={state.toggleCodeBlock}
			>
				<CodeBlockIcon className="size-3.5" aria-hidden="true" />
			</Toggle>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						size="sm"
						tabIndex={-1}
						variant="ghost"
						className="rounded-none"
						title={t`Tableau`}
						aria-label={t`Options du tableau`}
					>
						<TableIcon className="size-3.5" aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem disabled={!state.canInsertTable} onSelect={state.insertTable}>
						<PlusIcon aria-hidden="true" />
						<Trans>Insérer un tableau</Trans>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem disabled={!state.canAddColumnBefore} onSelect={state.addColumnBefore}>
						<ColumnsPlusLeftIcon aria-hidden="true" />
						<Trans>Ajouter une colonne avant</Trans>
					</DropdownMenuItem>
					<DropdownMenuItem disabled={!state.canAddColumnAfter} onSelect={state.addColumnAfter}>
						<ColumnsPlusRightIcon aria-hidden="true" />
						<Trans>Ajouter une colonne après</Trans>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem disabled={!state.canAddRowBefore} onSelect={state.addRowBefore}>
						<RowsPlusTopIcon aria-hidden="true" />
						<Trans>Ajouter une ligne avant</Trans>
					</DropdownMenuItem>
					<DropdownMenuItem disabled={!state.canAddRowAfter} onSelect={state.addRowAfter}>
						<RowsPlusBottomIcon aria-hidden="true" />
						<Trans>Ajouter une ligne après</Trans>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem disabled={!state.canDeleteColumn} onSelect={state.deleteColumn}>
						<TrashSimpleIcon aria-hidden="true" />
						<Trans>Supprimer la colonne</Trans>
					</DropdownMenuItem>
					<DropdownMenuItem disabled={!state.canDeleteRow} onSelect={state.deleteRow}>
						<TrashSimpleIcon aria-hidden="true" />
						<Trans>Supprimer la ligne</Trans>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" disabled={!state.canDeleteTable} onSelect={state.deleteTable}>
						<TrashSimpleIcon aria-hidden="true" />
						<Trans>Supprimer le tableau</Trans>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Button
				size="sm"
				tabIndex={-1}
				variant="ghost"
				className="rounded-none"
				title={t`Nouvelle ligne`}
				aria-label={t`Insérer un saut de ligne`}
				onClick={state.setHardBreak}
			>
				<KeyReturnIcon className="size-3.5" aria-hidden="true" />
			</Button>

			<Button
				size="sm"
				tabIndex={-1}
				variant="ghost"
				className="rounded-none"
				title={t`Séparateur`}
				aria-label={t`Insérer une ligne horizontale`}
				onClick={state.setHorizontalRule}
			>
				<MinusIcon className="size-3.5" aria-hidden="true" />
			</Button>

			{aiStatus?.available && (
				<>
					<div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
					<Button
						size="sm"
						tabIndex={-1}
						variant="ghost"
						className="rounded-none text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
						title={isAIStreaming ? t`Arrêter l'IA` : t`Améliorer avec l'IA`}
						aria-label={isAIStreaming ? t`Arrêter l'amélioration IA` : t`Améliorer le contenu avec l'IA`}
						disabled={(aiImproveMutation.isPending && !isAIStreaming) || isGrammarStreaming}
						onClick={isAIStreaming ? handleAIStop : () => aiImproveMutation.mutate()}
					>
						{isAIStreaming ? (
							<StopIcon className="size-3.5" aria-hidden="true" />
						) : aiImproveMutation.isPending ? (
							<SpinnerIcon className="size-3.5 animate-spin" aria-hidden="true" />
						) : (
							<SparkleIcon className="size-3.5" aria-hidden="true" />
						)}
					</Button>
					<Button
						size="sm"
						tabIndex={-1}
						variant="ghost"
						className="rounded-none text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
						title={isGrammarStreaming ? t`Arrêter` : t`Corriger la grammaire`}
						aria-label={isGrammarStreaming ? t`Arrêter la correction grammaticale` : t`Corriger la grammaire avec l'IA`}
						disabled={(fixGrammarMutation.isPending && !isGrammarStreaming) || isAIStreaming}
						onClick={isGrammarStreaming ? handleGrammarStop : () => fixGrammarMutation.mutate()}
					>
						{isGrammarStreaming ? (
							<StopIcon className="size-3.5" aria-hidden="true" />
						) : fixGrammarMutation.isPending ? (
							<SpinnerIcon className="size-3.5 animate-spin" aria-hidden="true" />
						) : (
							<TextAaIcon className="size-3.5" aria-hidden="true" />
						)}
					</Button>
				</>
			)}
		</div>
	);
}

type TiptapContentProps = React.ComponentProps<"div"> & {
	content: string;
};

export function TiptapContent({ content, className, ...props }: TiptapContentProps) {
	const sanitizedContent = useMemo(() => sanitizeHtml(content), [content]);

	return (
		<div
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
			dangerouslySetInnerHTML={{ __html: sanitizedContent }}
			className={cn(styles.tiptap_content, className)}
			{...props}
		/>
	);
}
