import type { Node } from "@xyflow/react";
import type { NodeType } from "@/types/node/index";
import { VariableValueType } from "@/types/variable";

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
export type IfElseNodeData = {
	nodeName: string; // 节点名称
	// 针对不同交易模式的条件配置
	liveConfig?: IfElseNodeLiveConfig;
	simulateConfig?: IfElseNodeSimulateConfig;
	backtestConfig?: IfElseNodeBacktestConfig;
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
export const getComparisonSymbolLabel = (symbol: ComparisonSymbol): string => {
	const labels: Record<ComparisonSymbol, string> = {
		[ComparisonSymbol.equal]: "=",
		[ComparisonSymbol.notEqual]: "!=",
		[ComparisonSymbol.greaterThan]: ">",
		[ComparisonSymbol.lessThan]: "<",
		[ComparisonSymbol.greaterThanOrEqual]: ">=",
		[ComparisonSymbol.lessThanOrEqual]: "<=",
		[ComparisonSymbol.is]: "是",
		[ComparisonSymbol.isNot]: "不是",
		[ComparisonSymbol.like]: "包含",
		[ComparisonSymbol.notLike]: "不包含",
		[ComparisonSymbol.isIn]: "存在于",
		[ComparisonSymbol.isNotIn]: "不存在于",
		[ComparisonSymbol.isEmpty]: "为空",
		[ComparisonSymbol.isNotEmpty]: "不为空",
		[ComparisonSymbol.contains]: "包含",
		[ComparisonSymbol.notContains]: "不包含",
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
