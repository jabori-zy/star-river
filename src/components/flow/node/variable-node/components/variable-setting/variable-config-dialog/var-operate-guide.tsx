import type React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	getVariableOperationDescription,
	getVariableOperationDisplayName,
	getVariableOperationIcon,
	getVariableOperationIconColor,
	type VariableOperation,
} from "@/types/node/variable-node";

interface VarOperateGuideProps {
	value: VariableOperation;
	onValueChange: (value: VariableOperation) => void;
	onConfirm?: () => void;
}

const VarOperateGuide: React.FC<VarOperateGuideProps> = ({
	value,
	onValueChange,
	onConfirm,
}) => {
	const handleDoubleClick = (optionValue: VariableOperation) => {
		onValueChange(optionValue);
		onConfirm?.();
	};

	const operations: VariableOperation[] = ["get", "update", "reset"];
	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium">操作类型</Label>
			<RadioGroup value={value} onValueChange={onValueChange}>
				<div className="space-y-3">
					{operations.map((operation) => {
						const Icon = getVariableOperationIcon(operation);
						const iconColor = getVariableOperationIconColor(operation);
						const displayName = getVariableOperationDisplayName(operation);
						const description = getVariableOperationDescription(operation);

						return (
							<Label
								key={operation}
								htmlFor={operation}
								className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
									value === operation
										? "border-blue-500 bg-blue-50"
										: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
								}`}
								onDoubleClick={() => handleDoubleClick(operation)}
							>
								<RadioGroupItem value={operation} id={operation} />
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
										<span className="font-medium text-gray-900">
											{displayName}
										</span>
									</div>
									<div className="text-xs text-gray-500 mt-0.5">
										{description}
									</div>
								</div>
							</Label>
						);
					})}
				</div>
			</RadioGroup>
		</div>
	);
};

export default VarOperateGuide;
