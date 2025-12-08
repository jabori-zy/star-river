import type { Node } from "@xyflow/react";
import type { TFunction } from "i18next";
import type { NodeType } from "@/types/node/index";
import { VariableValueType } from "@/types/variable";
import type { NodeDataBase } from ".";

// Conditional node backtest mode configuration
export type IfElseNodeBacktestConfig = {
	cases: CaseItem[];
};

export type IfElseNodeLiveConfig = {
	cases: CaseItem[];
};

export type IfElseNodeSimulateConfig = {
	cases: CaseItem[];
};

// Conditional node data
export type IfElseNodeData = NodeDataBase & {
	// Conditional configuration for different trading modes
	liveConfig?: IfElseNodeLiveConfig;
	simulateConfig?: IfElseNodeSimulateConfig;
	backtestConfig?: IfElseNodeBacktestConfig;
	isNested: boolean; // is nested if-else node
};

// Condition group
export type CaseItem = {
	caseId: number; // caseId
	outputHandleId: string | null; // case output handleId
	logicalSymbol: LogicalSymbol | null; // Logical operator
	conditions: Condition[]; // Condition list
};

// Condition
export type Condition = {
	conditionId: number; // Condition id
	left: Variable | null; // Left variable
	comparisonSymbol: ComparisonSymbol | null; // Comparison operator
	right: Variable | Constant | null; // Right variable
};

// Comparison operator
export enum ComparisonSymbol {
	equal = "=",
	notEqual = "!=",
	greaterThan = ">",
	lessThan = "<",
	greaterThanOrEqual = ">=",
	lessThanOrEqual = "<=",
	is = "is", // Is
	isNot = "is not", // Is not
	like = "like", // Fuzzy match
	notLike = "not like", // Not fuzzy match
	contains = "contains", // Contains
	notContains = "not contains", // Does not contain
	isIn = "is in", // Is in
	isNotIn = "is not in", // Is not in
	isEmpty = "is empty", // Is empty
	isNotEmpty = "is not empty", // Is not empty
}

/**
 * Get available comparison operators based on variable type
 */
export const getAvailableComparisonSymbols = (
	varValueType: VariableValueType,
): ComparisonSymbol[] => {
	switch (varValueType) {
		case VariableValueType.NUMBER:
			return [
				ComparisonSymbol.equal,
				ComparisonSymbol.notEqual,
				ComparisonSymbol.greaterThan,
				ComparisonSymbol.lessThan,
				ComparisonSymbol.greaterThanOrEqual,
				ComparisonSymbol.lessThanOrEqual,
				ComparisonSymbol.isIn,
				ComparisonSymbol.isNotIn,
			];

		case VariableValueType.STRING:
			return [
				ComparisonSymbol.is,
				ComparisonSymbol.isNot,
				ComparisonSymbol.like,
				ComparisonSymbol.notLike,
				ComparisonSymbol.isEmpty,
				ComparisonSymbol.isNotEmpty,
				ComparisonSymbol.isIn,
				ComparisonSymbol.isNotIn,
			];

		case VariableValueType.BOOLEAN:
			return [
				ComparisonSymbol.is,
				ComparisonSymbol.isNot,
				ComparisonSymbol.isIn,
				ComparisonSymbol.isNotIn,
			];

		case VariableValueType.TIME:
			return [
				ComparisonSymbol.equal,
				ComparisonSymbol.notEqual,
				ComparisonSymbol.greaterThan,
				ComparisonSymbol.lessThan,
				ComparisonSymbol.greaterThanOrEqual,
				ComparisonSymbol.lessThanOrEqual,
				ComparisonSymbol.isIn,
				ComparisonSymbol.isNotIn,
			];
		case VariableValueType.ENUM:
			return [
				ComparisonSymbol.contains,
				ComparisonSymbol.notContains,
				ComparisonSymbol.isEmpty,
				ComparisonSymbol.isNotEmpty,
			];

		case VariableValueType.PERCENTAGE:
			return [
				ComparisonSymbol.equal,
				ComparisonSymbol.notEqual,
				ComparisonSymbol.greaterThan,
				ComparisonSymbol.lessThan,
				ComparisonSymbol.greaterThanOrEqual,
				ComparisonSymbol.lessThanOrEqual,
				ComparisonSymbol.isIn,
				ComparisonSymbol.isNotIn,
			];

		default:
			// Default return basic operators
			return [ComparisonSymbol.equal, ComparisonSymbol.notEqual];
	}
};

/**
 * Get display text for comparison operator
 */
export const getComparisonSymbolLabel = (
	symbol: ComparisonSymbol,
	t: TFunction,
): string => {
	const labels: Record<ComparisonSymbol, string> = {
		[ComparisonSymbol.equal]: t("ifElseNode.comparisonSymbols.equal"),
		[ComparisonSymbol.notEqual]: t("ifElseNode.comparisonSymbols.notEqual"),
		[ComparisonSymbol.greaterThan]: t(
			"ifElseNode.comparisonSymbols.greaterThan",
		),
		[ComparisonSymbol.lessThan]: t("ifElseNode.comparisonSymbols.lessThan"),
		[ComparisonSymbol.greaterThanOrEqual]: t(
			"ifElseNode.comparisonSymbols.greaterThanOrEqual",
		),
		[ComparisonSymbol.lessThanOrEqual]: t(
			"ifElseNode.comparisonSymbols.lessThanOrEqual",
		),
		[ComparisonSymbol.is]: t("ifElseNode.comparisonSymbols.is"),
		[ComparisonSymbol.isNot]: t("ifElseNode.comparisonSymbols.isNot"),
		[ComparisonSymbol.like]: t("ifElseNode.comparisonSymbols.like"),
		[ComparisonSymbol.notLike]: t("ifElseNode.comparisonSymbols.notLike"),
		[ComparisonSymbol.isIn]: t("ifElseNode.comparisonSymbols.isIn"),
		[ComparisonSymbol.isNotIn]: t("ifElseNode.comparisonSymbols.isNotIn"),
		[ComparisonSymbol.isEmpty]: t("ifElseNode.comparisonSymbols.isEmpty"),
		[ComparisonSymbol.isNotEmpty]: t("ifElseNode.comparisonSymbols.isNotEmpty"),
		[ComparisonSymbol.contains]: t("ifElseNode.comparisonSymbols.contains"),
		[ComparisonSymbol.notContains]: t(
			"ifElseNode.comparisonSymbols.notContains",
		),
	};
	return labels[symbol];
};

// Logical operator
export enum LogicalSymbol {
	AND = "and",
	Or = "or",
}

// Variable type
export enum VarType {
	variable = "variable", // Variable
	constant = "constant", // Constant
}

// Left variable
export type Variable = {
	varType: VarType | null; // Variable type
	nodeId: string | null; // Node id (the node id where this variable originates from)
	nodeName: string | null; // Node name
	nodeType: NodeType | null; // Node type
	outputHandleId: string | null; // Variable output handleId
	varConfigId: number | null; // Variable configuration id (indicator configuration id, kline configuration id)
	varName: string | null; // Variable, if constant, the value is the constant value
	varDisplayName: string | null; // Variable name (user-set variable name, or default name)
	varValueType: VariableValueType; // Variable value type
	extraInfo?: Record<string, string | number | boolean | null> | null; // Extra info
};

export type Constant = {
	varType: VarType.constant;
	varValueType: VariableValueType;
	varValue: number | string | boolean | string[];
};

export type IfElseNode = Node<IfElseNodeData, "ifElseNode">;
