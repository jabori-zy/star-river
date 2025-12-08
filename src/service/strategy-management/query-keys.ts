/**
 * Strategy-related Query Keys factory functions
 *
 * TanStack Query best practice: centralized management of all query keys, avoiding hard-coding and duplicate definitions
 *
 * @example
 * ```ts
 * // Get all strategy-related queries
 * queryClient.invalidateQueries({ queryKey: strategyKeys.all });
 *
 * // Get strategy list
 * useQuery({ queryKey: strategyKeys.list({ page: 1, perPage: 20 }) });
 *
 * // Get single strategy details
 * useQuery({ queryKey: strategyKeys.detail(strategyId) });
 * ```
 */
export const strategyKeys = {
	/**
	 * All strategy-related queries
	 * Used to invalidate all strategy-related cache
	 */
	all: ["strategies"] as const,

	/**
	 * All strategy list queries
	 */
	lists: () => [...strategyKeys.all, "list"] as const,

	/**
	 * Strategy list query with specific conditions
	 * @param filters Filter conditions (page number, items per page, etc.)
	 */
	list: (filters: { page?: number; perPage?: number; search?: string }) =>
		[...strategyKeys.lists(), filters] as const,

	/**
	 * All strategy details queries
	 */
	details: () => [...strategyKeys.all, "detail"] as const,

	/**
	 * Specific strategy details query
	 * @param id Strategy ID
	 */
	detail: (id: number) => [...strategyKeys.details(), id] as const,

	/**
	 * Strategy cache keys
	 * @param id Strategy ID
	 */
	cacheKeys: (id: number) => [...strategyKeys.all, "cacheKeys", id] as const,

	/**
	 * Strategy backtest chart configuration
	 * @param id Strategy ID
	 */
	backtestChartConfig: (id: number) =>
		[...strategyKeys.all, "backtestChartConfig", id] as const,
} as const;
