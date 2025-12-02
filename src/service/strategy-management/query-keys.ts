/**
 * 策略相关的 Query Keys 工厂函数
 *
 * TanStack Query 最佳实践：集中管理所有查询键，避免硬编码和重复定义
 *
 * @example
 * ```ts
 * // 获取所有策略相关的查询
 * queryClient.invalidateQueries({ queryKey: strategyKeys.all });
 *
 * // 获取策略列表
 * useQuery({ queryKey: strategyKeys.list({ page: 1, perPage: 20 }) });
 *
 * // 获取单个策略详情
 * useQuery({ queryKey: strategyKeys.detail(strategyId) });
 * ```
 */
export const strategyKeys = {
	/**
	 * 所有策略相关的查询
	 * 用于失效所有策略相关缓存
	 */
	all: ["strategies"] as const,

	/**
	 * 所有策略列表查询
	 */
	lists: () => [...strategyKeys.all, "list"] as const,

	/**
	 * 特定条件的策略列表查询
	 * @param filters 过滤条件（页码、每页数量等）
	 */
	list: (filters: { page?: number; perPage?: number; search?: string }) =>
		[...strategyKeys.lists(), filters] as const,

	/**
	 * 所有策略详情查询
	 */
	details: () => [...strategyKeys.all, "detail"] as const,

	/**
	 * 特定策略的详情查询
	 * @param id 策略 ID
	 */
	detail: (id: number) => [...strategyKeys.details(), id] as const,

	/**
	 * 策略的缓存键
	 * @param id 策略 ID
	 */
	cacheKeys: (id: number) => [...strategyKeys.all, "cacheKeys", id] as const,

	/**
	 * 策略的回测图表配置
	 * @param id 策略 ID
	 */
	backtestChartConfig: (id: number) =>
		[...strategyKeys.all, "backtestChartConfig", id] as const,
} as const;
