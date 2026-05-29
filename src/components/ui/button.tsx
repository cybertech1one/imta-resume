import { SpinnerIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { Button as ButtonPrimitive, type ButtonProps as ButtonPrimitiveProps } from "@/components/primitives/button";
import { cn } from "@/utils/style";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all duration-200 ease-out focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
				accent: "bg-accent text-accent-foreground shadow-xs hover:bg-accent/90 hover:shadow-md active:scale-[0.98]",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:shadow-md focus-visible:ring-destructive/20 active:scale-[0.98] dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
				outline:
					"border bg-background shadow-xs hover:border-secondary-foreground/20 hover:bg-secondary/40 hover:text-secondary-foreground active:scale-[0.98]",
				secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.98]",
				ghost: "hover:bg-secondary/40 hover:text-secondary-foreground active:bg-secondary/60",
				link: "text-primary underline-offset-4 hover:underline focus-visible:underline",
				success:
					"bg-green-600 text-white shadow-xs hover:bg-green-700 hover:shadow-md active:scale-[0.98] dark:bg-green-600 dark:hover:bg-green-700",
				warning:
					"bg-amber-500 text-white shadow-xs hover:bg-amber-600 hover:shadow-md active:scale-[0.98] dark:bg-amber-500 dark:hover:bg-amber-600",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				xl: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
				icon: "size-9",
				"icon-sm": "size-8 rounded-md",
				"icon-lg": "size-10 rounded-md",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ButtonProps = ButtonPrimitiveProps &
	VariantProps<typeof buttonVariants> & {
		loading?: boolean;
		loadingText?: string;
	};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, type = "button", loading, loadingText, children, disabled, ...props }, ref) => {
		const isDisabled = disabled || loading;

		return (
			<ButtonPrimitive
				ref={ref}
				type={type}
				className={cn(buttonVariants({ variant, size, className }), loading && "relative")}
				disabled={isDisabled}
				aria-busy={loading}
				{...props}
			>
				<AnimatePresence mode="wait">
					{loading ? (
						<motion.span
							key="loading"
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.15 }}
							className="inline-flex items-center gap-2"
						>
							<SpinnerIcon className="size-4 animate-spin" />
							{loadingText && <span>{loadingText}</span>}
						</motion.span>
					) : (
						<motion.span
							key="content"
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.15 }}
							className="inline-flex items-center gap-2"
						>
							{children as ReactNode}
						</motion.span>
					)}
				</AnimatePresence>
			</ButtonPrimitive>
		);
	},
);

Button.displayName = "Button";

export { Button, buttonVariants, type ButtonProps };
