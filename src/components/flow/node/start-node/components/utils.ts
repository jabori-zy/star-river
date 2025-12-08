import { VariableValueType } from "@/types/variable";

/**
 * Format variable value display
 * @param value - Variable value
 * @param type - Variable type
 * @returns Formatted string
 */
export const formatVariableValue = (
	value: string | number | boolean | string[] | null,
	type: VariableValueType,
): string => {
	if (type === VariableValueType.BOOLEAN) {
		return value ? "True" : "False";
	}
	if (type === VariableValueType.STRING) {
		return `"${value}"`;
	}
	if (type === VariableValueType.ENUM) {
		return Array.isArray(value)
			? `[${value.map((v) => `"${v}"`).join(", ")}]`
			: "[]";
	}
	if (type === VariableValueType.PERCENTAGE) {
		return `${value}%`;
	}
	return value?.toString() || "";
};
