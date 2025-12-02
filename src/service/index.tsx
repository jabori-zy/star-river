export const API_BASE_URL: string =
	import.meta.env.VITE_API_URL || "http://localhost:3100";

// ============================================
// API Response Type Definitions (corresponds to Rust backend's ApiResponseEnum)
// ============================================

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T> {
	success: true;
	timestamp: string;
	data: T;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
	success: false;
	timestamp: string;
	message: string;
	errorCode: string;
	errorCodeChain: string[];
}

/**
 * API Response Union Type (corresponds to Rust's ApiResponseEnum)
 * Use type guards to safely access different response fields
 *
 * @example
 * ```ts
 * const response: ApiResponse<Strategy> = await axios.get(...);
 *
 * if (response.success) {
 *   // TypeScript knows there's a data field here
 *   console.log(response.data);
 * } else {
 *   // TypeScript knows there are message and errorCode fields here
 *   console.error(response.message, response.errorCode);
 * }
 * ```
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Custom Error Class
// ============================================

/**
 * API Error Class
 * Extends standard Error class with error code and error code chain from backend
 *
 * @example
 * ```ts
 * throw new ApiError('Operation failed', 'INVALID_INPUT', ['VALIDATION_ERROR', 'INVALID_INPUT']);
 * throw new ApiError('Operation failed'); // errorCode and errorCodeChain default to 'UNKNOWN' and ['UNKNOWN']
 * ```
 */
export class ApiError extends Error {
	/**
	 * Error code
	 */
	public readonly errorCode: string;

	/**
	 * Error code chain
	 */
	public readonly errorCodeChain: string[];

	constructor(message: string, errorCode?: string, errorCodeChain?: string[]) {
		super(message);
		this.name = "ApiError";
		this.errorCode = errorCode ?? "UNKNOWN";
		this.errorCodeChain = errorCodeChain ?? ["UNKNOWN"];

		// Maintain prototype chain (TypeScript/Babel transpilation compatibility)
		Object.setPrototypeOf(this, ApiError.prototype);
	}

	/**
	 * Create ApiError instance from ApiErrorResponse
	 */
	static fromApiErrorResponse(response: ApiErrorResponse): ApiError {
		return new ApiError(
			response.message,
			response.errorCode,
			response.errorCodeChain,
		);
	}

	/**
	 * Format error message (including error code chain)
	 */
	toString(): string {
		return `${this.message}. error code: ${this.errorCode}. error code chain: ${this.errorCodeChain.join(", ")}`;
	}
}

// ============================================
// Mutation Metadata Configuration
// ============================================

/**
 * Standard Mutation Metadata Interface
 * Used to control global MutationCache's Toast behavior
 *
 * @example
 * ```ts
 * const mutation = useMutation({
 *   mutationFn: createStrategy,
 *   meta: {
 *     successMessage: "Created successfully",
 *     showSuccessToast: true,
 *     errorMessage: "Creation failed",
 *     showErrorToast: true,
 *   }
 * });
 * ```
 */
export interface MutationMeta {
	/**
	 * Success message
	 * - If provided and showSuccessToast is not false, will display success toast
	 */
	successMessage?: string;

	/**
	 * Whether to show success toast
	 * - undefined or true: show (default)
	 * - false: don't show
	 */
	showSuccessToast?: boolean;

	/**
	 * Error message prefix
	 * - Will be combined with error details for display
	 */
	errorMessage?: string;

	/**
	 * Whether to show error toast
	 * - undefined or true: show (default)
	 * - false: don't show (for silent operations)
	 */
	showErrorToast?: boolean;
}
