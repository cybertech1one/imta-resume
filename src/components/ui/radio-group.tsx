import * as React from "react";
import { cn } from "@/utils/style";

const RadioGroupContext = React.createContext<{
	value?: string;
	onValueChange?: (value: string) => void;
}>({});

const RadioGroup = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void }
>(({ className, value, onValueChange, children, ...props }, ref) => {
	return (
		<RadioGroupContext.Provider value={{ value, onValueChange }}>
			<div ref={ref} className={cn("grid gap-2", className)} role="radiogroup" {...props}>
				{children}
			</div>
		</RadioGroupContext.Provider>
	);
});
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
	({ className, value, ...props }, ref) => {
		const context = React.useContext(RadioGroupContext);
		return (
			<input
				type="radio"
				className={cn(
					"aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				ref={ref}
				value={value}
				checked={context.value === value}
				onChange={() => context.onValueChange?.(value)}
				{...props}
			/>
		);
	},
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
