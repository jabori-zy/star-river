import {
	type ComparisonSymbol,
	LogicalSymbol,
	type Variable,
	VarType,
} from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { Node } from "@xyflow/react";
import type { KlineNodeData } from "@/types/node/kline-node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import { useTranslation } from "react-i18next";

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
export const getVariableLabel = (variable: Variable | null, nodes: Node[], t: (key: string) => string) => {
	if (!variable) return t("notSet");
	if (variable.varType === VarType.constant) {
		return `${variable.variable}`;
	} 
	
	else if (variable.varType === VarType.variable) {
		if (!variable.nodeName || !variable.variable || !variable.variableConfigId) {
			return t ? t("IfElseNode.notSet") : "Not set";
		}

		console.log("111", variable);
		if (variable.nodeType === NodeType.KlineNode) {
			return getKlineNodeVariableLabel(variable, nodes, t);
		} else if (variable.nodeType === NodeType.IndicatorNode) {
			return getIndicatorNodeVariableLabel(variable, nodes, t);
		}
		else if (variable.nodeType === NodeType.VariableNode) {
			return getVariableNodeVariableLable(variable, t);
		}
	}

	return t ? t("IfElseNode.notSet") : "Not set";
};



export const getKlineNodeVariableLabel = (variable: Variable, nodes: Node[], t: (key: string) => string) => {
		const klineNode = nodes.find((node) => node.id === variable.nodeId);
		const klineNodeData = klineNode?.data as KlineNodeData;
		const selectedSymbols = klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;
		const selectedSymbol = selectedSymbols?.find((symbol) => symbol.configId === variable.variableConfigId);
		if (selectedSymbol) {
			return `${selectedSymbol.symbol}-${selectedSymbol.interval}-${variable.variableName}`;
		}
	return t ? t("IfElseNode.notSet") : "Not set";
}


export const getIndicatorNodeVariableLabel = (variable: Variable, nodes: Node[], t: (key: string) => string) => {
	const indicatorNode = nodes.find((node) => node.id === variable.nodeId);
	const indicatorNodeData = indicatorNode?.data as IndicatorNodeData;
	const selectedIndicators = indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedIndicators;
	const selectedIndicator = selectedIndicators?.find((indicator) => indicator.configId === variable.variableConfigId);
	if (selectedIndicator) {
		return `${t("IfElseNode.indicator")}${variable.variableConfigId}-${selectedIndicator.indicatorType}-${variable.variableName}`;
	}
	return t ? t("IfElseNode.notSet") : "Not set";
}


export const getVariableNodeVariableLable = (variable: Variable, t: (key: string) => string) => {
	
	return `${t("IfElseNode.variable")}${variable.variableConfigId}-${variable.variableName}`;
}