import { useTranslation } from "react-i18next";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { formatDate } from "@/components/flow/node/node-utils";
import { generateTimeHint } from "@/components/flow/node/variable-node/hint-generators";
import type {
	TriggerConfig,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";

interface TimeTypeOpEditorProps {
	updateOperationType: UpdateVarValueOperation;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateVarValueOperation) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	triggerType: "condition" | "timer" | "dataflow";
	triggerConfig?: TriggerConfig;
}

const TimeTypeOpEditor: React.FC<TimeTypeOpEditorProps> = ({
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
		// Must have a value
		return !!updateValue;
	};

	// Safely parse date value
	const getDateValue = (): Date | undefined => {
		if (!updateValue || updateValue.trim() === "") {
			return undefined;
		}
		try {
			const date = new Date(updateValue);
			// Check if date is valid
			if (isNaN(date.getTime())) {
				return undefined;
			}
			return date;
		} catch {
			return undefined;
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2 w-full">
				<SelectInDialog
					value={updateOperationType}
					onValueChange={(value) => {
						const operation = value as UpdateVarValueOperation;
						onUpdateOperationTypeChange(operation);
					}}
					options={availableOperationOptions}
					className="w-[70px]"
				/>
				<div className="flex-1">
					<DateTimePicker24h
						value={getDateValue()}
						onChange={(date) => {
							const formattedDate = formatDate(date);
							onUpdateValueChange(formattedDate);
						}}
						showSeconds={true}
						useDialogPopover
					/>
				</div>
			</div>
			{shouldShowHint() && (
				<p className="text-xs text-muted-foreground">
					{generateTimeHint({
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

export default TimeTypeOpEditor;
