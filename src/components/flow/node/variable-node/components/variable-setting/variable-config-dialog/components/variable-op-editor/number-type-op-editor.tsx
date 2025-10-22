import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
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
import { generateNumberHint } from "@/components/flow/node/variable-node/hint-generators";

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

	// 使用本地状态管理数字输入
	const [localValue, setLocalValue] = useState<string>(updateValue);
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		// 只有在组件不处于焦点状态时才更新本地值,避免用户输入时被覆盖
		if (!isFocused) {
			setLocalValue(updateValue);
		}
	}, [updateValue, isFocused]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setLocalValue(inputValue);

		// 如果输入不为空且是有效数字,立即通知父组件
		if (inputValue !== "" && !Number.isNaN(Number(inputValue))) {
			onUpdateValueChange(inputValue);
		}
	};

	const handleBlur = () => {
		setIsFocused(false);

		// 失去焦点时处理输入值
		if (localValue === "") {
			// 如果输入为空,默认设置为0
			setLocalValue("0");
			onUpdateValueChange("0");
		} else if (isNaN(Number(localValue))) {
			// 如果输入无效,重置为原始值
			setLocalValue(updateValue);
		} else {
			// 确保数值同步到父组件
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
			// 阻止默认行为,模拟失去焦点
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		}
		if (e.key === "Escape") {
			// 阻止默认行为,重置值并失去焦点
			e.preventDefault();
			setLocalValue(updateValue);
			(e.target as HTMLInputElement).blur();
		}
	};

	// 判断是否应该显示提示文案
	const shouldShowHint = () => {
		// 条件触发模式:必须选择了触发条件
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
