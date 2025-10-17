import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import type {
	TriggerCase,
	UpdateOperationType,
} from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import {
	generateUpdateHint,
	getTriggerCaseLabel,
} from "../../../../variable-node-utils";

interface BoolTypeOpEditorProps {
	updateOperationType: UpdateOperationType;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	idPrefix?: string;
	triggerCase?: TriggerCase | null;
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
	triggerCase,
}) => {
	// 获取触发信息
	const triggerNodeName = triggerCase?.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(triggerCase);
	// toggle 模式：只显示操作选择器和说明文案
	if (updateOperationType === "toggle") {
		return (
			<div className="flex flex-col gap-2">
				<SelectInDialog
					value={updateOperationType}
					onValueChange={(value) => {
						const operation = value as UpdateOperationType;
						onUpdateOperationTypeChange(operation);
						if (operation === "toggle") {
							onUpdateValueChange("");
						}
					}}
					placeholder="选择更新操作"
					options={availableOperationOptions}
				/>
				<p className="text-xs text-muted-foreground">
					{generateUpdateHint(variableDisplayName, updateOperationType, {
						varValueType: VariableValueType.BOOLEAN,
						triggerNodeName: triggerNodeName,
						triggerCaseLabel: triggerCaseLabel || undefined,
					})}
				</p>
			</div>
		);
	}

	// set 模式：显示操作符和值选择器
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
				<SelectInDialog
					value={updateValue || "true"}
					onValueChange={onUpdateValueChange}
					options={BOOLEAN_OPTIONS}
					className="flex-1"
				/>
			</ButtonGroup>
			<p className="text-xs text-muted-foreground">
				{generateUpdateHint(variableDisplayName, updateOperationType, {
					varValueType: VariableValueType.BOOLEAN,
					value: updateValue,
					triggerNodeName: triggerNodeName,
					triggerCaseLabel: triggerCaseLabel || undefined,
				})}
			</p>
		</div>
	);
};

export default BoolTypeOpEditor;
