import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import type {
	TriggerConfig,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import {
	generateNumberHint,
	generateStringHint,
	generateTimeHint,
} from "../../../../hint-generators";
import { useTranslation } from "react-i18next";

interface InputTypeOpEditorProps{
	updateOperationType: UpdateVarValueOperation;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	varValueType: VariableValueType;
	onUpdateOperationTypeChange: (operation: UpdateVarValueOperation) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	getPlaceholder: (operationType: UpdateVarValueOperation) => string;
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
	const { t } = useTranslation();
	const effectiveTriggerType =
		triggerType ?? getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });

	// 根据变量类型选择对应的生成器
	const getHintGenerator = () => {
		switch (varValueType) {
			case VariableValueType.NUMBER:
				return generateNumberHint;
			case VariableValueType.STRING:
				return generateStringHint;
			case VariableValueType.TIME:
				return generateTimeHint;
			default:
				return generateNumberHint;
		}
	};

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
						const operation = value as UpdateVarValueOperation;
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
				{getHintGenerator()({
					t,
					varOperation: "update",
					operationType: updateOperationType,
					variableDisplayName,
					value: updateValue,
					conditionTrigger,
					timerTrigger,
				})}
			</p>
		)}
	</div>
	);
};

export default InputTypeOpEditor;
