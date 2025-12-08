import { useQuery } from "@tanstack/react-query";
import { getSupportKlineInterval } from "./index";
import { marketKeys } from "./market-query-key";

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Query options (optional configuration)
 */
export interface UseSupportKlineIntervalOptions {
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
 * React Query Hook for getting supported kline intervals
 *
 * @param accountId Account ID
 * @param options Query options
 * @returns Query result with supported kline intervals
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSupportKlineInterval(accountId);
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <ul>
 *     {data?.map(interval => (
 *       <li key={interval}>{interval}</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useSupportKlineInterval(
	accountId: number,
	options?: UseSupportKlineIntervalOptions,
) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000, // 5 minutes
		gcTime = 10 * 60 * 1000, // 10 minutes
	} = options || {};

	return useQuery<string[], Error>({
		// Query key (used for caching and invalidation)
		queryKey: marketKeys.klineInterval(accountId),

		// Query function
		queryFn: () => getSupportKlineInterval(accountId),

		// Enable/disable query
		enabled: enabled && accountId > 0,

		// Stale time: data is considered fresh for this duration
		staleTime,

		// Cache time: cached data is kept for this duration
		gcTime,
	});
}
