import { Node } from '@xyflow/react';
import { SelectedAccount } from './strategy';
// 策略系统变量
export enum StrategySysVariable {
    POSITION_NUMBER = "position_number", // 持仓数量
    Filled_ORDER_NUMBER = "filled_order_number", // 已成交订单数量
}


export type VariableValue = number | string | boolean;

export type GetVariableConfig = {
    configId: number;
    variableName: string; // 变量名称
    variable: string; // 变量类型，使用StrategySysVariable的值
    variableValue: VariableValue; // 变量值
}

export type GetVariableNodeLiveConfig = {
    selectedLiveAccount: SelectedAccount | null; // 账户选择
    symbol: string | null; // 交易对
    variables: GetVariableConfig[];
}

export type GetVariableNodeSimulateConfig = {
    selectedSimulateAccount: SelectedAccount | null; // 账户选择
    symbol: string | null; // 交易对
    variables: GetVariableConfig[];
}

export type GetVariableNodeBacktestConfig = {
    symbol: string | null; // 交易对
    variables: GetVariableConfig[];
}

export type GetVariableNodeData = {
    strategyId: number;
    nodeName: string | null;
    liveConfig?: GetVariableNodeLiveConfig;
    simulateConfig?: GetVariableNodeSimulateConfig;
    backtestConfig?: GetVariableNodeBacktestConfig;
}

export type GetVariableNode = Node<
    GetVariableNodeData,
    'getVariable'
>;