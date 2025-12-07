import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { generateEnumHint } from "@/components/flow/node/variable-node/hint-generators";
import MultipleSelector, {
	type Option,
} from "@/components/select-components/multi-select";
import type {
	TriggerConfig,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";

interface EnumTypeOpEditorProps {
	updateOperationType: UpdateVarValueOperation;
	updateValue: string; // JSON string of string[]
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (value: UpdateVarValueOperation) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	idPrefix?: string;
	triggerType: "condition" | "timer" | "dataflow";
	triggerConfig?: TriggerConfig;
}

const EnumTypeOpEditor: React.FC<EnumTypeOpEditorProps> = ({
	updateOperationType,
	updateValue,
	availableOperationOptions,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	variableDisplayName,
	idPrefix = "enum",
	triggerType,
	triggerConfig,
}) => {
	const { t } = useTranslation();
	const effectiveTriggerType =
		triggerType ?? getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });

	// Determine whether to show hint text
	const shouldShowHint = (hasValues: boolean) => {
		// Condition trigger mode: must have selected a trigger condition
		if (effectiveTriggerType === "condition" && !conditionTrigger) {
			return false;
		}
		// Clear operation doesn't need input value, can display directly
		if (updateOperationType === "clear") {
			return true;
		}
		// Other operations need values
		return hasValues;
	};

	// Parse JSON string to Option[]
	const parseValue = (): Option[] => {
		try {
			const parsedValue = JSON.parse(updateValue || "[]");
			return Array.isArray(parsedValue)
				? parsedValue.map((v: string) => ({ value: v, label: v }))
				: [];
		} catch {
			return [];
		}
	};

	// Convert Option[] to JSON string
	const handleValueChange = (options: Option[]) => {
		const values = options.map((opt) => opt.value);
		onUpdateValueChange(JSON.stringify(values));
	};

	// Parse currently selected values
	const getSelectedValues = (): string[] => {
		try {
			const parsedValue = JSON.parse(updateValue || "[]");
			return Array.isArray(parsedValue) ? parsedValue : [];
		} catch {
			return [];
		}
	};

	// Clear operation doesn't need input value
	if (updateOperationType === "clear") {
		return (
			<div className="flex flex-col gap-2">
				<SelectInDialog
					id={`${idPrefix}-operation`}
					value={updateOperationType}
					onValueChange={(value) =>
						onUpdateOperationTypeChange(value as UpdateVarValueOperation)
					}
					placeholder="Select update operation"
					options={availableOperationOptions}
				/>
				{shouldShowHint(true) && (
					<p className="text-xs text-muted-foreground">
						{generateEnumHint({
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

	// set, append, remove operations need multi-select input
	const selectedValues = getSelectedValues();
	const hasValues = selectedValues.length > 0;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<SelectInDialog
					id={`${idPrefix}-operation`}
					value={updateOperationType}
					onValueChange={(value) =>
						onUpdateOperationTypeChange(value as UpdateVarValueOperation)
					}
					placeholder="Select update operation"
					options={availableOperationOptions}
					className="w-auto"
				/>
				<div className="flex-1">
					<MultipleSelector
						value={parseValue()}
						onChange={handleValueChange}
						placeholder={
							updateOperationType === "set"
								? "Enter new array values"
								: updateOperationType === "append"
									? "Enter values to add"
									: "Enter values to remove"
						}
						creatable={true}
						triggerSearchOnFocus={true}
						className="min-h-9"
						emptyIndicator={
							<p className="text-center text-sm text-muted-foreground">
								{updateOperationType === "set"
									? "Press Enter after typing to set array values"
									: updateOperationType === "append"
										? "Press Enter after typing to add elements"
										: "Press Enter after typing to select elements to remove"}
							</p>
						}
					/>
				</div>
			</div>
			{shouldShowHint(hasValues) && (
				<p className="text-xs text-muted-foreground">
					{generateEnumHint({
						t,
						varOperation: "update",
						operationType: updateOperationType,
						variableDisplayName,
						selectedValues,
						conditionTrigger,
						timerTrigger,
					})}
				</p>
			)}
		</div>
	);
};

export default EnumTypeOpEditor;
