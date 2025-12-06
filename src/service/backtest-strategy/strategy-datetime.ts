import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { getApiBaseUrl, ApiError, type ApiResponse } from "@/service/index";

const API_VERSION = "api/v1";
const ROUTER = "strategy/backtest";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Get strategy datetime request parameters
 */
export interface GetStrategyDatetimeRequest {
	strategyId: number;
}

/**
 * Get strategy datetime response
 * Returns the current execution datetime of the strategy
 */
export interface GetStrategyDatetimeResponse {
	strategyDatetime: string;
}

// ============================================
// 2. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Get strategy datetime API call (without UI logic)
 *
 * @param strategyId Strategy ID
 * @returns Strategy datetime
 */
export async function getStrategyDatetimeApi(
	strategyId: number,
): Promise<GetStrategyDatetimeResponse> {
	// Step 1: Parameter validation
	if (!strategyId || strategyId <= 0) {
		throw new Error("Invalid strategy ID");
	}

	try {
		// Step 2: Send GET request
		const response = await axios.get<ApiResponse<GetStrategyDatetimeResponse>>(
			`${getApiUrl()}/${strategyId}/strategy-datetime`,
			{
				timeout: 5000, // 5s timeout
			},
		);

		// Step 3: Response status check
		if (response.status !== 200) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// Step 4: Business status check
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
			throw new Error("Strategy datetime data is empty");
		}

		// Return the datetime data
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
export interface UseGetStrategyDatetimeOptions {
	/**
	 * Whether to enable the query
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Stale time in milliseconds
	 * @default 0 (always stale, refetch on mount to get latest datetime)
	 */
	staleTime?: number;
	/**
	 * Garbage collection time in milliseconds
	 * @default 5 * 60 * 1000 (5 minutes)
	 */
	gcTime?: number;
	/**
	 * Refetch on component mount
	 * @default true (always fetch latest datetime when component mounts)
	 */
	refetchOnMount?: boolean;
	/**
	 * Refetch on window focus
	 * @default true (fetch latest datetime when user returns to window)
	 */
	refetchOnWindowFocus?: boolean;
}

/**
 * React Query Hook for getting strategy datetime
 *
 * Note: This hook fetches the latest datetime on mount and window focus by default.
 * It's designed for initial loading only, not for real-time polling.
 */
export function useGetStrategyDatetime(
	strategyId: number,
	options?: UseGetStrategyDatetimeOptions,
) {
	const {
		enabled = true,
		staleTime = 0, // Always stale, refetch on mount to ensure latest datetime
		gcTime = 5 * 60 * 1000, // 5 minutes
		refetchOnMount = true, // Always fetch latest datetime when component mounts
		refetchOnWindowFocus = true, // Fetch latest datetime when user returns to window
	} = options || {};

	return useQuery({
		// Query key (used for caching and invalidation)
		queryKey: ["strategy", "backtest", strategyId, "strategy-datetime"],

		// Query function
		queryFn: () => {
			return getStrategyDatetimeApi(strategyId);
		},

		// Enable/disable query
		enabled: enabled && strategyId > 0,

		// Stale time: data is considered fresh for this duration
		staleTime,

		// Cache time: cached data is kept for this duration
		gcTime,

		// Refetch on mount: fetch latest datetime when component mounts/remounts
		refetchOnMount,

		// Refetch on window focus: fetch latest datetime when user returns
		refetchOnWindowFocus,
	});
}
