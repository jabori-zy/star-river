import type {
	DataflowErrorPolicy,
	DataflowErrorType,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import type { VariableValue } from "@/types/node/variable-node/variable-config-types";

/**
 * 验证替换值是否有效（例如：除法操作不能为0）
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
			return "分母不能为0";
		}
	}
	return null;
}

/**
 * 检测特定错误类型的配置是否有验证错误
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
