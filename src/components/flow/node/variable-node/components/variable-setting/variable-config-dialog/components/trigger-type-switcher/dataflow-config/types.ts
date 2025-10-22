import type {
	DataflowErrorPolicy,
	DataflowErrorType,
	TimerUnit,
	ErrorLog,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import type { VariableValue } from "@/types/node/variable-node/variable-config-types";
import { VariableValueType } from "@/types/variable";

export interface DataflowConfigProps {
	expireDuration: { unit: TimerUnit; duration: number };
	errorPolicy: Partial<Record<DataflowErrorType, DataflowErrorPolicy>>;
	replaceValueType?: VariableValueType;
	updateOperationType?: UpdateVarValueOperation;
	onExpireDurationChange: (config: { unit: TimerUnit; duration: number }) => void;
	onErrorPolicyChange: (
		errorType: DataflowErrorType,
		policy: DataflowErrorPolicy,
	) => void;
	onValidationChange?: (isValid: boolean) => void;
}

export interface ReplaceValueInputProps {
	errorType: DataflowErrorType;
	replaceValue: VariableValue;
	errorLog: ErrorLog;
	replaceValueType?: VariableValueType;
	updateOperationType?: UpdateVarValueOperation;
	onErrorPolicyChange: (
		errorType: DataflowErrorType,
		policy: DataflowErrorPolicy,
	) => void;
}

export interface ErrorPolicyConfigProps {
	errorType: DataflowErrorType;
	policy: DataflowErrorPolicy | undefined;
	replaceValueType?: VariableValueType;
	updateOperationType?: UpdateVarValueOperation;
	onErrorPolicyChange: (
		errorType: DataflowErrorType,
		policy: DataflowErrorPolicy,
	) => void;
}

export interface ExpireDurationSectionProps {
	expireDuration: { unit: TimerUnit; duration: number };
	onExpireDurationChange: (config: { unit: TimerUnit; duration: number }) => void;
}

