/**
 * Market Query Keys Factory
 *
 * TanStack Query best practice: centralize all query keys to avoid hardcoding and duplication
 *
 * @example
 * ```ts
 * // Invalidate all market related queries
 * queryClient.invalidateQueries({ queryKey: marketKeys.all });
 *
 * // Get symbol list for a specific account
 * useQuery({ queryKey: marketKeys.symbolList(accountId) });
 *
 * // Get kline intervals for a specific account
 * useQuery({ queryKey: marketKeys.klineInterval(accountId) });
 * ```
 */
export const marketKeys = {
	/**
	 * All market related queries
	 * Used to invalidate all market related cache
	 */
	all: ["market"] as const,

	/**
	 * All symbol list queries
	 */
	symbolLists: () => [...marketKeys.all, "symbolList"] as const,

	/**
	 * Symbol list query for a specific account
	 * @param accountId Account ID
	 */
	symbolList: (accountId: number) =>
		[...marketKeys.symbolLists(), accountId] as const,

	/**
	 * All kline interval queries
	 */
	klineIntervals: () => [...marketKeys.all, "klineIntervals"] as const,

	/**
	 * Kline interval query for a specific account
	 * @param accountId Account ID
	 */
	klineInterval: (accountId: number) =>
		[...marketKeys.klineIntervals(), accountId] as const,

	/**
	 * All symbol info queries
	 */
	symbolInfos: () => [...marketKeys.all, "symbolInfo"] as const,

	/**
	 * Symbol info query for a specific symbol
	 * @param accountId Account ID
	 * @param symbol Symbol name
	 */
	symbolInfo: (accountId: number, symbol: string) =>
		[...marketKeys.symbolInfos(), accountId, symbol] as const,
} as const;
