import type { UpdateVarValueOperation } from "@/types/node/variable-node";

// 获取更新操作类型的标签
export const getUpdateOperationLabel = (type: UpdateVarValueOperation, t:(key: string) => string): string => {
	const labels: Record<UpdateVarValueOperation, string> = {
		set: "=",
		add: "+",
		subtract: "-",
		multiply: "×",
		divide: "÷",
		max: t("variableNode.max"),
		min: t("variableNode.min"),
		toggle: t("variableNode.toggle"),
		append: t("variableNode.append"),
		remove: t("variableNode.remove"),
		clear: t("variableNode.clear"),
	};
	return labels[type];
};
