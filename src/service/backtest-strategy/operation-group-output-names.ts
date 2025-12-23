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
 * Get operation group output names request parameters
 */
export interface GetOperationGroupOutputNamesRequest {
	strategyId: number;
	operationKey: string;
}

/**
 * Get operation group output names response
 */
export type GetOperationGroupOutputNamesResponse = string[];

// ============================================
// 2. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Get operation group output names API call (without UI logic)
 *
 * @param strategyId Strategy ID
 * @param operationKey Operation key string
 * @returns Array of output names
 */
export async function getOperationGroupOutputNamesApi(
	strategyId: number,
	operationKey: string,
): Promise<string[]> {
	// Step 1: Parameter validation
	if (!strategyId || strategyId <= 0) {
		throw new Error("Invalid strategy ID");
	}

	if (!operationKey) {
		throw new Error("Operation key is required");
	}

	try {
		// Step 2: Send GET request
		const response = await axios.get<
			ApiResponse<GetOperationGroupOutputNamesResponse>
		>(`${getApiUrl()}/${strategyId}/operation_group_output_names`, {
			params: {
				operation_key: operationKey,
			},
			timeout: 5000, // 5s timeout
		});

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

		// Step 5: Return data (empty array if null)
		return data ?? [];
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
export interface UseGetOperationGroupOutputNamesOptions {
	/**
	 * Whether to enable the query
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Stale time in milliseconds
	 * @default 30000 (30 seconds)
	 */
	staleTime?: number;
	/**
	 * Garbage collection time in milliseconds
	 * @default 5 * 60 * 1000 (5 minutes)
	 */
	gcTime?: number;
}

/**
 * React Query Hook for getting operation group output names
 *
 * @param strategyId Strategy ID
 * @param operationKey Operation key string
 * @param options Query options
 */
export function useGetOperationGroupOutputNames(
	strategyId: number,
	operationKey: string,
	options?: UseGetOperationGroupOutputNamesOptions,
) {
	const {
		enabled = true,
		staleTime = 30000, // 30 seconds
		gcTime = 5 * 60 * 1000, // 5 minutes
	} = options || {};

	return useQuery({
		// Query key (used for caching and invalidation)
		queryKey: [
			"strategy",
			"backtest",
			strategyId,
			"operation_group_output_names",
			operationKey,
		],

		// Query function
		queryFn: () => {
			return getOperationGroupOutputNamesApi(strategyId, operationKey);
		},

		// Enable/disable query
		enabled: enabled && strategyId > 0 && !!operationKey,

		// Stale time: data is considered fresh for this duration
		staleTime,

		// Cache time: cached data is kept for this duration
		gcTime,
	});
}
