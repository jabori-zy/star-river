import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import {
	getApiBaseUrl,
	ApiError,
	type ApiResponse,
	type MutationMeta,
} from "@/service/index";
import { strategyKeys } from "./query-keys";

const API_VERSION = "api/v1";
const ROUTER = "strategy";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Delete strategy request parameters
 */
export interface DeleteStrategyRequest {
	strategyId: number;
}

/**
 * Delete strategy response
 */
export interface DeleteStrategyResponse {
	success: boolean;
}

// ============================================
// 3. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Delete strategy API call (without UI logic)
 *
 * @param params Delete parameters
 * @returns Delete result
 */
export async function deleteStrategyApi(
	params: DeleteStrategyRequest,
): Promise<DeleteStrategyResponse> {
	// Step 1: Parameter validation
	if (!params.strategyId || params.strategyId <= 0) {
		throw new Error("Invalid strategy ID");
	}

	// Step 2: Log request (development environment)
	if (import.meta.env.DEV) {
		console.log("[delete strategy] strategyId:", params.strategyId);
	}

	try {
		// Step 3: Send DELETE request
		const response = await axios.delete<ApiResponse<DeleteStrategyResponse>>(
			`${getApiUrl()}/${params.strategyId}`,
			{
				timeout: 10000, // 10 second timeout
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

		// Step 6: Log response (development environment)
		if (import.meta.env.DEV) {
			console.log("[delete strategy] success");
		}

		return {
			success: true,
		};
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
// 4. TanStack Query Hook
// ============================================

/**
 * Mutation options (optional configuration)
 */
export interface UseDeleteStrategyOptions {
	/**
	 * Metadata configuration (for controlling global toast behavior)
	 * Uses standard MutationMeta interface
	 */
	meta?: MutationMeta;
	/**
	 * Success callback
	 */
	onSuccess?: () => void;
	/**
	 * Error callback
	 */
	onError?: (error: Error) => void;
	/**
	 * Settled callback (called regardless of success or failure)
	 */
	onSettled?: () => void;
}

export function useDeleteStrategy(options?: UseDeleteStrategyOptions) {
	const queryClient = useQueryClient();

	const { meta, onSuccess, onError, onSettled } = options || {};

	return useMutation({
		// Mutation function
		mutationFn: (params: DeleteStrategyRequest) => deleteStrategyApi(params),

		// ✅ Pass toast configuration to global MutationCache via meta
		meta: {
			successMessage: meta?.successMessage,
			showSuccessToast: meta?.showSuccessToast,
			errorMessage: meta?.errorMessage,
			showErrorToast: meta?.showErrorToast,
		},

		// Success callback (only handles data and cache, not toast)
		onSuccess: () => {
			// 1. Invalidate strategy list cache, trigger refetch
			queryClient.invalidateQueries({
				queryKey: strategyKeys.lists(),
			});

			// 2. Execute user-defined success callback
			onSuccess?.();

			// 3. Development environment log
			if (import.meta.env.DEV) {
				console.log("[delete strategy] cache invalidated");
			}
		},

		// Error callback (only handles business logic, not toast)
		onError: (error: Error) => {
			// Execute user-defined error callback
			onError?.(error);

			// Development environment log (detailed error already logged in global MutationCache)
			if (import.meta.env.DEV) {
				console.error("[delete strategy] error:", error);
			}
		},

		// Settled callback (called regardless of success or failure)
		onSettled: () => {
			onSettled?.();
		},
	});
}
