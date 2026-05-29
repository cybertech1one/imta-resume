import { memo, useCallback, useEffect, useState } from "react";
import { type CellComponentProps, Grid, List, type RowComponentProps } from "react-window";
import { cn } from "@/utils/style";

// ============================================================================
// VirtualList - Virtualized list for long scrollable lists
// ============================================================================

export type VirtualListProps<T> = {
	items: T[];
	itemHeight: number;
	height: number;
	width?: number | string;
	className?: string;
	overscanCount?: number;
	renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
};

/**
 * VirtualList - A virtualized list component for rendering long lists efficiently.
 * Only renders visible items plus overscan buffer.
 *
 * Performance benefits:
 * - Reduces DOM nodes from N to ~visible + overscan
 * - Constant memory usage regardless of list size
 * - Smooth scrolling for lists with 1000+ items
 */
export function VirtualList<T>({
	items,
	itemHeight,
	height,
	width = "100%",
	className,
	overscanCount = 5,
	renderItem,
}: VirtualListProps<T>) {
	const Row = useCallback(
		({ index, style }: RowComponentProps) => {
			const item = items[index];
			return <>{renderItem(item, index, style)}</>;
		},
		[items, renderItem],
	);

	if (items.length === 0) {
		return null;
	}

	// For small lists, don't virtualize
	if (items.length <= 20) {
		return (
			<div className={cn("overflow-auto", className)} style={{ height, width }}>
				{items.map((item, index) => renderItem(item, index, {}))}
			</div>
		);
	}

	return (
		<List
			rowComponent={Row}
			rowCount={items.length}
			rowHeight={itemHeight}
			rowProps={{} as Record<string, never>}
			overscanCount={overscanCount}
			className={className}
			style={{ height, width }}
		/>
	);
}

// ============================================================================
// VirtualGrid - Virtualized grid for card-based layouts
// ============================================================================

export type VirtualGridProps<T> = {
	items: T[];
	columnCount: number;
	rowHeight: number;
	columnWidth: number;
	height: number;
	width: number;
	className?: string;
	overscanCount?: number;
	gap?: number;
	renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
};

/**
 * VirtualGrid - A virtualized grid component for card layouts.
 * Renders items in a grid pattern, only showing visible cells.
 *
 * Performance benefits:
 * - Efficient for large card grids (resume cards, job cards, etc.)
 * - Handles responsive column counts
 * - Maintains scroll position during updates
 */
export function VirtualGrid<T>({
	items,
	columnCount,
	rowHeight,
	columnWidth,
	height,
	width,
	className,
	overscanCount = 2,
	gap = 16,
	renderItem,
}: VirtualGridProps<T>) {
	const rowCount = Math.ceil(items.length / columnCount);

	const Cell = useCallback(
		({ columnIndex, rowIndex, style }: CellComponentProps) => {
			const index = rowIndex * columnCount + columnIndex;
			if (index >= items.length) return null;

			const item = items[index];
			// Add gap to style
			const adjustedStyle: React.CSSProperties = {
				...style,
				left: Number(style.left) + gap / 2,
				top: Number(style.top) + gap / 2,
				width: Number(style.width) - gap,
				height: Number(style.height) - gap,
			};

			return <>{renderItem(item, index, adjustedStyle)}</>;
		},
		[items, columnCount, gap, renderItem],
	);

	if (items.length === 0) {
		return null;
	}

	// For small grids, don't virtualize
	if (items.length <= 24) {
		return (
			<div
				className={cn("grid overflow-auto", className)}
				style={{
					height,
					width,
					gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
					gap,
				}}
			>
				{items.map((item, index) => renderItem(item, index, {}))}
			</div>
		);
	}

	return (
		<Grid
			cellComponent={Cell}
			cellProps={{} as Record<string, never>}
			rowCount={rowCount}
			columnCount={columnCount}
			rowHeight={rowHeight}
			columnWidth={columnWidth}
			overscanCount={overscanCount}
			className={className}
			style={{ height, width }}
		/>
	);
}

// ============================================================================
// useVirtualization - Hook for virtualization with auto-sizing
// ============================================================================

type UseVirtualizationOptions = {
	itemHeight: number;
	itemWidth?: number;
	gap?: number;
	minColumns?: number;
	maxColumns?: number;
};

/**
 * useVirtualization - Hook for calculating virtualization parameters.
 * Automatically calculates column count based on container width.
 *
 * Usage:
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { columnCount, dimensions } = useVirtualization(containerRef, {
 *   itemHeight: 300,
 *   itemWidth: 250,
 *   gap: 16,
 *   minColumns: 1,
 *   maxColumns: 6,
 * });
 * ```
 */
export function useVirtualization(
	containerRef: React.RefObject<HTMLElement | null>,
	options: UseVirtualizationOptions,
) {
	const { itemHeight, itemWidth = 250, gap = 16, minColumns = 1, maxColumns = 6 } = options;
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateDimensions = () => {
			const rect = container.getBoundingClientRect();
			setDimensions({ width: rect.width, height: rect.height });
		};

		updateDimensions();

		const resizeObserver = new ResizeObserver(updateDimensions);
		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	}, [containerRef]);

	const columnCount = Math.max(
		minColumns,
		Math.min(maxColumns, Math.floor((dimensions.width + gap) / (itemWidth + gap))),
	);

	const actualColumnWidth =
		dimensions.width > 0 ? (dimensions.width - gap * (columnCount - 1)) / columnCount : itemWidth;

	return {
		columnCount,
		actualColumnWidth,
		dimensions,
		rowHeight: itemHeight + gap,
	};
}

// ============================================================================
// Memoized wrapper for virtualized items
// ============================================================================

type VirtualItemProps = {
	style: React.CSSProperties;
	children: React.ReactNode;
	className?: string;
};

/**
 * VirtualItem - Memoized wrapper for virtualized list items.
 * Prevents unnecessary re-renders of item content.
 */
export const VirtualItem = memo(function VirtualItem({ style, children, className }: VirtualItemProps) {
	return (
		<div style={style} className={className}>
			{children}
		</div>
	);
});
VirtualItem.displayName = "VirtualItem";
