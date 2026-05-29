import { memo, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/style";

// ============================================================================
// LazyImage - Optimized image component with blur placeholder
// ============================================================================

type LazyImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	/** Blur placeholder data URL (base64 or actual blur image) */
	placeholder?: string;
	/** Whether to use native lazy loading or IntersectionObserver */
	strategy?: "native" | "observer";
	/** Blur amount for placeholder (in pixels) */
	blurAmount?: number;
	/** Animation duration for fade-in (in ms) */
	fadeDuration?: number;
	/** Threshold for intersection observer (0-1) */
	threshold?: number;
	/** Root margin for intersection observer */
	rootMargin?: string;
	/** Callback when image loads successfully */
	onLoadComplete?: () => void;
	/** Callback when image fails to load */
	onLoadError?: (error: Error) => void;
};

/**
 * LazyImage - Optimized lazy loading image component with blur placeholder.
 *
 * Features:
 * - Lazy loading with IntersectionObserver or native loading
 * - Blur placeholder effect during loading
 * - Smooth fade-in animation when loaded
 * - Error handling with fallback
 * - Memoized for performance
 *
 * Usage:
 * ```tsx
 * <LazyImage
 *   src="/image.jpg"
 *   alt="Description"
 *   placeholder={blurDataUrl}
 *   className="aspect-video"
 * />
 * ```
 */
export const LazyImage = memo(function LazyImage({
	src,
	alt,
	placeholder,
	strategy = "observer",
	blurAmount = 20,
	fadeDuration = 300,
	threshold = 0.1,
	rootMargin = "50px",
	onLoadComplete,
	onLoadError,
	className,
	style,
	...props
}: LazyImageProps) {
	const imgRef = useRef<HTMLImageElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isInView, setIsInView] = useState(strategy === "native");
	const [hasError, setHasError] = useState(false);

	// IntersectionObserver for custom lazy loading
	useEffect(() => {
		if (strategy !== "observer" || !imgRef.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					observer.disconnect();
				}
			},
			{ threshold, rootMargin },
		);

		observer.observe(imgRef.current);
		return () => observer.disconnect();
	}, [strategy, threshold, rootMargin]);

	const handleLoad = useCallback(() => {
		setIsLoaded(true);
		onLoadComplete?.();
	}, [onLoadComplete]);

	const handleError = useCallback(() => {
		setHasError(true);
		onLoadError?.(new Error(`Failed to load image: ${src}`));
	}, [src, onLoadError]);

	// Generate a simple blur placeholder if none provided
	const placeholderStyle: React.CSSProperties = placeholder
		? {
				backgroundImage: `url(${placeholder})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				filter: `blur(${blurAmount}px)`,
				transform: "scale(1.1)", // Prevent blur edge artifacts
			}
		: {
				backgroundColor: "var(--muted)",
			};

	return (
		<div ref={imgRef} className={cn("relative overflow-hidden", className)} style={style} aria-hidden={!alt}>
			{/* Placeholder layer */}
			{!isLoaded && !hasError && (
				<div
					className="absolute inset-0 transition-opacity"
					style={{
						...placeholderStyle,
						transitionDuration: `${fadeDuration}ms`,
						opacity: isLoaded ? 0 : 1,
					}}
					aria-hidden="true"
				/>
			)}

			{/* Skeleton shimmer effect */}
			{!isLoaded && !hasError && !placeholder && (
				<div className="skeleton-wave absolute inset-0 opacity-50" aria-hidden="true" />
			)}

			{/* Actual image */}
			{isInView && !hasError && (
				<img
					src={src}
					alt={alt}
					loading={strategy === "native" ? "lazy" : undefined}
					onLoad={handleLoad}
					onError={handleError}
					className={cn("size-full object-cover transition-opacity", isLoaded ? "opacity-100" : "opacity-0")}
					style={{
						transitionDuration: `${fadeDuration}ms`,
					}}
					{...props}
				/>
			)}

			{/* Error fallback */}
			{hasError && (
				<div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
					<svg className="size-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			)}
		</div>
	);
});
LazyImage.displayName = "LazyImage";

// ============================================================================
// generateBlurDataURL - Creates a tiny blur placeholder
// ============================================================================

/**
 * Generate a base64 blur placeholder from a color.
 * Use for generating quick placeholders when no actual blur image exists.
 */
export function generateBlurDataURL(color = "#94a3b8"): string {
	// Create a tiny 1x1 SVG with the color
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${color}" width="1" height="1"/></svg>`;
	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ============================================================================
// ProgressiveImage - Image with progressive loading from low to high res
// ============================================================================

type ProgressiveImageProps = Omit<LazyImageProps, "placeholder"> & {
	/** Low-quality image source for initial display */
	lowResSrc?: string;
	/** High-quality image source */
	highResSrc: string;
};

/**
 * ProgressiveImage - Loads a low-res version first, then the high-res version.
 * Useful for large hero images or background images.
 */
export const ProgressiveImage = memo(function ProgressiveImage({
	lowResSrc,
	highResSrc,
	alt,
	className,
	...props
}: ProgressiveImageProps) {
	const [currentSrc, setCurrentSrc] = useState(lowResSrc || highResSrc);
	const [isHighResLoaded, setIsHighResLoaded] = useState(!lowResSrc);

	useEffect(() => {
		if (!lowResSrc || isHighResLoaded) return;

		const img = new Image();
		img.src = highResSrc;
		img.onload = () => {
			setCurrentSrc(highResSrc);
			setIsHighResLoaded(true);
		};
	}, [lowResSrc, highResSrc, isHighResLoaded]);

	return (
		<LazyImage
			src={currentSrc}
			alt={alt}
			className={cn(className, !isHighResLoaded && "blur-sm transition-[filter] duration-300")}
			{...props}
		/>
	);
});
ProgressiveImage.displayName = "ProgressiveImage";

// ============================================================================
// ImagePreloader - Preload critical images for faster LCP
// ============================================================================

/**
 * Preload an image for faster display.
 * Call early in component lifecycle for critical images.
 */
export function preloadImage(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = src;
		img.onload = () => resolve();
		img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
	});
}

/**
 * Preload multiple images in parallel.
 */
export function preloadImages(sources: string[]): Promise<PromiseSettledResult<void>[]> {
	return Promise.allSettled(sources.map(preloadImage));
}
