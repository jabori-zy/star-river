import axios, { type AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL, type ApiResponse, ApiError, type MutationMeta } from "@/service/index";

const API_VERSION = "api/v1";
const ROUTER = "strategy";
const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}/backtest`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Initialize backtest strategy request parameters
 */
export interface InitBacktestStrategyRequest {
	strategyId: number;
}

/**
 * Initialize backtest strategy response
 */
export interface InitBacktestStrategyResponse {
	success: boolean;
}

// ============================================
// 2. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Initialize backtest strategy API call (without UI logic)
 *
 * @param params Initialize parameters
 * @returns Initialize result
 */
export async function initBacktestStrategyApi(
	params: InitBacktestStrategyRequest,
): Promise<InitBacktestStrategyResponse> {
	// Step 1: Parameter validation
	if (!params.strategyId || params.strategyId <= 0) {
		throw new Error("Invalid strategy ID");
	}

	// Step 2: Log request (development environment)
	if (import.meta.env.DEV) {
		console.log("[init backtest strategy] strategyId:", params.strategyId);
	}

	try {
		// Step 3: Send POST request
		const response = await axios.post<ApiResponse<InitBacktestStrategyResponse>>(
			`${API_URL}/${params.strategyId}/init`,
			{},
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

		// Step 6: Log response (development environment)
		if (import.meta.env.DEV) {
			console.log("[init backtest strategy] success");
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
			let errorCode: string | undefined = undefined;
			let errorCodeChain: string[] | undefined = undefined;

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
 * Mutation options (optional configuration)
 */
export interface UseInitBacktestStrategyOptions {
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
	 * Settled callback (executed regardless of success or failure)
	 */
	onSettled?: () => void;
}

/**
 * React Query Hook for initializing backtest strategy
 */
export function useInitBacktestStrategy(options?: UseInitBacktestStrategyOptions) {

	const { meta, onSuccess, onError, onSettled } = options || {};

	return useMutation({
		// Mutation function
		mutationFn: (params: InitBacktestStrategyRequest) => initBacktestStrategyApi(params),

		// Pass toast configuration to global MutationCache via meta
		meta: {
			successMessage: meta?.successMessage,
			showSuccessToast: meta?.showSuccessToast,
			errorMessage: meta?.errorMessage,
			showErrorToast: meta?.showErrorToast,
		},

		// Success callback (only handles data and cache, not toast)
		onSuccess: () => {
			// Execute user-defined success callback
			onSuccess?.();

			// Development environment log
			if (import.meta.env.DEV) {
				console.log("[init backtest strategy] mutation success");
			}
		},

		// Error callback (only handles business logic, not toast)
		onError: (error: Error) => {
			// Execute user-defined error callback
			onError?.(error);

			// Development environment log (detailed error already logged in global MutationCache)
			if (import.meta.env.DEV) {
				console.error("[init backtest strategy] mutation error:", error);
			}
		},

		// Settled callback (executed regardless of success or failure)
		onSettled: () => {
			onSettled?.();
		},
	});
}
