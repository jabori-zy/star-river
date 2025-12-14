import type React from "react";
import { SquareFunction, ArrowDown, ArrowRight, SquareAsterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
	isGroupScalarValueInput,
} from "@/types/node/operation-node";
import {
	getInputTypeBadgeStyle,
	getInputTypeBadgeLabel,
	type InputBadgeType,
} from "../../operation-node-utils";

interface NodeShowProps {
	data: OperationNodeData;
}

// Get operation display name
const getOperationDisplayName = (operation: { type: string }): string => {
	return operation.type;
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
	if (isGroupScalarValueInput(input)) {
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
	if (isGroupScalarValueInput(input)) {
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

// Input item component
const InputItem: React.FC<{ input: InputConfig }> = ({ input }) => {
	const sourceInfo = getInputSourceInfo(input);
	const badgeType = getInputBadgeType(input);
	return (
		<div className="flex flex-col gap-0.5">
			<div className="flex items-center justify-between">
				<span className="text-sm">{getInputDisplayName(input)}</span>
				<Badge
					variant="outline"
					className={cn("text-[10px] px-1.5 py-0", getInputTypeBadgeStyle(badgeType))}
				>
					{getInputTypeBadgeLabel(badgeType)}
				</Badge>
			</div>
			{sourceInfo && (
				<span className="text-xs text-muted-foreground">
					↳ {sourceInfo}
				</span>
			)}
		</div>
	);
};

// Operation section
const OperationSection: React.FC<{ data: OperationNodeData }> = ({ data }) => {
	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2">
				<SquareAsterisk className="w-3.5 h-3.5 text-purple-500" />
				<Label className="text-sm font-bold text-muted-foreground">
					Operation
				</Label>
			</div>
			<div className="flex flex-col gap-1.5 bg-gray-100 p-2 rounded-md">
				<div className="flex items-center gap-2">
					<SquareFunction className="w-4 h-4 text-muted-foreground" />
					<span className="text-sm font-medium">
						{getOperationDisplayName(data.operation)}
					</span>
				</div>
			</div>
		</div>
	);
};

// Input section
const InputSection: React.FC<{
	inputConfig: OperationNodeData["inputConfig"];
}> = ({ inputConfig }) => {
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

	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2">
				<ArrowDown className="w-3.5 h-3.5 text-blue-500" />
				<Label className="text-sm font-bold text-muted-foreground">
					Input
				</Label>
			</div>
			{renderInputContent()}
		</div>
	);
};

// Output section
const OutputSection: React.FC<{
	outputConfig: OutputConfig | null;
}> = ({ outputConfig }) => {
	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2">
				<ArrowRight className="w-3.5 h-3.5 text-green-500" />
				<Label className="text-sm font-bold text-muted-foreground">
					Output
				</Label>
			</div>
			{outputConfig ? (
				<div className="bg-gray-100 p-2 rounded-md">
					<div className="flex items-center justify-between">
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
		</div>
	);
};

const NodeShow: React.FC<NodeShowProps> = ({ data }) => {
	return (
		<div className="space-y-3">
			<OperationSection data={data} />
			<InputSection inputConfig={data.inputConfig} />
			<OutputSection outputConfig={data.outputConfig} />
		</div>
	);
};

export default NodeShow;
