import type { Node } from "@xyflow/react";
import type { BacktestDataSource, SelectedAccount } from "@/types/strategy";
import type { VariableValueType } from "@/types/variable";
import type { NodeDataBase } from "..";
import type { TriggerConfig } from "./trigger-types";
import type { UpdateVarValueOperation } from "./variable-operation-types";

type BaseVariableConfig = {
	configId: number;
	inputHandleId: string;
	outputHandleId: string;
	varType: "system" | "custom";
	varName: string;
	varDisplayName: string;
	varValueType: VariableValueType;
	triggerConfig: TriggerConfig;
};

export type VariableValue = string | number | boolean | string[] | null;

export type InitialVariableValue = string | number | boolean | string[]; // 初始值不能为空

export type GetSystemVariableConfig = BaseVariableConfig & {
	varOperation: "get";
	varType: "system";
	symbol?: string | null;
	varValue: VariableValue;
};

export type GetCustomVariableConfig = BaseVariableConfig & {
	varOperation: "get";
	varType: "custom";
	varValue: VariableValue;
};

export type GetVariableConfig =
	| GetSystemVariableConfig
	| GetCustomVariableConfig;

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
	updateVarValueOperation: UpdateVarValueOperation;
	updateOperationValue: VariableValue;
};

export type ResetVariableConfig = BaseVariableConfig & {
	varOperation: "reset";
	varInitialValue: InitialVariableValue;
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

export type VariableNodeData = NodeDataBase & {
	liveConfig?: VariableNodeLiveConfig;
	simulateConfig?: VariableNodeSimulateConfig;
	backtestConfig?: VariableNodeBacktestConfig;
};

export type VariableNode = Node<VariableNodeData, "variableNode">;
