import type React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OperationOutputConfig } from "@/types/node/group/operation-group";
import { isSeriesOutput, isScalarOutput } from "@/types/node/group/operation-group";

// Output badge type
type OutputBadgeType = "Series" | "Scalar";

// Get badge style based on output type
const getOutputTypeBadgeStyle = (outputType: OutputBadgeType): string => {
	if (outputType === "Series") {
		return "border-orange-500 text-orange-400";
	}
	return "border-blue-500 text-blue-400";
};

// Get output badge type from config
const getOutputBadgeType = (config: OperationOutputConfig): OutputBadgeType => {
	if (isSeriesOutput(config)) {
		return "Series";
	}
	return "Scalar";
};

// Get display name from config
const getDisplayName = (config: OperationOutputConfig): string => {
	if (isSeriesOutput(config)) {
		return config.seriesDisplayName;
	}
	if (isScalarOutput(config)) {
		return config.scalarDisplayName;
	}
	return "Unknown";
};

// Get source node name from config
const getSourceNodeName = (config: OperationOutputConfig): string => {
	return config.sourceNodeName;
};

interface OutputConfigItemProps {
	config: OperationOutputConfig;
}

export const OutputConfigItem: React.FC<OutputConfigItemProps> = ({
	config,
}) => {
	const badgeType = getOutputBadgeType(config);
	const displayName = getDisplayName(config);
	const sourceNodeName = getSourceNodeName(config);

	return (
		<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md">
			<div className="flex flex-col gap-0.5 flex-1">
				<div className="flex items-center justify-between">
					<span className="text-sm">{displayName}</span>
					<Badge
						variant="outline"
						className={cn("text-[10px] px-1.5 py-0", getOutputTypeBadgeStyle(badgeType))}
					>
						{badgeType}
					</Badge>
				</div>
				<span className="text-xs text-muted-foreground">
					↳ {sourceNodeName}
				</span>
			</div>
		</div>
	);
};

export default OutputConfigItem;
