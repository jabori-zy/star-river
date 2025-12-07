import type {
	DataflowErrorPolicy,
	DataflowErrorType,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import type { VariableValue } from "@/types/node/variable-node/variable-config-types";

/**
 * Validate if replace value is valid (e.g., division operation cannot be 0)
 */
export function validateReplaceValue(
	errorType: DataflowErrorType,
	replaceValue: VariableValue,
	updateOperationType?: UpdateVarValueOperation,
): string | null {
	if (
		updateOperationType === "divide" &&
		(errorType === "nullValue" ||
			errorType === "zeroValue" ||
			errorType === "expired")
	) {
		const numValue = Number(replaceValue);
		if (numValue === 0) {
			return "Denominator cannot be 0";
		}
	}
	return null;
}

/**
 * Check if specific error type configuration has validation errors
 */
export function getErrorTypeValidationError(
	errorType: DataflowErrorType,
	errorPolicy: Partial<Record<DataflowErrorType, DataflowErrorPolicy>>,
	updateOperationType?: UpdateVarValueOperation,
): string | null {
	const policy = errorPolicy[errorType];
	if (policy?.strategy === "valueReplace") {
		return validateReplaceValue(
			errorType,
			policy.replaceValue,
			updateOperationType,
		);
	}
	return null;
}
