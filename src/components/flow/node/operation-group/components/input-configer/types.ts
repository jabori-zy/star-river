import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { OperationInputConfig } from "@/types/node/group/operation-group";

export type ConfigType = "Series" | "Scalar" | "CustomScalarValue";
export type ScalarSource = "Value" | "Node" | "Group";

// Single config item props
export interface InputConfigItemProps {
	variableItemList: VariableItem[];
	config: OperationInputConfig;
	filterInterval: string | null;
	onDisplayNameBlur: (configId: number, displayName: string) => void;
	onNodeChange: (configId: number, nodeId: string) => void;
	onVariableChange: (
		configId: number,
		nodeId: string,
		handleId: string,
		varName: string,
		varDisplayName: string,
		varConfigId: number,
		varType?: string,
	) => void;
	onScalarValueChange: (configId: number, value: number) => void;
	onTypeChange: (configId: number, newType: ConfigType) => void;
	onScalarSourceChange: (configId: number, source: ScalarSource) => void;
	onDelete: (configId: number) => void;
}

// Main operation configer component props
export interface InputConfigerProps {
	variableItemList: VariableItem[];
	inputConfigs: OperationInputConfig[];
	filterInterval: string | null;
	onAddConfig: () => void;
	onUpdateDisplayName: (configId: number, displayName: string) => void;
	onUpdateNode: (configId: number, nodeId: string) => void;
	onUpdateVariable: (
		configId: number,
		nodeId: string,
		handleId: string,
		varName: string,
		varDisplayName: string,
		varConfigId: number,
		varType?: string,
	) => void;
	onUpdateScalarValue: (configId: number, value: number) => void;
	onTypeChange: (configId: number, newType: ConfigType) => void;
	onScalarSourceChange: (configId: number, source: ScalarSource) => void;
	onRemoveConfig: (configId: number) => void;
	className?: string;
}
