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
 * Get initial chart data request parameters
 */
export interface GetStrategyDataRequest {
	/**
	 * Strategy ID
	 */
	strategyId: number;
	/**
	 * Key string (kline key or indicator key)
	 */
	keyStr: string;
	/**
	 * Datetime string (nullable)
	 */
	datetime: string | null;
	/**
	 * Data limit (nullable)
	 */
	limit: number | null;
}

/**
 * Get initial chart data response
 * Returns array of chart data (kline or indicator data)
 */
export type GetStrategyDataResponse = unknown[];

// ============================================
// 2. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Get initial chart data API call (without UI logic)
 *
 * @param params Request parameters
 * @returns Chart data array
 */
export async function getStrategyDataApi(
	params: GetStrategyDataRequest,
): Promise<GetStrategyDataResponse> {
	// Step 1: Parameter validation
	if (!params.strategyId || params.strategyId <= 0) {
		throw new Error("Invalid strategy ID");
	}
	if (!params.keyStr || params.keyStr.trim() === "") {
		throw new Error("Invalid key string");
	}

	try {
		// Step 2: Build query parameters
		const queryParams = new URLSearchParams();
		queryParams.append("key", params.keyStr);
		if (params.datetime !== null && params.datetime.trim() !== "") {
			queryParams.append("datetime", params.datetime);
		}
		if (params.limit !== null) {
			queryParams.append("limit", params.limit.toString());
		}

		// Step 3: Build URL
		const url = `${getApiUrl()}/${params.strategyId}/data?${queryParams.toString()}`;
		// console.log("getStrategyDataApi url", decodeURIComponent(url));
		// Step 5: Send GET request
		const response = await axios.get<ApiResponse<GetStrategyDataResponse>>(
			url,
			{
				timeout: 10000, // 10s timeout (chart data may be large)
			},
		);

		// Step 6: Response status check
		if (response.status !== 200) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// Step 7: Business status check
		const apiResponse = response.data;
		if (!apiResponse.success) {
			// Error response
			throw new ApiError(
				apiResponse.message,
				apiResponse.errorCode,
				apiResponse.errorCodeChain,
			);
		}

		// Step 8: Validate data exists
		const { data } = apiResponse;
		if (!data) {
			// Return empty array if no data
			return [];
		}

		// console.log("getStrategyDataApi data", data);
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
export interface UseGetStrategyDataOptions {
	/**
	 * Whether to enable the query
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Stale time in milliseconds
	 * @default 5 * 60 * 1000 (5 minutes - chart data is relatively stable)
	 */
	staleTime?: number;
	/**
	 * Garbage collection time in milliseconds
	 * @default 10 * 60 * 1000 (10 minutes)
	 */
	gcTime?: number;
	/**
	 * Refetch on component mount
	 * @default false (use cached data to avoid redundant fetches)
	 */
	refetchOnMount?: boolean;
	/**
	 * Refetch on window focus
	 * @default false (chart data doesn't need to refetch on focus)
	 */
	refetchOnWindowFocus?: boolean;
	/**
	 * Retry count on error
	 * @default 3
	 */
	retry?: number;
}

/**
 * React Query Hook for getting strategy data
 *
 * Note: This hook fetches strategy data with caching and automatic retry.
 * It's designed for fetching kline and indicator data for chart initialization.
 */
export function useGetStrategyData(
	params: GetStrategyDataRequest,
	options?: UseGetStrategyDataOptions,
) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000, // 5 minutes - chart data is relatively stable
		gcTime = 10 * 60 * 1000, // 10 minutes
		refetchOnMount = false, // Use cached data to avoid redundant fetches
		refetchOnWindowFocus = false, // Chart data doesn't need to refetch on focus
		retry = 3, // Retry 3 times on error
	} = options || {};

	return useQuery({
		// Query key (used for caching and invalidation)
		queryKey: [
			"strategy",
			"backtest",
			params.strategyId,
			"strategy-data",
			params.keyStr,
			params.datetime,
			params.limit,
		],

		// Query function
		queryFn: () => {
			return getStrategyDataApi(params);
		},

		// Enable/disable query
		enabled:
			enabled &&
			params.strategyId > 0 &&
			!!params.keyStr &&
			params.keyStr.trim() !== "",

		// Stale time: data is considered fresh for this duration
		staleTime,

		// Cache time: cached data is kept for this duration
		gcTime,

		// Refetch on mount: use cached data to avoid redundant fetches
		refetchOnMount,

		// Refetch on window focus: chart data doesn't need to refetch on focus
		refetchOnWindowFocus,

		// Retry configuration
		retry,
	});
}
