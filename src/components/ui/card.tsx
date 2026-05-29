import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "motion/react";
import { type ComponentProps, forwardRef } from "react";
import { cn } from "@/utils/style";

const cardVariants = cva("rounded-xl border bg-card text-card-foreground shadow-sm", {
	variants: {
		hover: {
			none: "",
			lift: "transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg",
			glow: "transition-all duration-200 ease-out hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
			scale: "transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-lg",
			subtle: "transition-all duration-200 ease-out hover:border-primary/30 hover:shadow-md",
			gradient:
				"transition-all duration-300 ease-out hover:shadow-primary/5 hover:shadow-xl [&:hover]:bg-gradient-to-br [&:hover]:from-card [&:hover]:to-muted/30",
		},
		interactive: {
			true: "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
			false: "",
		},
		padding: {
			none: "",
			sm: "p-4",
			default: "p-6",
			lg: "p-8",
		},
	},
	defaultVariants: {
		hover: "none",
		interactive: false,
		padding: "none",
	},
});

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>;

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, hover, interactive, padding, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-slot="card"
			className={cn(cardVariants({ hover, interactive, padding }), className)}
			{...props}
		/>
	);
});
Card.displayName = "Card";

// Animated card variant using motion
type AnimatedCardProps = HTMLMotionProps<"div"> &
	VariantProps<typeof cardVariants> & {
		animateOnHover?: boolean;
	};

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
	({ className, hover, interactive, padding, animateOnHover = true, ...props }, ref) => {
		return (
			<motion.div
				ref={ref}
				data-slot="card"
				className={cn(cardVariants({ hover, interactive, padding }), className)}
				whileHover={animateOnHover ? { y: -4, transition: { duration: 0.2 } } : undefined}
				whileTap={interactive ? { scale: 0.98 } : undefined}
				{...props}
			/>
		);
	},
);
AnimatedCard.displayName = "AnimatedCard";

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="card-header" className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
	return (
		<h3 data-slot="card-title" className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
	return <p data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, AnimatedCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
export type { CardProps, AnimatedCardProps };
