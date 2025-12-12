import type { OperationOutputConfig } from "@/types/node/group/operation-group";

// Output option from source OperationNode
export interface OutputOption {
	sourceNodeId: string;
	sourceNodeName: string;
	outputType: "Series" | "Scalar";
	sourceHandleId: string;
	displayName: string;
}

// Single output config item props
export interface OutputConfigItemProps {
	config: OperationOutputConfig;
	availableOutputs: OutputOption[];
	usedSourceIds: Set<string>; // Already used source IDs (nodeId|handleId)
	onSelectSource: (configId: number, option: OutputOption) => void;
	onDisplayNameBlur: (configId: number, displayName: string) => void;
	onDelete: (configId: number) => void;
}

// Main OutputConfiger component props
export interface OutputConfigerProps {
	availableOutputs: OutputOption[];
	outputConfigs: OperationOutputConfig[];
	onAddConfig: () => void;
	onSelectSource: (configId: number, option: OutputOption) => void;
	onUpdateDisplayName: (configId: number, displayName: string) => void;
	onRemoveConfig: (configId: number) => void;
	className?: string;
}
