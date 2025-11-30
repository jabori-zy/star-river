import type { Node } from "@xyflow/react";
import type { TFunction } from "i18next";
import type { SelectedAccount } from "@/types/strategy";
import type { NodeDataBase } from ".";
import type { ConditionTrigger } from "@/types/condition-trigger";
// 仓位操作类型
export enum PositionOperation {
	CloseAllPositions = "CloseAllPositions", // 全部平仓
	CLOSE_POSITION = "ClosePosition", // 平仓
	PARTIALLY_CLOSE_POSITION = "PartiallyClosePosition", // 部分平仓
}

// 获取仓位操作类型标签
export const getPositionOperationLabel = (
	operation: PositionOperation,
	t: TFunction,
): string => {
	const labels: Record<PositionOperation, string> = {
		[PositionOperation.CloseAllPositions]: t("positionNode.operation.closeAllPositions"),
		[PositionOperation.CLOSE_POSITION]: t("positionNode.operation.closePosition"),
		[PositionOperation.PARTIALLY_CLOSE_POSITION]: t("positionNode.operation.partiallyClosePosition"),
	};
	return labels[operation];
};


export interface PositionOperationMetadata {
	label: string;
	description: string;
	shouldSelectSymbol: boolean;

}

export const getPositionOperationMetadataMap = (t: TFunction): Record<PositionOperation, PositionOperationMetadata> => ({
	[PositionOperation.CloseAllPositions]: {
		label: getPositionOperationLabel(PositionOperation.CloseAllPositions, t),
		description: t("positionNode.operation.closeAllPositionsDescription"),
		shouldSelectSymbol: false,
	},
	[PositionOperation.CLOSE_POSITION]: {
		label: getPositionOperationLabel(PositionOperation.CLOSE_POSITION, t),
		description: t("positionNode.operation.closePositionDescription"),
		shouldSelectSymbol: true,
	},
	[PositionOperation.PARTIALLY_CLOSE_POSITION]: {
		label: getPositionOperationLabel(PositionOperation.PARTIALLY_CLOSE_POSITION, t),
		description: t("positionNode.operation.partiallyClosePositionDescription"),
		shouldSelectSymbol: true,
	},
});

export const shouldSelectSymbol = (operation: PositionOperation, t: TFunction): boolean => {
	return getPositionOperationMetadataMap(t)[operation].shouldSelectSymbol;
};















// 仓位操作配置
export type PositionOperationConfig = {
	configId: number; // 配置ID
	inputHandleId: string; // 输入handleId
	symbol: string | null; // 交易对(可以不配置)
	positionOperation: PositionOperation; // 操作类型
	operationName: string; // 操作名称
	triggerConfig: ConditionTrigger | null; // 触发条件
};

// 实盘仓位管理配置
export type PositionLiveConfig = {
	selectedAccount: SelectedAccount | null; // 账户选择
	positionOperations: PositionOperationConfig[]; // 操作列表
};

// 模拟仓位管理配置
export type PositionSimulateConfig = {
	selectedAccount: SelectedAccount | null; // 模拟账户选择
	positionOperations: PositionOperationConfig[]; // 操作列表
};

// 回测仓位管理配置
export type PositionBacktestConfig = {
	selectedAccount: SelectedAccount | null; // 回测账户选择
	positionOperations: PositionOperationConfig[]; // 操作列表
};

export type PositionNodeData = NodeDataBase & {
	liveConfig?: PositionLiveConfig;
	simulateConfig?: PositionSimulateConfig;
	backtestConfig?: PositionBacktestConfig;
};

export type PositionNode = Node<
	PositionNodeData,
	"positionNode"
>;
