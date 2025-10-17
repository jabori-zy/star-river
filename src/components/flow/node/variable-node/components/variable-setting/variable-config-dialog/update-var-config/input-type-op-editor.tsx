import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import type {
	TimerTrigger,
	ConditionTrigger,
	UpdateOperationType,
} from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import {
	generateUpdateHint,
	getTriggerCaseLabel,
} from "../../../../variable-node-utils";

interface InputTypeOpEditorProps {
	updateOperationType: UpdateOperationType;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	varValueType: VariableValueType;
	onUpdateOperationTypeChange: (operation: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	getPlaceholder: (operationType: UpdateOperationType) => string;
	triggerCase?: ConditionTrigger | null;
	timerConfig?: TimerTrigger;
}

const InputTypeOpEditor: React.FC<InputTypeOpEditorProps> = ({
	updateOperationType,
	updateValue,
	availableOperationOptions,
	varValueType,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	variableDisplayName,
	getPlaceholder,
	triggerCase,
	timerConfig,
}) => {
	// 获取触发信息
	const triggerNodeName = triggerCase?.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(triggerCase);

	return (
		<div className="flex flex-col gap-2">
			<ButtonGroup className="w-full">
				<SelectInDialog
					value={updateOperationType}
					onValueChange={(value) => {
						const operation = value as UpdateOperationType;
						onUpdateOperationTypeChange(operation);
						if (operation === "toggle") {
							onUpdateValueChange("");
						}
					}}
					options={availableOperationOptions}
					className="w-[70px]"
				/>
				<Input
					id="updateValue"
					type={varValueType === VariableValueType.NUMBER ? "number" : "text"}
					value={updateValue}
					onChange={(e) => onUpdateValueChange(e.target.value)}
					placeholder={getPlaceholder(updateOperationType)}
					className="flex-1"
				/>
			</ButtonGroup>
			{updateValue && (
				<p className="text-xs text-muted-foreground">
					{generateUpdateHint(variableDisplayName, updateOperationType, {
						value: updateValue,
						triggerNodeName: triggerNodeName,
						triggerCaseLabel: triggerCaseLabel || undefined,
					timerConfig: timerConfig,
					})}
				</p>
			)}
		</div>
	);
};

export default InputTypeOpEditor;
