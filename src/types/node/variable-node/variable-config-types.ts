import type { Node } from "@xyflow/react";
import type { BacktestDataSource, SelectedAccount } from "@/types/strategy";
import type { VariableValueType } from "@/types/variable";
import type { TriggerConfig } from "./trigger-types";
import type { UpdateOperationType } from "./variable-operation-types";

type BaseVariableConfig = {
	configId: number;
	inputHandleId: string;
	outputHandleId: string;
	varType: "system" | "custom";
	varName: string;
	varDisplayName: string;
	varValueType: VariableValueType;
};

export type GetSystemVariableConfig = BaseVariableConfig & {
	varOperation: "get";
	varType: "system";
	symbol?: string | null;
	triggerConfig: TriggerConfig;
	varValue: string | number | boolean | string[];
};

export type GetCustomVariableConfig = BaseVariableConfig & {
	varOperation: "get";
	varType: "custom";
	triggerConfig: TriggerConfig;
	varValue: string | number | boolean | string[];
};

export type GetVariableConfig = GetSystemVariableConfig | GetCustomVariableConfig;

export function isGetSystemVariableConfig(
	config: GetVariableConfig,
): config is GetSystemVariableConfig {
	return config.varType === "system";
}

export function isGetCustomVariableConfig(
	config: GetVariableConfig,
): config is GetCustomVariableConfig {
	return config.varType === "custom";
}

export type UpdateVariableConfig = BaseVariableConfig & {
	varOperation: "update";
	updateOperationType: UpdateOperationType;
	triggerConfig: TriggerConfig;
	updateOperationValue: string | number | boolean | string[] | null;
};

export type ResetVariableConfig = BaseVariableConfig & {
	varOperation: "reset";
	triggerConfig: TriggerConfig;
	varInitialValue: string | number | boolean | string[];
};

export type VariableConfig =
	| GetVariableConfig
	| UpdateVariableConfig
	| ResetVariableConfig;

export type VariableNodeLiveConfig = {
	selectedAccount: SelectedAccount | null;
	variableConfigs: VariableConfig[];
};

export type VariableNodeSimulateConfig = {
	selectedAccount: SelectedAccount | null;
	variableConfigs: VariableConfig[];
};

export type VariableNodeBacktestExchangeModeConfig = {
	selectedAccount: SelectedAccount;
};

export type VariableNodeBacktestConfig = {
	dataSource: BacktestDataSource;
	exchangeModeConfig?: VariableNodeBacktestExchangeModeConfig;
	variableConfigs: VariableConfig[];
};

export type VariableNodeData = {
	strategyId: number;
	nodeName: string;
	liveConfig?: VariableNodeLiveConfig;
	simulateConfig?: VariableNodeSimulateConfig;
	backtestConfig?: VariableNodeBacktestConfig;
};

export type VariableNode = Node<VariableNodeData, "variableNode">;

export const ensureTriggerConfigForVariableConfig = (
	config: VariableConfig,
): VariableConfig => {
	if (config.triggerConfig !== undefined) {
		return config;
	}

	return {
		...config,
		triggerConfig: null,
	};
};

export const ensureTriggerConfigForVariableConfigs = (
	configs: VariableConfig[] | undefined,
): VariableConfig[] => {
	if (!configs) return [];
	return configs.map((item) => ensureTriggerConfigForVariableConfig(item));
};
