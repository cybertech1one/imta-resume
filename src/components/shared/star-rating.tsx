import { StarIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { cn } from "@/utils/style";

export function StarRating({
	rating,
	onRatingChange,
	readonly = false,
	size = "default",
}: {
	rating: number;
	onRatingChange?: (rating: number) => void;
	readonly?: boolean;
	size?: "default" | "small" | "large";
}) {
	const [hoverRating, setHoverRating] = useState(0);

	const sizeClasses = {
		small: "size-4",
		default: "size-5",
		large: "size-6",
	};

	return (
		<div className="flex items-center gap-0.5">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					disabled={readonly}
					className={cn("transition-transform", !readonly && "hover:scale-110", readonly && "cursor-default")}
					onClick={() => onRatingChange?.(star)}
					onMouseEnter={() => !readonly && setHoverRating(star)}
					onMouseLeave={() => !readonly && setHoverRating(0)}
				>
					<StarIcon
						className={cn(
							sizeClasses[size],
							"transition-colors",
							(hoverRating || rating) >= star ? "text-amber-500" : "text-gray-300 dark:text-gray-600",
						)}
						weight={(hoverRating || rating) >= star ? "fill" : "regular"}
					/>
				</button>
			))}
		</div>
	);
}
