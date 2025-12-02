import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { generateStringHint } from "@/components/flow/node/variable-node/hint-generators";
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

interface StringTypeOpEditorProps {
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

const StringTypeOpEditor: React.FC<StringTypeOpEditorProps> = ({
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

	// 字符串输入处理
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onUpdateValueChange(e.target.value);
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		// 失去焦点时 trim 左右空格
		const trimmedValue = e.target.value.trim();
		if (trimmedValue !== e.target.value) {
			onUpdateValueChange(trimmedValue);
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
					type="text"
					value={updateValue}
					onChange={handleInputChange}
					onBlur={handleBlur}
					placeholder={getPlaceholder(updateOperationType)}
					className="flex-1"
				/>
			</ButtonGroup>
			{shouldShowHint() && (
				<p className="text-xs text-muted-foreground">
					{generateStringHint({
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

export default StringTypeOpEditor;
