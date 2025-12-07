import type { Node } from "@xyflow/react";
import type { TFunction } from "i18next";
import { getNodeTypeLabel } from "@/components/flow/node/node-utils";
import {
	type ComparisonSymbol,
	type Constant,
	getComparisonSymbolLabel,
	LogicalSymbol,
	type Variable,
	VarType,
} from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData } from "@/types/node/kline-node";
import { VariableValueType } from "@/types/variable";

// Get the label for condition type
export const getCaseTypeLabel = (caseId: number) => {
	return caseId === 1 ? "IF" : "ELIF";
};

// Get comparison symbol - directly return the symbol
export const getComparisonLabel = (
	symbol: ComparisonSymbol | null,
	t: TFunction,
) => {
	if (!symbol) return "";
	return getComparisonSymbolLabel(symbol, t);
};

// Get the label for logical symbol
export const getLogicalLabel = (symbol: LogicalSymbol | null) => {
	if (!symbol) return "";
	const logicalMap: Record<LogicalSymbol, string> = {
		[LogicalSymbol.AND]: "AND",
		[LogicalSymbol.Or]: "OR",
	};
	return logicalMap[symbol] || symbol;
};

// Get variable display text
const formatConstantValue = (constant: Constant): string => {
	const { varValue } = constant;

	if (
		constant.varValueType === VariableValueType.ENUM &&
		Array.isArray(varValue)
	) {
		if (varValue.length === 0) {
			return "[]";
		}
		// Only display the first 5 elements
		if (varValue.length > 5) {
			const displayValues = varValue.slice(0, 5);
			return `${displayValues.join(", ")}...`;
		}
		return varValue.join(", ");
	} else if (constant.varValueType === VariableValueType.PERCENTAGE) {
		return `${varValue}%`;
	} else {
		return String(varValue);
	}
};

export const getVariableLabel = (
	variable: Variable | Constant | null,
	nodes: Node[],
	t: (key: string) => string,
) => {
	if (!variable) return t("ifElseNode.notSet");
	if (variable.varType === VarType.constant) {
		const formattedValue = formatConstantValue(variable as Constant);
		return formattedValue === "" ? t("ifElseNode.notSet") : formattedValue;
	} else if (variable.varType === VarType.variable) {
		if (!variable.nodeName || !variable.varName || !variable.varConfigId) {
			return t("ifElseNode.notSet");
		}

		if (variable.nodeType === NodeType.KlineNode) {
			return getKlineNodeVariableLabel(variable, nodes, t);
		} else if (variable.nodeType === NodeType.IndicatorNode) {
			return getIndicatorNodeVariableLabel(variable, nodes, t);
		} else if (variable.nodeType === NodeType.VariableNode) {
			return getVariableNodeVariableLable(variable, t);
		}
	}

	return t("ifElseNode.notSet");
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
	return t("ifElseNode.notSet");
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
	return t("ifElseNode.notSet");
};

export const getVariableNodeVariableLable = (
	variable: Variable,
	_t: (key: string) => string,
) => {
	return `${variable.varDisplayName}`;
};

// Get variable Tooltip text
export const getVariableTooltipLabel = (
	variable: Variable | Constant | null,
	t: (key: string) => string,
) => {
	if (!variable) return t("ifElseNode.notSet");

	if (variable.varType === VarType.constant) {
		const formattedValue = formatConstantValue(variable as Constant);
		return formattedValue === "" ? t("ifElseNode.notSet") : formattedValue;
	}

	if (variable.nodeName && variable.varConfigId) {
		const typeLabel = getNodeTypeLabel(variable.nodeType, t);
		return `${variable.nodeName}-${typeLabel}${variable.varConfigId}`;
	}

	return t("ifElseNode.notSet");
};
