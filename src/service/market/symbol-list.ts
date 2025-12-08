import { useQuery } from "@tanstack/react-query";
import type { Instrument } from "@/types/market";
import { getSymbolList } from "./index";
import { marketKeys } from "./market-query-key";

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Query options (optional configuration)
 */
export interface UseSymbolListOptions {
	/**
	 * Whether to enable the query
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Stale time in milliseconds
	 * @default 5 * 60 * 1000 (5 minutes)
	 */
	staleTime?: number;
	/**
	 * Garbage collection time in milliseconds
	 * @default 10 * 60 * 1000 (10 minutes)
	 */
	gcTime?: number;
}

// ============================================
// 2. TanStack Query Hook
// ============================================

/**
 * React Query Hook for getting symbol list
 *
 * @param accountId Account ID
 * @param options Query options
 * @returns Query result with symbol list
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSymbolList(accountId);
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <ul>
 *     {data?.map(symbol => (
 *       <li key={symbol.symbol}>{symbol.symbol}</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useSymbolList(
	accountId: number,
	options?: UseSymbolListOptions,
) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000, // 5 minutes
		gcTime = 10 * 60 * 1000, // 10 minutes
	} = options || {};

	return useQuery<Instrument[], Error>({
		// Query key (used for caching and invalidation)
		queryKey: marketKeys.symbolList(accountId),

		// Query function
		queryFn: () => getSymbolList(accountId),

		// Enable/disable query
		enabled: enabled && accountId > 0,

		// Stale time: data is considered fresh for this duration
		staleTime,

		// Cache time: cached data is kept for this duration
		gcTime,
	});
}
