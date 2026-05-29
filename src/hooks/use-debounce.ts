import { useEffect, useState } from "react";

/**
 * Debounces a value by the specified delay.
 * Useful for delaying API calls or expensive computations until user stops typing.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState("");
 * const debouncedSearch = useDebounce(searchQuery, 300);
 *
 * // API call only fires when debouncedSearch changes
 * useQuery({
 *   queryKey: ["search", debouncedSearch],
 *   queryFn: () => searchAPI(debouncedSearch),
 *   enabled: debouncedSearch.length >= 2,
 * });
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}
