import type {
	ConditionTrigger,
	DataFlowTrigger,
	TimerTrigger,
	UpdateVarValueOperation,
	VariableOperation,
} from "@/types/node/variable-node";

/**
 * Hint generator parameter types
 */
export interface HintGeneratorParams {
	// Translation
	t: (key: string, options?: { [key: string]: string }) => string;
	language?: string;

	// Variable information
	variableDisplayName?: string;

	// Operation type
	varOperation: VariableOperation;
	operationType?: UpdateVarValueOperation;

	// Value information
	value?: string;
	selectedValues?: string[];
	symbol?: string;

	// Trigger configuration
	conditionTrigger?: ConditionTrigger | null;
	timerTrigger?: TimerTrigger;
	dataflowTrigger?: DataFlowTrigger | null;
}
