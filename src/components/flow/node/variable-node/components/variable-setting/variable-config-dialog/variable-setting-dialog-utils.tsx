import type { UpdateOperationType } from "@/types/node/variable-node";

// 获取更新操作类型的标签
export const getUpdateOperationLabel = (type: UpdateOperationType): string => {
	const labels: Record<UpdateOperationType, string> = {
		set: "=",
		add: "+",
		subtract: "-",
		multiply: "×",
		divide: "÷",
		max: "max",
		min: "min",
		toggle: "Toggle",
		append: "添加",
		remove: "删除",
		clear: "清空",
	};
	return labels[type];
};
