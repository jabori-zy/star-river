import type { Node } from "@xyflow/react";
import type { TFunction } from "i18next";
import type { ConditionTrigger } from "@/types/condition-trigger";
import type { SelectedAccount } from "@/types/strategy";
import type { NodeDataBase } from ".";
// Position operation type
export enum PositionOperation {
	CloseAllPositions = "CloseAllPositions", // Close all positions
	CLOSE_POSITION = "ClosePosition", // Close position
	// PARTIALLY_CLOSE_POSITION = "PartiallyClosePosition", // Partially close position
}

// Get position operation type label
export const getPositionOperationLabel = (
	operation: PositionOperation,
	t: TFunction,
): string => {
	const labels: Record<PositionOperation, string> = {
		[PositionOperation.CloseAllPositions]: t(
			"positionNode.operation.closeAllPositions",
		),
		[PositionOperation.CLOSE_POSITION]: t(
			"positionNode.operation.closePosition",
		),
		// [PositionOperation.PARTIALLY_CLOSE_POSITION]: t("positionNode.operation.partiallyClosePosition"),
	};
	return labels[operation];
};

export interface PositionOperationMetadata {
	label: string;
	description: string;
	shouldSelectSymbol: boolean;
}

export const getPositionOperationMetadataMap = (
	t: TFunction,
): Record<PositionOperation, PositionOperationMetadata> => ({
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
	// [PositionOperation.PARTIALLY_CLOSE_POSITION]: {
	// 	label: getPositionOperationLabel(PositionOperation.PARTIALLY_CLOSE_POSITION, t),
	// 	description: t("positionNode.operation.partiallyClosePositionDescription"),
	// 	shouldSelectSymbol: true,
	// },
});

export const shouldSelectSymbol = (
	operation: PositionOperation,
	t: TFunction,
): boolean => {
	return getPositionOperationMetadataMap(t)[operation].shouldSelectSymbol;
};

// Position operation configuration
export type PositionOperationConfig = {
	configId: number; // Configuration ID
	inputHandleId: string; // Input handleId
	outputHandleIds: string[]; // Output handleIds
	symbol: string | null; // Trading pair (can be unconfigured)
	positionOperation: PositionOperation; // Operation type
	operationName: string; // Operation name
	triggerConfig: ConditionTrigger | null; // Trigger condition
};

// Live position management configuration
export type PositionLiveConfig = {
	selectedAccount: SelectedAccount | null; // Account selection
	positionOperations: PositionOperationConfig[]; // Operation list
};

// Simulated position management configuration
export type PositionSimulateConfig = {
	selectedAccount: SelectedAccount | null; // Simulated account selection
	positionOperations: PositionOperationConfig[]; // Operation list
};

// Backtest position management configuration
export type PositionBacktestConfig = {
	selectedAccount: SelectedAccount | null; // Backtest account selection
	positionOperations: PositionOperationConfig[]; // Operation list
};

export type PositionNodeData = NodeDataBase & {
	liveConfig?: PositionLiveConfig;
	simulateConfig?: PositionSimulateConfig;
	backtestConfig?: PositionBacktestConfig;
};

export type PositionNode = Node<PositionNodeData, "positionNode">;
