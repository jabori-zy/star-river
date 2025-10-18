import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import type {
	TriggerConfig,
	UpdateOperationType,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import {
	generateUpdateHint,
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
	triggerType: "condition" | "timer" | "dataflow";
	triggerConfig: TriggerConfig;
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
	triggerType,
	triggerConfig,
}) => {
	const effectiveTriggerType =
		triggerType ?? getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });

	// 判断是否应该显示提示文案
	const shouldShowHint = () => {
		// 条件触发模式：必须选择了触发条件
		if (effectiveTriggerType === "condition" && !conditionTrigger) {
			return false;
		}
		// 必须有值
		return !!updateValue;
	};

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
		{shouldShowHint() && (
			<p className="text-xs text-muted-foreground">
				{generateUpdateHint(variableDisplayName, updateOperationType, {
					value: updateValue,
					triggerConfig: {
						triggerType: effectiveTriggerType,
						conditionTrigger,
						timerTrigger,
					},
				})}
			</p>
		)}
	</div>
	);
};

export default InputTypeOpEditor;
