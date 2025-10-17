import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import type {
	TriggerCase,
	UpdateOperationType,
} from "@/types/node/variable-node";
import {
	generateUpdateHint,
	getTriggerCaseLabel,
} from "../../../../variable-node-utils";

interface PercentTypeOpEditorProps {
	updateOperationType: UpdateOperationType;
	updateValue: string;
	availableOperationOptions: Array<{ value: string; label: string }>;
	onUpdateOperationTypeChange: (operation: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	variableDisplayName?: string;
	getPlaceholder: (operationType: UpdateOperationType) => string;
	triggerCase?: TriggerCase | null;
}

const PercentTypeOpEditor: React.FC<PercentTypeOpEditorProps> = ({
	updateOperationType,
	updateValue,
	availableOperationOptions,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	variableDisplayName,
	getPlaceholder,
	triggerCase,
}) => {
	// 获取触发信息
	const triggerNodeName = triggerCase?.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(triggerCase);

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
						value: `${updateValue}%`,
						triggerNodeName: triggerNodeName,
						triggerCaseLabel: triggerCaseLabel || undefined,
					})}
				</p>
			)}
		</div>
	);
};

export default PercentTypeOpEditor;
