import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
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

interface BoolTypeOpEditorProps {
	updateOperationType: UpdateOperationType;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	idPrefix?: string;
	triggerType: "condition" | "timer" | "dataflow";
	triggerConfig: TriggerConfig;
}

const BOOLEAN_OPTIONS = [
	{ value: "true", label: "True" },
	{ value: "false", label: "False" },
];

const BoolTypeOpEditor: React.FC<BoolTypeOpEditorProps> = ({
	updateOperationType,
	updateValue,
	availableOperationOptions,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	variableDisplayName,
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
		// toggle 操作不需要输入值，可以直接显示
		if (updateOperationType === "toggle") {
			return true;
		}
		// 其他操作需要有值
		return !!updateValue;
	};

	// toggle 模式：只显示操作选择器和说明文案
	if (updateOperationType === "toggle") {
		return (
			<div className="flex flex-col gap-2">
				<SelectInDialog
					value={updateOperationType}
					onValueChange={(value) => {
						const operation = value as UpdateOperationType;
						onUpdateOperationTypeChange(operation);
						if (operation === "toggle") {
							onUpdateValueChange("");
						}
					}}
					placeholder="选择更新操作"
					options={availableOperationOptions}
				/>
				{shouldShowHint() && (
					<p className="text-xs text-muted-foreground">
						{generateUpdateHint(variableDisplayName, updateOperationType, {
							varValueType: VariableValueType.BOOLEAN,
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
	}

	// set 模式：显示操作符和值选择器
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
				<SelectInDialog
					value={updateValue || "true"}
					onValueChange={onUpdateValueChange}
					options={BOOLEAN_OPTIONS}
					className="flex-1"
				/>
			</ButtonGroup>
			{shouldShowHint() && (
				<p className="text-xs text-muted-foreground">
					{generateUpdateHint(variableDisplayName, updateOperationType, {
						varValueType: VariableValueType.BOOLEAN,
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

export default BoolTypeOpEditor;
