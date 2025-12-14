import type React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OperationInputConfig } from "@/types/node/group/operation-group";
import {
	isSeriesInput,
	isScalarInput,
	isScalarValueInput,
	isGroupScalarValueInput,
} from "@/types/node/group/operation-group";

// Input badge type
type InputBadgeType = "Series" | "Scalar" | "CustomScalarValue";

// Get badge style based on input type
const getInputTypeBadgeStyle = (inputType: InputBadgeType): string => {
	if (inputType === "Series") {
		return "border-orange-500 text-orange-400";
	}
	return "border-blue-500 text-blue-400";
};

// Get badge label
const getInputTypeBadgeLabel = (inputType: InputBadgeType): string => {
	if (inputType === "CustomScalarValue") {
		return "Scalar";
	}
	return inputType;
};

// Get input badge type from config
const getInputBadgeType = (config: OperationInputConfig): InputBadgeType => {
	if (isSeriesInput(config)) {
		return "Series";
	}
	if (isScalarInput(config)) {
		return "Scalar";
	}
	return "CustomScalarValue";
};

// Get display name from config
const getDisplayName = (config: OperationInputConfig): string => {
	if (isSeriesInput(config)) {
		return config.seriesDisplayName;
	}
	if (isScalarInput(config)) {
		return config.scalarDisplayName;
	}
	if (isScalarValueInput(config)) {
		return String(config.scalarValue);
	}
	if (isGroupScalarValueInput(config)) {
		return String(config.fromScalarValue);
	}
	return "Unknown";
};

// Get source node name from config
const getSourceNodeName = (config: OperationInputConfig): string | null => {
	if (isSeriesInput(config)) {
		return config.fromNodeName;
	}
	if (isScalarInput(config)) {
		return config.fromNodeName;
	}
	if (isGroupScalarValueInput(config)) {
		return config.fromNodeName;
	}
	return null;
};

interface InputConfigItemProps {
	config: OperationInputConfig;
}

export const InputConfigItem: React.FC<InputConfigItemProps> = ({
	config,
}) => {
	const badgeType = getInputBadgeType(config);
	const displayName = getDisplayName(config);
	const sourceNodeName = getSourceNodeName(config);

	return (
		<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md">
			<div className="flex flex-col gap-0.5 flex-1">
				<div className="flex items-center justify-between">
					<span className="text-sm">{displayName}</span>
					<Badge
						variant="outline"
						className={cn("text-[10px] px-1.5 py-0", getInputTypeBadgeStyle(badgeType))}
					>
						{getInputTypeBadgeLabel(badgeType)}
					</Badge>
				</div>
				{sourceNodeName && (
					<span className="text-xs text-muted-foreground">
						↳ {sourceNodeName}
					</span>
				)}
			</div>
		</div>
	);
};

export default InputConfigItem;
