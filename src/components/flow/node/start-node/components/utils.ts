import { VariableValueType } from "@/types/variable";

/**
 * 格式化变量值显示
 * @param value - 变量值
 * @param type - 变量类型
 * @returns 格式化后的字符串
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
