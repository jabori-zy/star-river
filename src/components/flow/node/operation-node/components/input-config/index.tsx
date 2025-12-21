import type React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { House, ArrowRight, Group } from "lucide-react";
import type { InputArrayType, InputConfig, InputSeriesConfig, InputSource } from "@/types/operation";
import { UnaryInput } from "./unary-input";
import { BinaryInput } from "./binary-input";
import { NaryInput } from "./nary-input";
import type { NodeType } from "@/types/node";
import {
	getInputTypeBadgeStyle,
	getInputTypeBadgeLabel,
	getNodeTypeIconConfig,
} from "../../operation-node-utils";

// Input option type for dropdown
// Represents available input sources from upstream nodes
export interface InputOption {
	configId: number;
	inputType: "Series" | "Scalar" | "CustomScalarValue";
	fromNodeId: string;
	fromNodeName: string;
	fromHandleId: string;
	fromNodeType: NodeType;
	inputDisplayName: string;
	// Source type for the input config
	// "OperationNode" - from sibling OperationNode
	// "ParentGroup" - from parent Group (via OperationStartNode)
	// "ChildGroup" - from child OperationGroup
	sourceType: InputSource;
	// For Scalar type - the variable name from source
	inputName?: string;
	// For CustomScalarValue type - the actual value
	inputValue?: number;
}

// Get icon based on node type
const getNodeTypeIcon = (nodeType: NodeType) => {
	const config = getNodeTypeIconConfig(nodeType);
	if (!config) return null;

	switch (config.iconName) {
		case "House":
			return <House className={config.className} />;
		case "ArrowRight":
			return <ArrowRight className={config.className} />;
		case "Group":
			return <Group className={config.className} />;
		default:
			return null;
	}
};


// Shared component for rendering input options in dropdown
export const InputOptionDisplay: React.FC<{ option: InputOption }> = ({
	option,
}) => (
	<div className="flex items-center gap-2">
		{getNodeTypeIcon(option.fromNodeType)}
		<span>{option.inputDisplayName}</span>
		<Badge
			variant="outline"
			className={cn("text-[10px] px-1.5 py-0", getInputTypeBadgeStyle(option.inputType))}
		>
			{getInputTypeBadgeLabel(option.inputType)}
		</Badge>
		{option.inputType === "CustomScalarValue" && option.inputValue !== undefined && (
			<span className="text-xs text-muted-foreground">
				({option.inputValue})
			</span>
		)}
	</div>
);

interface InputConfigComponentProps {
	inputArrayType: InputArrayType;
	// For Unary - only accepts Series input
	inputConfig?: InputSeriesConfig | null;
	// For Binary - accepts both Series and Scalar
	input1?: InputConfig | null;
	input2?: InputConfig | null;
	// For Nary - only accepts Series inputs
	inputs?: InputSeriesConfig[];
	// Common - all available input options
	inputOptions: InputOption[];
	// Whether to support scalar input (for Binary only)
	supportScalarInput?: boolean;
	// Unary only accepts Series
	onChange?: (config: InputSeriesConfig | null) => void;
	onChangeInput1?: (config: InputConfig | null) => void;
	onChangeInput2?: (config: InputConfig | null) => void;
	onChangeInputs?: (inputs: InputSeriesConfig[]) => void;
	className?: string;
}

export const InputConfigComponent: React.FC<InputConfigComponentProps> = ({
	inputArrayType,
	inputConfig,
	input1,
	input2,
	inputs,
	inputOptions = [],
	supportScalarInput = true,
	onChange,
	onChangeInput1,
	onChangeInput2,
	onChangeInputs,
	className,
}) => {
	return (
		<div className={cn("space-y-2", className)}>
			<Label className="text-sm font-medium">Input</Label>

			{inputArrayType === "Unary" && onChange && (
				<UnaryInput
					inputConfig={inputConfig ?? null}
					inputOptions={inputOptions}
					onChange={onChange}
				/>
			)}

			{inputArrayType === "Binary" && onChangeInput1 && onChangeInput2 && (
				<BinaryInput
					input1={input1 ?? null}
					input2={input2 ?? null}
					inputOptions={inputOptions}
					onChangeInput1={onChangeInput1}
					onChangeInput2={onChangeInput2}
					supportScalarInput={supportScalarInput}
				/>
			)}

			{inputArrayType === "Nary" && onChangeInputs && (
				<NaryInput
					inputs={inputs ?? []}
					inputOptions={inputOptions}
					onChange={onChangeInputs}
				/>
			)}
		</div>
	);
};

export { UnaryInput } from "./unary-input";
export { BinaryInput } from "./binary-input";
export { NaryInput } from "./nary-input";

export default InputConfigComponent;
