import type { ReactNode } from "react";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { OperationInputConfig } from "@/types/node/group/operation-group";
import type { ConfigType, ScalarSource } from "../types";

// Config header props
export interface ConfigHeaderProps {
	configId: number;
	type: ConfigType;
	onDelete: (configId: number) => void;
}

// Type selector props
export interface TypeSelectorProps {
	configId: number;
	isScalar: boolean;
	onTypeChange: (configId: number, newType: ConfigType) => void;
}

// Name input props
export interface NameInputProps {
	configId: number;
	isScalar: boolean;
	value: string;
	onChange: (value: string) => void;
	onBlur: () => void;
	showError: boolean;
}

// Node variable selector props (shared between Scalar and Series)
export interface NodeVariableSelectorProps {
	nodeList: VariableItem[];
	fromNodeId: string;
	currentVariableValue: string;
	onNodeChange: (nodeId: string) => void;
	onVariableChange: (value: string) => void;
	renderVariableContent: () => ReactNode;
	emptyNodeMessage?: string;
}

// Scalar section props
export interface ScalarSectionProps {
	config: OperationInputConfig;
	isCustomScalar: boolean;
	localScalarValue: string;
	onScalarValueChange: (value: string) => void;
	onScalarValueBlur: () => void;
	onScalarSourceChange: (configId: number, source: ScalarSource) => void;
	nodeList: VariableItem[];
	fromNodeId: string;
	currentVariableValue: string;
	onNodeChange: (nodeId: string) => void;
	onVariableChange: (value: string) => void;
	renderVariableContent: () => ReactNode;
}

// Series section props
export interface SeriesSectionProps {
	fromNodeId: string;
	nodeList: VariableItem[];
	currentVariableValue: string;
	onNodeChange: (nodeId: string) => void;
	onVariableChange: (value: string) => void;
	renderVariableContent: () => ReactNode;
}
