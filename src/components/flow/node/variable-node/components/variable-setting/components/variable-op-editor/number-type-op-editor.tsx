import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { generateNumberHint } from "@/components/flow/node/variable-node/hint-generators";
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

interface NumberTypeOpEditorProps {
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

const NumberTypeOpEditor: React.FC<NumberTypeOpEditorProps> = ({
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

	// Use local state to manage number input
	const [localValue, setLocalValue] = useState<string>(updateValue);
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		// Only update local value when component is not focused, to avoid overwriting user input
		if (!isFocused) {
			setLocalValue(updateValue);
		}
	}, [updateValue, isFocused]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setLocalValue(inputValue);

		// If input is not empty and is a valid number, notify parent component immediately
		if (inputValue !== "" && !Number.isNaN(Number(inputValue))) {
			onUpdateValueChange(inputValue);
		}
	};

	const handleBlur = () => {
		setIsFocused(false);

		// Handle input value on blur
		if (localValue === "") {
			// If input is empty, default to 0
			setLocalValue("0");
			onUpdateValueChange("0");
		} else if (isNaN(Number(localValue))) {
			// If input is invalid, reset to original value
			setLocalValue(updateValue);
		} else {
			// Ensure value is synced to parent component
			const numValue = Number(localValue);
			if (numValue.toString() !== updateValue) {
				onUpdateValueChange(numValue.toString());
			}
		}
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			// Prevent default behavior, simulate blur
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		}
		if (e.key === "Escape") {
			// Prevent default behavior, reset value and blur
			e.preventDefault();
			setLocalValue(updateValue);
			(e.target as HTMLInputElement).blur();
		}
	};

	// Determine whether to show hint text
	const shouldShowHint = () => {
		// Condition trigger mode: must have selected a trigger condition
		if (effectiveTriggerType === "condition" && !conditionTrigger) {
			return false;
		}
		// Must have a value
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
					type="number"
					value={localValue}
					onChange={handleInputChange}
					onBlur={handleBlur}
					onFocus={handleFocus}
					onKeyDown={handleKeyDown}
					placeholder={getPlaceholder(updateOperationType)}
					className="flex-1"
				/>
			</ButtonGroup>
			{shouldShowHint() && (
				<p className="text-xs text-muted-foreground">
					{generateNumberHint({
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

export default NumberTypeOpEditor;
