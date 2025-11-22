import type { Node } from "@xyflow/react";
import type { NodeType } from "@/types/node/index";
import { VariableValueType } from "@/types/variable";
import { TFunction } from "i18next";
import type { NodeDataBase } from ".";

// 条件判断节点回测模式配置
export type IfElseNodeBacktestConfig = {
	cases: CaseItem[];
};

export type IfElseNodeLiveConfig = {
	cases: CaseItem[];
};

export type IfElseNodeSimulateConfig = {
	cases: CaseItem[];
};

// 条件判断节点数据
export type IfElseNodeData = NodeDataBase & {
	// 针对不同交易模式的条件配置
	liveConfig?: IfElseNodeLiveConfig;
	simulateConfig?: IfElseNodeSimulateConfig;
	backtestConfig?: IfElseNodeBacktestConfig;
	isNested: boolean; // is nested if-else node
};

// 条件组
export type CaseItem = {
	caseId: number; // caseId
	outputHandleId: string | null; // case输出handleId
	logicalSymbol: LogicalSymbol | null; // 逻辑运算符
	conditions: Condition[]; // 条件列表
};

// 条件
export type Condition = {
	conditionId: number; // 条件id
	left: Variable | null; // 左变量
	comparisonSymbol: ComparisonSymbol | null; // 比较运算符
	right: Variable | Constant | null; // 右变量
};

// 比较运算符
export enum ComparisonSymbol {
	equal = "=",
	notEqual = "!=",
	greaterThan = ">",
	lessThan = "<",
	greaterThanOrEqual = ">=",
	lessThanOrEqual = "<=",
	is = "is", // 是
	isNot = "is not", // 不是
	like = "like", // 模糊匹配
	notLike = "not like", // 不模糊匹配
	contains = "contains", // 包含
	notContains = "not contains", // 不包含
	isIn = "is in", // 在
	isNotIn = "is not in", // 不在
	isEmpty = "is empty", // 为空
	isNotEmpty = "is not empty", // 不为空
}

/**
 * 根据变量类型获取可用的比较运算符
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
			// 默认返回基础运算符
			return [ComparisonSymbol.equal, ComparisonSymbol.notEqual];
	}
};

/**
 * 获取比较运算符的显示文本
 */
export const getComparisonSymbolLabel = (symbol: ComparisonSymbol, t: TFunction): string => {
	const labels: Record<ComparisonSymbol, string> = {
		[ComparisonSymbol.equal]: t("ifElseNode.comparisonSymbols.equal"),
		[ComparisonSymbol.notEqual]: t("ifElseNode.comparisonSymbols.notEqual"),
		[ComparisonSymbol.greaterThan]: t("ifElseNode.comparisonSymbols.greaterThan"),
		[ComparisonSymbol.lessThan]: t("ifElseNode.comparisonSymbols.lessThan"),
		[ComparisonSymbol.greaterThanOrEqual]: t("ifElseNode.comparisonSymbols.greaterThanOrEqual"),
		[ComparisonSymbol.lessThanOrEqual]: t("ifElseNode.comparisonSymbols.lessThanOrEqual"),
		[ComparisonSymbol.is]: t("ifElseNode.comparisonSymbols.is"),
		[ComparisonSymbol.isNot]: t("ifElseNode.comparisonSymbols.isNot"),
		[ComparisonSymbol.like]: t("ifElseNode.comparisonSymbols.like"),
		[ComparisonSymbol.notLike]: t("ifElseNode.comparisonSymbols.notLike"),
		[ComparisonSymbol.isIn]: t("ifElseNode.comparisonSymbols.isIn"),
		[ComparisonSymbol.isNotIn]: t("ifElseNode.comparisonSymbols.isNotIn"),
		[ComparisonSymbol.isEmpty]: t("ifElseNode.comparisonSymbols.isEmpty"),
		[ComparisonSymbol.isNotEmpty]: "不为空",
		[ComparisonSymbol.contains]: t("ifElseNode.comparisonSymbols.contains"),
		[ComparisonSymbol.notContains]: t("ifElseNode.comparisonSymbols.notContains"),
	};
	return labels[symbol];
};

// 逻辑运算符
export enum LogicalSymbol {
	AND = "and",
	Or = "or",
}

// 变量类型
export enum VarType {
	variable = "variable", // 变量
	constant = "constant", // 常量
}

// 左变量
export type Variable = {
	varType: VarType | null; // 变量类型
	nodeId: string | null; // 节点id（这个变量来源的节点id
	nodeName: string | null; // 节点名称
	nodeType: NodeType | null; // 节点类型
	outputHandleId: string | null; // 变量输出handleId
	varConfigId: number | null; // 变量配置id(指标配置id,K线配置id)
	varName: string | null; // 变量, 如果是常量，则值为常量值
	varDisplayName: string | null; // 变量名称(用户设置的变量名称，或者默认名称)
	varValueType: VariableValueType; // 变量值类型
	extraInfo?: Record<string, string | number | boolean | null> | null; // 额外信息
};


export type Constant = {
	varType: VarType.constant;
	varValueType: VariableValueType;
	varValue: number | string | boolean | string[];

}



export type IfElseNode = Node<IfElseNodeData, "ifElseNode">;
