import axios, { type AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, type ApiResponse, ApiError } from "@/service/index";
import type { BacktestStrategyRunState } from "@/types/strategy/backtest-strategy";

const API_VERSION = "api/v1";
const ROUTER = "strategy/backtest";
const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Get strategy run state request parameters
 */
export interface GetStrategyRunStateRequest {
	strategyId: number;
}

/**
 * Get strategy run state response
 * Note: Backend returns the state directly as a string, not wrapped in an object
 */
export type GetStrategyRunStateResponse = BacktestStrategyRunState;

// ============================================
// 2. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Get strategy run state API call (without UI logic)
 *
 * @param strategyId Strategy ID
 * @returns Strategy run state
 */
export async function getStrategyRunStateApi(
	strategyId: number,
): Promise<BacktestStrategyRunState> {
	// Step 1: Parameter validation
	if (!strategyId || strategyId <= 0) {
		throw new Error("Invalid strategy ID");
	}

	try {
		// Step 3: Send GET request
		const response = await axios.get<ApiResponse<GetStrategyRunStateResponse>>(
			`${API_URL}/${strategyId}/run-state`,
			{
				timeout: 5000, // 5s timeout
			},
		);

		// Step 4: Response status check
		if (response.status !== 200) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// Step 5: Business status check
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

		// Step 6: Validate data exists
		if (!data) {
			throw new Error("Strategy run state data is empty");
		}

		// Backend returns the state directly as a string
		return data;
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

		// Parameter validation error or other errors
		throw error;
	}
}

// ============================================
// 3. TanStack Query Hook
// ============================================

/**
 * Query options (optional configuration)
 */
export interface UseGetStrategyRunStateOptions {
	/**
	 * Whether to enable the query
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Stale time in milliseconds
	 * @default 0 (always stale, refetch on mount to get latest state)
	 */
	staleTime?: number;
	/**
	 * Garbage collection time in milliseconds
	 * @default 5 * 60 * 1000 (5 minutes)
	 */
	gcTime?: number;
	/**
	 * Refetch interval in milliseconds (for polling)
	 * @default false (disabled, rely on SSE for real-time updates)
	 */
	refetchInterval?: number | false;
	/**
	 * Refetch on component mount
	 * @default true (always fetch latest state when component mounts)
	 */
	refetchOnMount?: boolean;
	/**
	 * Refetch on window focus
	 * @default true (fetch latest state when user returns to window)
	 */
	refetchOnWindowFocus?: boolean;
}

/**
 * React Query Hook for getting strategy run state
 *
 * Note: This hook fetches the latest state on mount and window focus by default.
 * Real-time updates are handled by SSE (Server-Sent Events), so polling is disabled.
 * Configure refetchInterval if you need polling for specific use cases.
 */
export function useGetStrategyRunState(
	strategyId: number,
	options?: UseGetStrategyRunStateOptions,
) {
	const {
		enabled = true,
		staleTime = 0, // Always stale, refetch on mount to ensure latest state
		gcTime = 5 * 60 * 1000, // 5 minutes
		refetchInterval = false, // Disabled, rely on SSE for real-time updates
		refetchOnMount = true, // Always fetch latest state when component mounts
		refetchOnWindowFocus = true, // Fetch latest state when user returns to window
	} = options || {};

	return useQuery({
		// Query key (used for caching and invalidation)
		queryKey: ["strategy", "backtest", strategyId, "run-state"],

		// Query function
		queryFn: () => {
			return getStrategyRunStateApi(strategyId);
		},

		// Enable/disable query
		enabled: enabled && strategyId > 0,

		// Stale time: data is considered fresh for this duration
		staleTime,

		// Cache time: cached data is kept for this duration
		gcTime,

		// Refetch interval: automatically refetch at this interval
		refetchInterval,

		// Refetch on mount: fetch latest state when component mounts/remounts
		refetchOnMount,

		// Refetch on window focus: fetch latest state when user returns
		refetchOnWindowFocus,
	});
}
