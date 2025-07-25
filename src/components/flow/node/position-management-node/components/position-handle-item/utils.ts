import {
	PositionOperation,
	PositionOperationConfig,
} from "@/types/node/position-management-node";

// 获取仓位操作类型的中文标签
export const getPositionOperationLabel = (operation: PositionOperation) => {
	const operationMap: Record<PositionOperation, string> = {
		[PositionOperation.UPDATE]: "更新仓位",
		[PositionOperation.CLOSEALL]: "全部平仓",
	};
	return operationMap[operation] || operation;
};

// 获取操作配置的简要描述
export const getOperationDescription = (operationConfig: {
	symbol: string | null;
	positionOperation: PositionOperation;
	positionOperationName: string;
}) => {
	const operationLabel = getPositionOperationLabel(
		operationConfig.positionOperation,
	);
	const symbolText = operationConfig.symbol || "全部交易对";
	return `${symbolText} - ${operationLabel}`;
};

// 获取操作配置的状态标签
export const getOperationStatusLabel = (
	config: PositionOperationConfig,
): string => {
	if (!config.positionOperationName?.trim()) {
		return "未设置名称";
	}
	if (!config.positionOperation) {
		return "未选择操作";
	}
	return "配置完成";
};

// 格式化交易对显示
export const formatSymbolDisplay = (symbol: string | null): string => {
	return symbol || "全部交易对";
};
