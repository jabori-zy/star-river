import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { generateBooleanHint } from "@/components/flow/node/variable-node/hint-generators";
import { ButtonGroup } from "@/components/ui/button-group";
import type {
	TriggerConfig,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";

interface BoolTypeOpEditorProps {
	updateOperationType: UpdateVarValueOperation;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateVarValueOperation) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	idPrefix?: string;
	triggerType: "condition" | "timer" | "dataflow";
	triggerConfig?: TriggerConfig;
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
	const { t } = useTranslation();
	const effectiveTriggerType =
		triggerType ?? getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });

	// Determine whether to show hint text
	const shouldShowHint = () => {
		// Condition trigger mode: must have selected a trigger condition
		if (effectiveTriggerType === "condition" && !conditionTrigger) {
			return false;
		}
		// Toggle operation doesn't need input value, can display directly
		if (updateOperationType === "toggle") {
			return true;
		}
		// Other operations need values
		return !!updateValue;
	};

	// Toggle mode: only show operation selector and description text
	if (updateOperationType === "toggle") {
		return (
			<div className="flex flex-col gap-2">
				<SelectInDialog
					value={updateOperationType}
					onValueChange={(value) => {
						const operation = value as UpdateVarValueOperation;
						onUpdateOperationTypeChange(operation);
						if (operation === "toggle") {
							onUpdateValueChange("");
						}
					}}
					placeholder="Select update operation"
					options={availableOperationOptions}
				/>
				{shouldShowHint() && (
					<p className="text-xs text-muted-foreground">
						{generateBooleanHint({
							t,
							varOperation: "update",
							operationType: updateOperationType,
							variableDisplayName,
							conditionTrigger,
							timerTrigger,
						})}
					</p>
				)}
			</div>
		);
	}

	// Set mode: show operator and value selector
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
				<SelectInDialog
					value={updateValue || "true"}
					onValueChange={onUpdateValueChange}
					options={BOOLEAN_OPTIONS}
					className="flex-1"
				/>
			</ButtonGroup>
			{shouldShowHint() && (
				<p className="text-xs text-muted-foreground">
					{generateBooleanHint({
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

export default BoolTypeOpEditor;
