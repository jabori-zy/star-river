import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import type {
	TriggerConfig,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import { generatePercentageHint } from "@/components/flow/node/variable-node/hint-generators";
import { useTranslation } from "react-i18next";

interface PercentTypeOpEditorProps {
	updateOperationType: UpdateVarValueOperation;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateVarValueOperation) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	getPlaceholder: (operationType: UpdateVarValueOperation) => string;
	triggerType: "condition" | "timer" | "dataflow";
	triggerConfig?: TriggerConfig;
}

const PercentTypeOpEditor: React.FC<PercentTypeOpEditorProps> = ({
	updateOperationType,
	updateValue,
	availableOperationOptions,
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
				<InputGroup className="flex-1">
					<InputGroupInput
						id="updateValue"
						type="number"
						value={updateValue}
						onChange={(e) => onUpdateValueChange(e.target.value)}
						placeholder={getPlaceholder(updateOperationType)}
					/>
					<InputGroupAddon align="inline-end">
						<InputGroupText>%</InputGroupText>
					</InputGroupAddon>
			</InputGroup>
		</ButtonGroup>
		{shouldShowHint() && (
			<p className="text-xs text-muted-foreground">
				{generatePercentageHint({
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

export default PercentTypeOpEditor;
