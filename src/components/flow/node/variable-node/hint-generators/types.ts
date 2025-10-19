import type {
	ConditionTrigger,
	TimerTrigger,
	DataFlowTrigger,
	VariableOperation,
	UpdateOperationType,
} from "@/types/node/variable-node";

/**
 * 提示生成器参数类型
 */
export interface HintGeneratorParams {
	// 翻译
	t: (key: string, options?: { [key: string]: string }) => string;
	language?: string;

	// 变量信息
	variableDisplayName?: string;

	// 操作类型
	varOperation: VariableOperation;
	operationType?: UpdateOperationType;

	// 值信息
	value?: string;
	selectedValues?: string[];
	symbol?: string;

	// 触发配置
	conditionTrigger?: ConditionTrigger | null;
	timerTrigger?: TimerTrigger;
	dataflowTrigger?: DataFlowTrigger | null;
}
