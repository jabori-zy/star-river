import type { Node } from "@xyflow/react";
import {
	type ComparisonSymbol,
	LogicalSymbol,
	type Variable,
	VarType,
} from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData } from "@/types/node/kline-node";

// 获取条件类型的中文标签
export const getCaseTypeLabel = (caseId: number) => {
	return caseId === 1 ? "IF" : "ELIF";
};

// 获取比较符号 - 直接返回符号
export const getComparisonLabel = (symbol: ComparisonSymbol | null) => {
	if (!symbol) return "";
	return symbol;
};

// 获取逻辑符号的中文标签
export const getLogicalLabel = (symbol: LogicalSymbol | null) => {
	if (!symbol) return "";
	const logicalMap: Record<LogicalSymbol, string> = {
		[LogicalSymbol.AND]: "AND",
		[LogicalSymbol.Or]: "OR",
	};
	return logicalMap[symbol] || symbol;
};

// 获取变量显示文本
export const getVariableLabel = (
	variable: Variable | null,
	nodes: Node[],
	t: (key: string) => string,
) => {
	if (!variable) return t("IfElseNode.notSet");
	if (variable.varType === VarType.constant) {
		if (!variable.varName) {
			return "0";
		}
		return `${variable.varName}`;
	} else if (variable.varType === VarType.variable) {
		if (!variable.nodeName || !variable.varName || !variable.varConfigId) {
			return t("IfElseNode.notSet");
		}

		if (variable.nodeType === NodeType.KlineNode) {
			return getKlineNodeVariableLabel(variable, nodes, t);
		} else if (variable.nodeType === NodeType.IndicatorNode) {
			return getIndicatorNodeVariableLabel(variable, nodes, t);
		} else if (variable.nodeType === NodeType.VariableNode) {
			return getVariableNodeVariableLable(variable, t);
		}
	}

	return t("IfElseNode.notSet");
};

export const getKlineNodeVariableLabel = (
	variable: Variable,
	nodes: Node[],
	t: (key: string) => string,
) => {
	const klineNode = nodes.find((node) => node.id === variable.nodeId);
	const klineNodeData = klineNode?.data as KlineNodeData;
	const selectedSymbols =
		klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;
	const selectedSymbol = selectedSymbols?.find(
		(symbol) => symbol.configId === variable.varConfigId,
	);
	if (selectedSymbol) {
		return `${selectedSymbol.symbol}/${selectedSymbol.interval}/${variable.varDisplayName}`;
	}
	return t("IfElseNode.notSet");
};

export const getIndicatorNodeVariableLabel = (
	variable: Variable,
	nodes: Node[],
	t: (key: string) => string,
) => {
	const indicatorNode = nodes.find((node) => node.id === variable.nodeId);
	const indicatorNodeData = indicatorNode?.data as IndicatorNodeData;
	const selectedIndicators =
		indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedIndicators;
	const selectedIndicator = selectedIndicators?.find(
		(indicator) => indicator.configId === variable.varConfigId,
	);
	if (selectedIndicator) {
		return `${selectedIndicator.indicatorType}-${variable.varDisplayName}`;
	}
	return t("IfElseNode.notSet");
};

export const getVariableNodeVariableLable = (
	variable: Variable,
	_t: (key: string) => string,
) => {
	return `${variable.varDisplayName}`;
};

// 获取节点类型图标
export const getNodeTypeIcon = (nodeType?: NodeType) => {
	switch (nodeType) {
		case NodeType.KlineNode:
			return "📊";
		case NodeType.IndicatorNode:
			return "📈";
		case NodeType.VariableNode:
			return "🔢";
		case NodeType.FuturesOrderNode:
			return "💰";
		default:
			return "❓";
	}
};

// 获取节点类型的中文标签
export const getNodeTypeLabel = (nodeType?: NodeType | null) => {
	switch (nodeType) {
		case NodeType.KlineNode:
			return "k线";
		case NodeType.IndicatorNode:
			return "指标";
		case NodeType.VariableNode:
			return "变量";
		case NodeType.FuturesOrderNode:
			return "订单";
		default:
			return "配置";
	}
};

// 获取变量的 Tooltip 文本
export const getVariableTooltipLabel = (
	variable: Variable | null,
	t: (key: string) => string,
) => {
	if (!variable) return t("IfElseNode.notSet");
	
	if (variable.varType === VarType.constant) {
		return variable.varName ? String(variable.varName) : "0";
	}
	
	if (variable.nodeName && variable.varConfigId) {
		const typeLabel = getNodeTypeLabel(variable.nodeType);
		return `${variable.nodeName}-${typeLabel}${variable.varConfigId}`;
	}
	
	return t("IfElseNode.notSet");
};
