import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { renderVariableOptions } from "@/components/flow/node/node-utils";
import {
	isScalarOutput,
	isSeriesOutput,
	isSeriesInput,
	isScalarInput,
	isScalarValueInput,
	isGroupScalarValueInput,
	type OperationInputScalarValueConfig,
	type OperationInputGroupScalarValueConfig,
	type OperationInputScalarConfig,
	type OperationInputSeriesConfig,
} from "@/types/node/group/operation-group";
import type { VariableConfig } from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import { NodeType } from "@/types/node";
import type { InputConfigItemProps } from "../types";
import { ConfigHeader } from "./components/config-header";
import { TypeSelector } from "./components/type-selector";
import { NameInput } from "./components/name-input";
import { ScalarSection } from "./components/scalar-section";
import { SeriesSection } from "./components/series-section";

export const InputConfigItem: React.FC<InputConfigItemProps> = ({
	variableItemList,
	config,
	onDisplayNameBlur,
	onNodeChange,
	onVariableChange,
	onScalarValueChange,
	onTypeChange,
	onScalarSourceChange,
	onDelete,
}) => {
	const { t } = useTranslation();

	// Type flags for different config types
	// isScalarType: includes both "Scalar" (with variable name) and "CustomScalarValue" (value only)
	const isScalarType = config.type === "Scalar" || config.type === "CustomScalarValue";

	// Self-defined custom scalar value (source: null)
	const isCustomScalar = config.type === "CustomScalarValue" && config.source === null;

	// Custom scalar value from parent Group
	const isGroupCustomScalar = config.type === "CustomScalarValue" && config.source === "Group";

	// Scalar with variable name from upstream Node
	const isScalarFromNode = config.type === "Scalar" && config.source === "Node";

	// Scalar with variable name from parent Group
	const isScalarFromGroup = config.type === "Scalar" && config.source === "Group";

	// Filter node list by node type
	// Scalar mode: show VariableNode and OperationGroup (only if has Scalar outputs)
	const scalarNodeList = useMemo(
		() =>
			variableItemList.filter((item) => {
				if (item.nodeType === NodeType.VariableNode) {
					return true;
				}
				if (item.nodeType === NodeType.OperationGroup) {
					return item.variables.some((v) => isScalarOutput(v));
				}
				if (item.nodeType === NodeType.OperationStartNode) {
					// Include nodes that have scalar inputs (with variable name) or custom scalar values
					return (
						item.variables.some((v) => isScalarValueInput(v)) ||
						item.variables.some((v) => isGroupScalarValueInput(v)) ||
						item.variables.some((v) => isScalarInput(v))
					);
				}
				return false;
			}),
		[variableItemList],
	);

	// Series mode: exclude VariableNode, and for OperationGroup only include if has Series outputs
	const seriesNodeList = useMemo(
		() =>
			variableItemList.filter((item) => {
				if (item.nodeType === NodeType.VariableNode) {
					return false;
				}
				if (item.nodeType === NodeType.OperationGroup) {
					return item.variables.some((v) => isSeriesOutput(v));
				}
				if (item.nodeType === NodeType.OperationStartNode) {
					return item.variables.some((v) => isSeriesInput(v));
				}
				return true;
			}),
		[variableItemList],
	);

	// Local state for display name input (only save on blur)
	const [localDisplayName, setLocalDisplayName] = useState(config.inputName);

	// Local state for scalar value input (only for custom scalar)
	const [localScalarValue, setLocalScalarValue] = useState(
		isCustomScalar
			? (config as OperationInputScalarValueConfig).scalarValue.toString()
			: "0",
	);

	// Track if the name field has been touched (for validation)
	const [isInputName, setIsInputName] = useState(false);

	// Check if name is empty or only whitespace
	const isNameEmpty = localDisplayName.trim() === "";

	// Get display name based on config type
	const configDisplayName = config.inputName;

	// Get scalar value (for custom Scalar or Group custom scalar)
	const configScalarValue = useMemo(() => {
		if (isCustomScalar) {
			return (config as OperationInputScalarValueConfig).scalarValue;
		}
		if (isGroupCustomScalar) {
			return (config as OperationInputGroupScalarValueConfig).fromScalarValue;
		}
		return 0;
	}, [config, isCustomScalar, isGroupCustomScalar]);

	// Sync local state when config changes from outside
	useEffect(() => {
		setLocalDisplayName(configDisplayName);
	}, [configDisplayName]);

	useEffect(() => {
		if (isCustomScalar || isGroupCustomScalar) {
			setLocalScalarValue(configScalarValue.toString());
		}
	}, [isCustomScalar, isGroupCustomScalar, configScalarValue]);

	// Generate option value for variable selector
	// Format: nodeId|handleId|variable|variableName|configId|varType
	// varType: "Series" | "Scalar" | "CustomScalarValue"
	const generateOptionValue = useCallback(
		(
			nodeId: string,
			handleId: string,
			variable: string | number,
			variableName?: string | null,
			configId?: number,
			varType?: string,
		) => {
			const typeStr = varType || "";
			if (variableName) {
				return `${nodeId}|${handleId}|${variable}|${variableName}|${configId}|${typeStr}`;
			}
			return `${nodeId}|${handleId}||${variable}|${configId}|${typeStr}`;
		},
		[],
	);

	// Get variables for selected node (for Series type or Scalar from Node)
	const getSelectedNodeVariables = useCallback(
		(nodeId: string) => {
			const selectedNode = variableItemList.find(
				(item) => item.nodeId === nodeId,
			);
			if (!selectedNode) return [];

			// If the node is a VariableNode, filter to only include NUMBER type variables
			if (selectedNode.nodeType === NodeType.VariableNode) {
				return selectedNode.variables.filter((variable) => {
					const varConfig = variable as VariableConfig;
					return varConfig.varValueType === VariableValueType.NUMBER;
				});
			}

			// If the node is an OperationGroup, filter by Series/Scalar type
			if (selectedNode.nodeType === NodeType.OperationGroup) {
				return selectedNode.variables.filter((variable) => {
					return isScalarType ? isScalarOutput(variable) : isSeriesOutput(variable);
				});
			}
			if (selectedNode.nodeType === NodeType.OperationStartNode) {
				return selectedNode.variables.filter((variable) => {
					return isScalarType
						? isScalarInput(variable) || isScalarValueInput(variable) || isGroupScalarValueInput(variable)
						: isSeriesInput(variable);
				});
			}

			return selectedNode.variables;
		},
		[variableItemList, isScalarType],
	);

	// Get current fromNodeId based on config type
	const getCurrentFromNodeId = useCallback(() => {
		if (config.type === "Series") {
			return (config as OperationInputSeriesConfig).fromNodeId;
		}
		if (isScalarFromNode || isScalarFromGroup) {
			return (config as OperationInputScalarConfig).fromNodeId;
		}
		if (isGroupCustomScalar) {
			return (config as OperationInputGroupScalarValueConfig).fromNodeId;
		}
		return "";
	}, [config, isScalarFromNode, isScalarFromGroup, isGroupCustomScalar]);

	// Render variable options for Series or Scalar from Node
	const renderVariableContent = useCallback(() => {
		const fromNodeId = getCurrentFromNodeId();
		if (!fromNodeId) return null;

		const variables = getSelectedNodeVariables(fromNodeId);
		const options = renderVariableOptions({
			variables,
			localNodeId: fromNodeId,
			generateOptionValue,
			t,
		});

		if (!options || options.length === 0) {
			return (
				<div className="py-2 text-center text-sm text-muted-foreground">
					No available variables
				</div>
			);
		}

		return options;
	}, [getCurrentFromNodeId, getSelectedNodeVariables, generateOptionValue, t]);

	// Handle display name blur - save to node data
	const handleDisplayNameBlur = useCallback(() => {
		setIsInputName(true);
		if (localDisplayName !== config.inputName) {
			onDisplayNameBlur(config.configId, localDisplayName);
		}
	}, [config.configId, config.inputName, localDisplayName, onDisplayNameBlur]);

	// Handle scalar value blur (only for custom scalar)
	const handleScalarValueBlur = useCallback(() => {
		if (!isCustomScalar) return;
		const numValue = Number.parseFloat(localScalarValue);
		if (
			!Number.isNaN(numValue) &&
			numValue !== (config as OperationInputScalarValueConfig).scalarValue
		) {
			onScalarValueChange(config.configId, numValue);
		}
	}, [config, isCustomScalar, localScalarValue, onScalarValueChange]);

	// Handle node selection (for Series type or Scalar from Node)
	const handleNodeChange = useCallback(
		(nodeId: string) => {
			if (!isCustomScalar) {
				onNodeChange(config.configId, nodeId);
			}
		},
		[config.configId, isCustomScalar, onNodeChange],
	);

	// Handle variable selection (for Series type or Scalar from Node)
	const handleVariableChange = useCallback(
		(value: string) => {
			console.log("🔍 Raw value:", value);
			if (isCustomScalar) return;
			const [nodeId, handleId, variable, variableName, varConfigId, varType] = value.split("|");
			console.log("🔍 Variable change:", {
				configId: config.configId,
				nodeId,
				handleId,
				variable,
				variableName,
				varConfigId,
				varType,
			});
			onVariableChange(
				config.configId,
				nodeId,
				handleId,
				variable,
				variableName || variable,
				Number(varConfigId),
				varType,
			);
		},
		[config.configId, isCustomScalar, onVariableChange],
	);

	// Get current variable value for selector (for Series type or Scalar from Node/Group)
	// Only pass varType for OperationGroup/OperationStartNode sources, not for regular nodes
	const currentVariableValue = useMemo(() => {
		if (config.type === "Series") {
			const seriesConfig = config as OperationInputSeriesConfig;
			console.log("🔍 seriesConfig", seriesConfig);
			if (seriesConfig.fromHandleId && seriesConfig.fromSeriesName) {
				// Only pass varType for OperationGroup/OperationStartNode
				const needVarType = seriesConfig.fromNodeType === NodeType.OperationGroup ||
					seriesConfig.fromNodeType === NodeType.OperationStartNode;
				return generateOptionValue(
					seriesConfig.fromNodeId,
					seriesConfig.fromHandleId,
					seriesConfig.fromSeriesName,
					seriesConfig.fromSeriesDisplayName,
					seriesConfig.fromSeriesConfigId,
					needVarType ? "Series" : undefined,
				);
			}
		}
		if (isScalarFromNode || isScalarFromGroup) {
			const scalarNodeConfig = config as OperationInputScalarConfig;
			console.log("🔍 scalarNodeConfig", scalarNodeConfig);
			if (scalarNodeConfig.fromHandleId && scalarNodeConfig.fromScalarName) {
				// Only pass varType for OperationGroup/OperationStartNode
				const needVarType = scalarNodeConfig.fromNodeType === NodeType.OperationGroup ||
					scalarNodeConfig.fromNodeType === NodeType.OperationStartNode;
				return generateOptionValue(
					scalarNodeConfig.fromNodeId,
					scalarNodeConfig.fromHandleId,
					scalarNodeConfig.fromScalarName,
					scalarNodeConfig.fromScalarDisplayName,
					scalarNodeConfig.fromScalarConfigId,
					needVarType ? "Scalar" : undefined,
				);
			}
		}
		if (isGroupCustomScalar) {
			const groupScalarConfig = config as OperationInputGroupScalarValueConfig;
			console.log("🔍 groupScalarConfig", groupScalarConfig);
			if (groupScalarConfig.fromHandleId) {
				// GroupCustomScalar always comes from OperationStartNode, so always pass varType
				return generateOptionValue(
					groupScalarConfig.fromNodeId,
					groupScalarConfig.fromHandleId,
					groupScalarConfig.fromScalarValue.toString(),
					groupScalarConfig.fromScalarDisplayName,
					groupScalarConfig.fromScalarConfigId,
					"CustomScalarValue",
				);
			}
		}
		return "";
	}, [config, isScalarFromNode, isScalarFromGroup, isGroupCustomScalar, generateOptionValue]);

	return (
		<div className="flex flex-col gap-2.5 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
			<ConfigHeader
				configId={config.configId}
				type={config.type}
				onDelete={onDelete}
			/>

			<TypeSelector
				configId={config.configId}
				isScalar={isScalarType}
				onTypeChange={onTypeChange}
			/>

			<NameInput
				configId={config.configId}
				isScalar={isScalarType}
				value={localDisplayName}
				onChange={setLocalDisplayName}
				onBlur={handleDisplayNameBlur}
				showError={isInputName && isNameEmpty}
			/>

			{isScalarType ? (
				<ScalarSection
					config={config}
					isCustomScalar={isCustomScalar}
					localScalarValue={localScalarValue}
					onScalarValueChange={setLocalScalarValue}
					onScalarValueBlur={handleScalarValueBlur}
					onScalarSourceChange={onScalarSourceChange}
					nodeList={scalarNodeList}
					fromNodeId={getCurrentFromNodeId()}
					currentVariableValue={currentVariableValue}
					onNodeChange={handleNodeChange}
					onVariableChange={handleVariableChange}
					renderVariableContent={renderVariableContent}
				/>
			) : (
				<SeriesSection
					fromNodeId={getCurrentFromNodeId()}
					nodeList={seriesNodeList}
					currentVariableValue={currentVariableValue}
					onNodeChange={handleNodeChange}
					onVariableChange={handleVariableChange}
					renderVariableContent={renderVariableContent}
				/>
			)}
		</div>
	);
};

export default InputConfigItem;
