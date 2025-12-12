import type React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Variable, ArrowRight } from "lucide-react";
import type { InputArrayType, InputConfig, InputSeriesConfig } from "@/types/operation";
import { UnaryInput } from "./unary-input";
import { BinaryInput } from "./binary-input";
import { NaryInput } from "./nary-input";
import { NodeType } from "@/types/node";

// Input option type for dropdown
export interface InputOption {
	configId: number;
	inputType: "Series" | "Scalar";
	fromNodeId: string;
	fromNodeName: string;
	fromHandleId: string;
	fromNodeType: NodeType;
	inputDisplayName: string;
	inputValue?: number;
}

// Get icon based on node type
const getNodeTypeIcon = (nodeType: NodeType) => {
	if (nodeType === NodeType.OperationStartNode) {
		return <Variable className="h-3.5 w-3.5 text-purple-500" />;
	}
	if (nodeType === NodeType.OperationNode) {
		return <ArrowRight className="h-3.5 w-3.5 text-green-500" />;
	}
	return null;
};

// Shared component for rendering input options in dropdown
export const InputOptionDisplay: React.FC<{ option: InputOption }> = ({
	option,
}) => (
	<div className="flex items-center gap-2">
		{getNodeTypeIcon(option.fromNodeType)}
		<span>{option.inputDisplayName}</span>
		<Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 ", option.inputType === "Series" ? "border-orange-500 text-orange-400" : "border-blue-500 text-blue-400")}>
			{option.inputType}
		</Badge>
		{option.inputType === "Scalar" && option.inputValue !== undefined && (
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
	// Common
	seriesOptions: InputOption[];
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
	seriesOptions = [],
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
					seriesOptions={seriesOptions}
					onChange={onChange}
				/>
			)}

			{inputArrayType === "Binary" && onChangeInput1 && onChangeInput2 && (
				<BinaryInput
					input1={input1 ?? null}
					input2={input2 ?? null}
					seriesOptions={seriesOptions}
					onChangeInput1={onChangeInput1}
					onChangeInput2={onChangeInput2}
					supportScalarInput={supportScalarInput}
				/>
			)}

			{inputArrayType === "Nary" && onChangeInputs && (
				<NaryInput
					inputs={inputs ?? []}
					seriesOptions={seriesOptions}
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
