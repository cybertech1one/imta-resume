import * as React from "react";
import { cn } from "@/utils/style";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, onCheckedChange, ...props }, ref) => (
	<input
		type="checkbox"
		className={cn(
			"peer h-4 w-4 shrink-0 cursor-pointer rounded border border-input ring-offset-background checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		ref={ref}
		onChange={(e) => onCheckedChange?.(e.target.checked)}
		{...props}
	/>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
