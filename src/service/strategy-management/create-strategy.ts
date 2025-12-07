import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import {
	getApiBaseUrl,
	ApiError,
	type ApiResponse,
	type MutationMeta,
} from "@/service/index";
import type { Strategy } from "@/types/strategy";
import { strategyKeys } from "./query-keys";

const API_VERSION = "api/v1";
const ROUTER = "strategy";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Create strategy request parameters
 */
export interface CreateStrategyRequest {
	name: string;
	description: string;
}

// ============================================
// 3. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Transform raw data from backend to Strategy type
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

/**
 * Create strategy API call (without UI logic)
 *
 * ✅ Directly use complete strategy data from backend, no need for second request
 *
 * @param params Create parameters
 * @returns Created strategy object
 */
export async function createStrategyApi(
	params: CreateStrategyRequest,
): Promise<Strategy> {
	// Step 1: Parameter validation
	// validateCreateStrategyParams(params);

	// Step 2: Construct request body (explicit construction for easy debugging)
	const requestBody: CreateStrategyRequest = {
		name: params.name.trim(),
		description: params.description.trim(),
	};

	// Step 3: Log request (development environment)
	if (import.meta.env.DEV) {
		console.log("[create strategy] params:", requestBody);
	}

	try {
		// Step 4: Send POST request
		const response = await axios.post<ApiResponse<Record<string, unknown>>>(
			getApiUrl(),
			requestBody,
			{
				headers: {
					"Content-Type": "application/json",
				},
				timeout: 10000, // 10 second timeout
			},
		);

		// Step 5: Response status check
		if (response.status !== 201) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// Step 6: Business status check (using type guard)
		const apiResponse = response.data;
		if (!apiResponse.success) {
			// Error response
			throw new ApiError(
				apiResponse.message,
				apiResponse.errorCode,
				apiResponse.errorCodeChain,
			);
		}

		// Success response - directly use data from backend
		const { data } = apiResponse;

		// Step 7: Log response (development environment)
		if (import.meta.env.DEV) {
			console.log("[create strategy] response data:", data);
		}

		// Step 8: Transform backend data to Strategy type
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

		// Parameter validation error or other errors
		// console.error("[create strategy] error:", error);
		throw error;
	}
}

// ============================================
// 4. TanStack Query Hook
// ============================================

/**
 * Mutation options (optional configuration)
 */
export interface UseCreateStrategyOptions {
	/**
	 * Metadata configuration (for controlling global toast behavior)
	 * Uses standard MutationMeta interface
	 */
	meta?: MutationMeta;
	/**
	 * Success callback
	 */
	onSuccess?: (strategy: Strategy) => void;
	/**
	 * Error callback
	 */
	onError?: (error: Error) => void;
	/**
	 * Settled callback (called regardless of success or failure)
	 */
	onSettled?: () => void;
}

export function useCreateStrategy(options?: UseCreateStrategyOptions) {
	const queryClient = useQueryClient();

	const { meta, onSuccess, onError, onSettled } = options || {};

	return useMutation({
		// Mutation function
		mutationFn: (params: CreateStrategyRequest) => createStrategyApi(params),

		// ✅ Pass toast configuration to global MutationCache via meta
		meta: {
			successMessage: meta?.successMessage,
			showSuccessToast: meta?.showSuccessToast,
			errorMessage: meta?.errorMessage,
			showErrorToast: meta?.showErrorToast,
		},

		// Success callback (only handles data and cache, not toast)
		onSuccess: (strategy) => {
			// 1. Invalidate strategy list cache, trigger refetch
			queryClient.invalidateQueries({
				queryKey: strategyKeys.lists(),
			});

			// 2. Prefill single strategy detail cache (performance optimization)
			queryClient.setQueryData(strategyKeys.detail(strategy.id), strategy);

			// 3. Execute user-defined success callback
			onSuccess?.(strategy);

			// 4. Development environment log
			if (import.meta.env.DEV) {
				console.log("[create strategy] success:", strategy);
			}
		},

		// Error callback (only handles business logic, not toast)
		onError: (error: Error) => {
			// Execute user-defined error callback
			onError?.(error);

			// Development environment log (detailed error already logged in global MutationCache)
			if (import.meta.env.DEV) {
				console.error("[create strategy] error:", error);
			}
		},

		// Settled callback (called regardless of success or failure)
		onSettled: () => {
			onSettled?.();
		},
	});
}
