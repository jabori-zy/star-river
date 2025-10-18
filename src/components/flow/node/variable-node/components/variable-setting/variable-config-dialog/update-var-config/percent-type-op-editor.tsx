import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
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

interface PercentTypeOpEditorProps {
	updateOperationType: UpdateOperationType;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	getPlaceholder: (operationType: UpdateOperationType) => string;
	triggerType: "condition" | "timer" | "dataflow";
	triggerConfig: TriggerConfig;
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
	const effectiveTriggerType =
		triggerType ?? getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });

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
	{updateValue && (
		<p className="text-xs text-muted-foreground">
			{generateUpdateHint(variableDisplayName, updateOperationType, {
				varValueType: VariableValueType.PERCENTAGE,
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

export default PercentTypeOpEditor;
