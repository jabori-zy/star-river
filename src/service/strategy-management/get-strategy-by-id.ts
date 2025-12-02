import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { API_BASE_URL, ApiError, type ApiResponse } from "@/service/index";
import type { Strategy } from "@/types/strategy";
import { strategyKeys } from "./query-keys";

const API_VERSION = "api/v1";
const ROUTER = "strategy";
const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Get strategy by ID request parameters
 */
export interface GetStrategyByIdRequest {
	strategyId: number;
}

// ============================================
// 2. Data Transform Functions
// ============================================

/**
 * Transform backend raw data to Strategy type
 * Converts snake_case to camelCase
 */
function transformToStrategy(data: Record<string, unknown>): Strategy {
	return {
		id: data.id as number,
		name: data.name as string,
		description: data.description as string,
		isDeleted: data.isDeleted as boolean,
		tradeMode: data.tradeMode as Strategy["tradeMode"],
		nodes: (data.nodes as Strategy["nodes"]) || [],
		edges: (data.edges as Strategy["edges"]) || [],
		status: data.status as Strategy["status"],
		backtestChartConfig:
			(data.backtestChartConfig as Strategy["backtestChartConfig"]) || null,
		createTime: data.createTime as string,
		updateTime: data.updateTime as string,
	};
}

// ============================================
// 3. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Get strategy by ID API call (without UI logic)
 *
 * @param strategyId Strategy ID
 * @returns Strategy object
 */
export async function getStrategyByIdApi(
	strategyId: number,
): Promise<Strategy> {
	try {
		// Step 2: Send GET request
		const response = await axios.get<ApiResponse<Record<string, unknown>>>(
			`${API_URL}/${strategyId}`,
			{
				timeout: 10000, // 10s timeout
			},
		);

		// Step 3: Response status check
		if (response.status !== 200) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// Step 4: Business status check (using type guard)
		const apiResponse = response.data;
		if (!apiResponse.success) {
			// Error response
			throw new ApiError(
				apiResponse.message,
				apiResponse.errorCode,
				apiResponse.errorCodeChain,
			);
		}

		// Success response
		const { data } = apiResponse;

		// Step 5: Validate data exists
		if (!data) {
			throw new Error("Strategy data is empty");
		}

		// Step 7: Transform backend data to Strategy type
		const strategy = transformToStrategy(data);

		return strategy;
	} catch (error) {
		// Unified error handling
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ApiResponse<unknown>>;
			const responseData = axiosError.response?.data;

			// Check if it's a standard error response from backend
			let message = axiosError.message || "network request failed";
			let errorCode: string | undefined;
			let errorCodeChain: string[] | undefined;

			if (responseData && !responseData.success) {
				// Use error message from backend
				message = responseData.message;
				errorCode = responseData.errorCode;
				errorCodeChain = responseData.errorCodeChain;
			}

			throw new ApiError(message, errorCode, errorCodeChain);
		}

		// Other errors
		throw error;
	}
}

// ============================================
// 4. TanStack Query Hook
// ============================================

/**
 * Query options (optional configuration)
 */
export interface UseGetStrategyByIdOptions {
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

/**
 * React Query Hook for getting strategy by ID
 *
 * Note: TanStack Query v5 removed onSuccess/onError callbacks from useQuery.
 * Use useEffect to react to data/error changes if needed.
 */
export function useGetStrategyById(
	strategyId: number,
	options?: UseGetStrategyByIdOptions,
) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000, // 5 minutes
		gcTime = 10 * 60 * 1000, // 10 minutes
	} = options || {};

	return useQuery({
		// Query key (used for caching and invalidation)
		queryKey: strategyKeys.detail(strategyId),

		// Query function
		queryFn: () => {
			return getStrategyByIdApi(strategyId);
		},

		// Enable/disable query
		enabled: enabled && strategyId > 0,

		// Stale time: data is considered fresh for this duration
		staleTime,

		// Cache time: cached data is kept for this duration
		gcTime,
	});
}
