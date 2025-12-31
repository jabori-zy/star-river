import type React from "react";
import { useState } from "react";
import { SquareFunction, ChevronDown, ChevronRight, House, ArrowRight, Group, ChartColumnStacked } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type {
	OperationNodeData,
	InputConfig,
	OutputConfig,
	BinaryInputConfig,
	NaryInputConfig,
	UnaryInputConfig,
} from "@/types/node/operation-node";
import {
	isSeriesInput,
	isScalarInput,
	isScalarValueInput,
	isParentGroupScalarValueInput,
} from "@/types/node/operation-node";
import type { NodeType } from "@/types/node";
import {
	getInputTypeBadgeStyle,
	getInputTypeBadgeLabel,
	getNodeTypeIconConfig,
	type InputBadgeType,
} from "../../operation-node-utils";
import { getOperationMeta } from "@/types/operation/operation-meta";
import type { InputArrayType } from "@/types/operation";

interface NodeShowProps {
	data: OperationNodeData;
}

// Get category text color based on category type
const getCategoryTextColor = (category?: string): string => {
	switch (category) {
		// Unary categories
		case "Aggregation":
			return "text-blue-600";
		case "Transformation":
			return "text-green-600";
		case "Window":
			return "text-purple-600";
		// Binary categories
		case "Arithmetic":
			return "text-orange-600";
		case "Statistical":
			return "text-cyan-600";
		// Nary categories
		case "Horizontal":
			return "text-amber-600";
		case "Weighted":
			return "text-rose-600";
		case "Rank":
			return "text-indigo-600";
		default:
			return "text-gray-600";
	}
};

// Get operation display info from metadata
const getOperationDisplayInfo = (
	operationType: string,
	inputArrayType: InputArrayType,
): { label: string; category?: string } => {
	const meta = getOperationMeta(operationType, inputArrayType);
	return {
		label: meta?.label ?? operationType,
		category: meta?.category,
	};
};

// Get input config display name
const getInputDisplayName = (input: InputConfig): string => {
	if (isSeriesInput(input)) {
		return input.fromSeriesDisplayName;
	}
	if (isScalarInput(input)) {
		return input.fromScalarDisplayName;
	}
	if (isScalarValueInput(input)) {
		return String(input.scalarValue);
	}
	if (isParentGroupScalarValueInput(input)) {
		return String(input.fromScalarValue);
	}
	return "Unknown";
};

// Get input source info
const getInputSourceInfo = (input: InputConfig): string | null => {
	if (isSeriesInput(input)) {
		return input.fromNodeName;
	}
	if (isScalarInput(input)) {
		return input.fromNodeName;
	}
	if (isParentGroupScalarValueInput(input)) {
		return input.fromNodeName;
	}
	return null;
};

// Get input badge type
const getInputBadgeType = (input: InputConfig): InputBadgeType => {
	if (isSeriesInput(input)) {
		return "Series";
	}
	if (isScalarInput(input)) {
		return "Scalar";
	}
	return "CustomScalarValue";
};

// Get input from node type
const getInputFromNodeType = (input: InputConfig): NodeType | null => {
	if (isSeriesInput(input) || isScalarInput(input) || isParentGroupScalarValueInput(input)) {
		return input.fromNodeType;
	}
	return null;
};

// Render node type icon based on fromNodeType
const NodeTypeIcon: React.FC<{ nodeType: NodeType | null }> = ({ nodeType }) => {
	if (!nodeType) return null;
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

// Input item component
const InputItem: React.FC<{ input: InputConfig }> = ({ input }) => {
	const sourceInfo = getInputSourceInfo(input);
	const badgeType = getInputBadgeType(input);
	const fromNodeType = getInputFromNodeType(input);

	return (
		<div className="flex flex-col gap-0.5">
			<div className="flex items-center gap-2">
				<NodeTypeIcon nodeType={fromNodeType} />
				<span className="text-sm flex-1">{getInputDisplayName(input)}</span>
				<Badge
					variant="outline"
					className={cn("text-[10px] px-1.5 py-0", getInputTypeBadgeStyle(badgeType))}
				>
					{getInputTypeBadgeLabel(badgeType)}
				</Badge>
			</div>
			{sourceInfo && (
				<span className="text-xs text-muted-foreground pl-5.5">
					↳ {sourceInfo}
				</span>
			)}
		</div>
	);
};

// Operation section
const OperationSection: React.FC<{ data: OperationNodeData }> = ({ data }) => {
	const inputArrayType = data.inputConfig?.type ?? "Unary";
	const { label, category } = getOperationDisplayInfo(data.operation.type, inputArrayType);

	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2">
				<Label className="text-sm font-bold text-muted-foreground">
					Operation
				</Label>
			</div>
			<div className="flex flex-col gap-1 bg-gray-100 p-2 rounded-md">
				<div className="flex items-center gap-2">
					<SquareFunction className="w-4 h-4 text-muted-foreground" />
					<span className="text-sm font-medium">{label}</span>
				</div>
				{category && (
					<div className="flex items-center gap-2">
						<ChartColumnStacked className="w-4 h-4 text-muted-foreground" />
						<span className={cn("text-xs", getCategoryTextColor(category))}>
							{category}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

// Input section
const InputSection: React.FC<{
	inputConfig: OperationNodeData["inputConfig"];
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}> = ({ inputConfig, isOpen, onOpenChange }) => {
	const renderInputContent = () => {
		if (!inputConfig) {
			return (
				<div className="bg-gray-100 p-2 rounded-md">
					<span className="text-sm text-red-500">Not Configured</span>
				</div>
			);
		}

		switch (inputConfig.type) {
			case "Unary": {
				const unaryConfig = inputConfig as UnaryInputConfig;
				return (
					<div className="bg-gray-100 p-2 rounded-md">
						<InputItem input={unaryConfig.input} />
					</div>
				);
			}
			case "Binary": {
				const binaryConfig = inputConfig as BinaryInputConfig;
				return (
					<div className="flex flex-col gap-1.5">
						{binaryConfig.input1 ? (
							<div className="bg-gray-100 p-2 rounded-md">
								<InputItem input={binaryConfig.input1} />
							</div>
						) : (
							<div className="bg-gray-100 p-2 rounded-md">
								<span className="text-sm text-red-500">
									Input 1: Not Configured
								</span>
							</div>
						)}
						{binaryConfig.input2 ? (
							<div className="bg-gray-100 p-2 rounded-md">
								<InputItem input={binaryConfig.input2} />
							</div>
						) : (
							<div className="bg-gray-100 p-2 rounded-md">
								<span className="text-sm text-red-500">
									Input 2: Not Configured
								</span>
							</div>
						)}
					</div>
				);
			}
			case "Nary": {
				const naryConfig = inputConfig as NaryInputConfig;
				if (naryConfig.inputs.length === 0) {
					return (
						<div className="bg-gray-100 p-2 rounded-md">
							<span className="text-sm text-red-500">Not Configured</span>
						</div>
					);
				}
				return (
					<div className="flex flex-col gap-1.5">
						{naryConfig.inputs.map((input) => (
							<div key={input.configId} className="bg-gray-100 p-2 rounded-md">
								<InputItem input={input} />
							</div>
						))}
					</div>
				);
			}
			default:
				return null;
		}
	};

	// Get input count for badge
	const getInputCount = (): number => {
		if (!inputConfig) return 0;
		switch (inputConfig.type) {
			case "Unary":
				return 1;
			case "Binary":
				return 2;
			case "Nary":
				return (inputConfig as NaryInputConfig).inputs.length;
			default:
				return 0;
		}
	};

	const inputCount = getInputCount();

	return (
		<div className="space-y-1">
			<Collapsible open={isOpen} onOpenChange={onOpenChange}>
				<CollapsibleTrigger className="flex items-center gap-2 w-full">
					{isOpen ? (
						<ChevronDown className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
					{/* <ArrowDown className="w-3.5 h-3.5 text-blue-500" /> */}
					<Label className="text-sm font-bold text-muted-foreground">
						Input
					</Label>
					{inputCount > 0 && (
						<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
							{inputCount}
						</Badge>
					)}
				</CollapsibleTrigger>
				<CollapsibleContent className="mt-1">
					{renderInputContent()}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
};

// Output section
const OutputSection: React.FC<{
	outputConfig: OutputConfig | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}> = ({ outputConfig, isOpen, onOpenChange }) => {
	return (
		<div className="space-y-1">
			<Collapsible open={isOpen} onOpenChange={onOpenChange}>
				<CollapsibleTrigger className="flex items-center gap-2 w-full">
					{isOpen ? (
						<ChevronDown className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
					{/* <ArrowRight className="w-3.5 h-3.5 text-green-500" /> */}
					<Label className="text-sm font-bold text-muted-foreground">
						Output
					</Label>
				</CollapsibleTrigger>
				<CollapsibleContent className="mt-1">
					{outputConfig ? (
						<div className="bg-gray-100 p-2 rounded-md">
							<div className="flex items-center justify-between gap-4">
								<span className="text-sm">
									{outputConfig.outputName}
								</span>
								<Badge
									variant="outline"
									className={cn("text-[10px] px-1.5 py-0", getInputTypeBadgeStyle(outputConfig.type))}
								>
									{outputConfig.type}
								</Badge>
							</div>
						</div>
					) : (
						<div className="bg-gray-100 p-2 rounded-md">
							<span className="text-sm text-red-500">Not Configured</span>
						</div>
					)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
};

const NodeShow: React.FC<NodeShowProps> = ({ data }) => {
	const [isInputOpen, setIsInputOpen] = useState(true);
	const [isOutputOpen, setIsOutputOpen] = useState(true);

	return (
		<div className="space-y-3">
			<OutputSection
				outputConfig={data.outputConfig}
				isOpen={isOutputOpen}
				onOpenChange={setIsOutputOpen}
			/>
			<OperationSection data={data} />
			<InputSection
				inputConfig={data.inputConfig}
				isOpen={isInputOpen}
				onOpenChange={setIsInputOpen}
			/>
			
		</div>
	);
};

export default NodeShow;
