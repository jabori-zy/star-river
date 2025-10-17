import MultipleSelector, {
	type Option,
} from "@/components/select-components/multi-select";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import type {
	TriggerCase,
	UpdateOperationType,
} from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import {
	generateUpdateHint,
	getTriggerCaseLabel,
} from "../../../../variable-node-utils";

interface EnumTypeOpEditorProps {
	updateOperationType: UpdateOperationType;
	updateValue: string; // JSON string of string[]
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (value: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	idPrefix?: string;
	triggerCase?: TriggerCase | null;
}

const EnumTypeOpEditor: React.FC<EnumTypeOpEditorProps> = ({
	updateOperationType,
	updateValue,
	availableOperationOptions,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	variableDisplayName,
	idPrefix = "enum",
	triggerCase,
}) => {
	// 获取触发信息
	const triggerNodeName = triggerCase?.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(triggerCase);

	// 将 JSON 字符串解析为 Option[]
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

	// 将 Option[] 转换为 JSON 字符串
	const handleValueChange = (options: Option[]) => {
		const values = options.map((opt) => opt.value);
		onUpdateValueChange(JSON.stringify(values));
	};

	// 解析当前选中的值
	const getSelectedValues = (): string[] => {
		try {
			const parsedValue = JSON.parse(updateValue || "[]");
			return Array.isArray(parsedValue) ? parsedValue : [];
		} catch {
			return [];
		}
	};

	// clear 操作不需要输入值
	if (updateOperationType === "clear") {
		return (
			<div className="flex flex-col gap-2">
				<SelectInDialog
					id={`${idPrefix}-operation`}
					value={updateOperationType}
					onValueChange={(value) =>
						onUpdateOperationTypeChange(value as UpdateOperationType)
					}
					placeholder="选择更新操作"
					options={availableOperationOptions}
				/>
				<p className="text-xs text-muted-foreground">
					{generateUpdateHint(variableDisplayName, updateOperationType, {
						varValueType: VariableValueType.ENUM,
						triggerNodeName: triggerNodeName,
						triggerCaseLabel: triggerCaseLabel || undefined,
					})}
				</p>
			</div>
		);
	}

	// set, append, remove 操作需要多选输入
	const selectedValues = getSelectedValues();
	const hasValues = selectedValues.length > 0;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<div className="w-20">
					<SelectInDialog
						id={`${idPrefix}-operation`}
						value={updateOperationType}
						onValueChange={(value) =>
							onUpdateOperationTypeChange(value as UpdateOperationType)
						}
						placeholder="选择更新操作"
						options={availableOperationOptions}
					/>
				</div>
				<div className="flex-1">
					<MultipleSelector
						value={parseValue()}
						onChange={handleValueChange}
						placeholder={
							updateOperationType === "set"
								? "输入新数组的值"
								: updateOperationType === "append"
									? "输入要添加的值"
									: "输入要删除的值"
						}
						creatable={true}
						triggerSearchOnFocus={true}
						className="min-h-9"
						emptyIndicator={
							<p className="text-center text-sm text-muted-foreground">
								{updateOperationType === "set"
									? "输入后按回车设置数组值"
									: updateOperationType === "append"
										? "输入后按回车添加元素"
										: "输入后按回车选择要删除的元素"}
							</p>
						}
					/>
				</div>
			</div>
			{hasValues && (
				<p className="text-xs text-muted-foreground">
					{generateUpdateHint(variableDisplayName, updateOperationType, {
						varValueType: VariableValueType.ENUM,
						selectedValues,
						triggerNodeName: triggerNodeName,
						triggerCaseLabel: triggerCaseLabel || undefined,
					})}
				</p>
			)}
		</div>
	);
};

export default EnumTypeOpEditor;
