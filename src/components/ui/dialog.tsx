import { XIcon } from "@phosphor-icons/react";
import {
	DialogClose as DialogClosePrimitive,
	type DialogCloseProps as DialogClosePrimitiveProps,
	DialogContent as DialogContentPrimitive,
	type DialogContentProps as DialogContentPrimitiveProps,
	DialogDescription as DialogDescriptionPrimitive,
	type DialogDescriptionProps as DialogDescriptionPrimitiveProps,
	DialogFooter as DialogFooterPrimitive,
	type DialogFooterProps as DialogFooterPrimitiveProps,
	DialogHeader as DialogHeaderPrimitive,
	type DialogHeaderProps as DialogHeaderPrimitiveProps,
	DialogOverlay as DialogOverlayPrimitive,
	type DialogOverlayProps as DialogOverlayPrimitiveProps,
	DialogPortal as DialogPortalPrimitive,
	Dialog as DialogPrimitive,
	type DialogProps as DialogPrimitiveProps,
	DialogTitle as DialogTitlePrimitive,
	type DialogTitleProps as DialogTitlePrimitiveProps,
	DialogTrigger as DialogTriggerPrimitive,
	type DialogTriggerProps as DialogTriggerPrimitiveProps,
} from "@/components/primitives/dialog";
import { cn } from "@/utils/style";

type DialogProps = DialogPrimitiveProps;

function Dialog(props: DialogProps) {
	return <DialogPrimitive {...props} />;
}

type DialogTriggerProps = DialogTriggerPrimitiveProps;

function DialogTrigger(props: DialogTriggerProps) {
	return <DialogTriggerPrimitive {...props} />;
}

type DialogCloseProps = DialogClosePrimitiveProps;

function DialogClose(props: DialogCloseProps) {
	return <DialogClosePrimitive {...props} />;
}

type DialogOverlayProps = DialogOverlayPrimitiveProps;

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
	return (
		<DialogOverlayPrimitive
			className={cn(
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",
				className,
			)}
			{...props}
		/>
	);
}

type DialogContentProps = DialogContentPrimitiveProps & {
	showCloseButton?: boolean;
};

function DialogContent({ className, children, showCloseButton = true, ...props }: DialogContentProps) {
	return (
		<DialogPortalPrimitive>
			<DialogOverlay />
			<DialogContentPrimitive
				className={cn(
					"fixed top-[50%] left-[50%] z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-xl border bg-background p-6 shadow-2xl sm:max-w-2xl 2xl:max-w-4xl",
					"data-[state=closed]:animate-out data-[state=open]:animate-in",
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
					"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
					"data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
					"data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
					"duration-200",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogClosePrimitive className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
						<XIcon className="size-4" />
						<span className="sr-only">Close</span>
					</DialogClosePrimitive>
				)}
			</DialogContentPrimitive>
		</DialogPortalPrimitive>
	);
}

type DialogHeaderProps = DialogHeaderPrimitiveProps;

function DialogHeader({ className, ...props }: DialogHeaderProps) {
	return (
		<DialogHeaderPrimitive className={cn("flex flex-col gap-2 text-center sm:text-start", className)} {...props} />
	);
}

type DialogFooterProps = DialogFooterPrimitiveProps;

function DialogFooter({ className, ...props }: DialogFooterProps) {
	return (
		<DialogFooterPrimitive
			className={cn("flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end", className)}
			{...props}
		/>
	);
}

type DialogTitleProps = DialogTitlePrimitiveProps;

function DialogTitle({ className, ...props }: DialogTitleProps) {
	return (
		<DialogTitlePrimitive className={cn("font-semibold text-lg leading-none tracking-tight", className)} {...props} />
	);
}

type DialogDescriptionProps = DialogDescriptionPrimitiveProps;

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
	return (
		<DialogDescriptionPrimitive className={cn("text-muted-foreground text-sm leading-relaxed", className)} {...props} />
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	type DialogProps,
	type DialogTriggerProps,
	type DialogCloseProps,
	type DialogContentProps,
	type DialogHeaderProps,
	type DialogFooterProps,
	type DialogTitleProps,
	type DialogDescriptionProps,
};
