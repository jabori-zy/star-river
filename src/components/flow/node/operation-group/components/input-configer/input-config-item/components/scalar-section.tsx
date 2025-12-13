import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeVariableSelector } from "./node-variable-selector";
import type { ScalarSectionProps } from "../types";

export const ScalarSection: React.FC<ScalarSectionProps> = ({
	config,
	isCustomScalar,
	localScalarValue,
	onScalarValueChange,
	onScalarValueBlur,
	onScalarSourceChange,
	nodeList,
	fromNodeId,
	currentVariableValue,
	onNodeChange,
	onVariableChange,
	renderVariableContent,
}) => {
	return (
		<div className="flex flex-col gap-1.5">
			{/* Label with Custom Scalar checkbox */}
			<div className="flex items-center justify-between">
				<Label className="text-xs font-medium text-gray-600">
					{isCustomScalar ? "Scalar Value" : "Source Scalar"}
				</Label>
				<div className="flex items-center gap-1.5">
					<Checkbox
						id={`custom-scalar-${config.configId}`}
						checked={isCustomScalar}
						onCheckedChange={(checked) =>
							onScalarSourceChange(config.configId, checked ? "Value" : "Node")
						}
						className="h-3.5 w-3.5"
					/>
					<Label
						htmlFor={`custom-scalar-${config.configId}`}
						className="text-xs text-gray-600 cursor-pointer"
					>
						Custom Scalar
					</Label>
				</div>
			</div>

			{/* Conditional: Custom value input or Node selector */}
			{isCustomScalar ? (
				<Input
					type="number"
					value={localScalarValue}
					onChange={(e) => onScalarValueChange(e.target.value)}
					onBlur={onScalarValueBlur}
					placeholder="Enter scalar value"
					className="h-8 text-xs"
				/>
			) : (
				<NodeVariableSelector
					nodeList={nodeList}
					fromNodeId={fromNodeId}
					currentVariableValue={currentVariableValue}
					onNodeChange={onNodeChange}
					onVariableChange={onVariableChange}
					renderVariableContent={renderVariableContent}
					emptyNodeMessage="No available variable nodes"
				/>
			)}
		</div>
	);
};
