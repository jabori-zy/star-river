import { DateTimePicker24h } from "@/components/datetime-picker";
import { formatDate } from "@/components/flow/node/node-utils";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import type {
	TriggerCase,
	UpdateOperationType,
} from "@/types/node/variable-node";
import {
	generateUpdateHint,
	getTriggerCaseLabel,
} from "../../../../variable-node-utils";

interface TimeTypeOpEditorProps {
	updateOperationType: UpdateOperationType;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	triggerCase?: TriggerCase | null;
}

const TimeTypeOpEditor: React.FC<TimeTypeOpEditorProps> = ({
	updateOperationType,
	updateValue,
	availableOperationOptions,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	variableDisplayName,
	triggerCase,
}) => {
	// 获取触发信息
	const triggerNodeName = triggerCase?.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(triggerCase);

	// 安全地解析日期值
	const getDateValue = (): Date | undefined => {
		if (!updateValue || updateValue.trim() === "") {
			return undefined;
		}
		try {
			const date = new Date(updateValue);
			// 检查日期是否有效
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
						const operation = value as UpdateOperationType;
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
			{updateValue && (
				<p className="text-xs text-muted-foreground">
					{generateUpdateHint(variableDisplayName, updateOperationType, {
						value: updateValue,
						triggerNodeName: triggerNodeName,
						triggerCaseLabel: triggerCaseLabel || undefined,
					})}
				</p>
			)}
		</div>
	);
};

export default TimeTypeOpEditor;
