import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactFlow } from "@xyflow/react";
import { renderVariableOptions } from "@/components/flow/node/node-utils";
import {
	isScalarOutput,
	isSeriesOutput,
	isSeriesInput,
	isScalarInput,
	isScalarValueInput,
	isParentGroupScalarValueInput,
	type OperationCustomScalarValueConfig,
	type OperationParentGroupScalarValueConfig,
	type OperationInputScalarConfig,
	type OperationInputSeriesConfig,
} from "@/types/node/group/operation-group";
import {
	isSeriesOutput as isOperationNodeSeriesOutput,
	isScalarOutput as isOperationNodeScalarOutput,
} from "@/types/node/operation-node";
import type { VariableConfig } from "@/types/node/variable-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
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
	filterInterval,
	onDisplayNameBlur,
	onNodeChange,
	onVariableChange,
	onScalarValueChange,
	onTypeChange,
	onScalarSourceChange,
	onDelete,
}) => {
	const { t } = useTranslation();
	const { getNodes } = useReactFlow();

	// Type flags for different config types
	// isScalarType: includes both "Scalar" (with variable name) and "CustomScalarValue" (value only)
	const isScalarType = config.type === "Scalar" || config.type === "CustomScalarValue";

	// Self-defined custom scalar value (source: null)
	const isCustomScalar = config.type === "CustomScalarValue" && config.source === null;

	// Custom scalar value from parent Group
	const isGroupCustomScalar = config.type === "CustomScalarValue" && config.source === "ParentGroup";

	// Scalar with variable name from any source except ParentGroup (for CustomScalarValue)
	// This includes OuterNode, OperationNode, ChildGroup
	const isScalarFromNode = config.type === "Scalar" && config.source !== "ParentGroup";

	// Scalar with variable name from parent Group
	const isScalarFromGroup = config.type === "Scalar" && config.source === "ParentGroup";

	// Filter node list by node type
	// Scalar mode: show VariableNode, OperationGroup, and OperationNode (only if has Scalar outputs)
	const scalarNodeList = useMemo(
		() =>
			variableItemList.filter((item) => {
				if (item.nodeType === NodeType.VariableNode) {
					return true;
				}
				if (item.nodeType === NodeType.OperationGroup) {
					// Check both output (from child OperationGroup) and input (from parent Group via OperationStartNode)
					return (
						item.variables.some((v) => isScalarOutput(v)) ||
						item.variables.some((v) => isScalarInput(v)) ||
						item.variables.some((v) => isScalarValueInput(v)) ||
						item.variables.some((v) => isParentGroupScalarValueInput(v))
					);
				}
				if (item.nodeType === NodeType.OperationNode) {
					return item.variables.some((v) => isOperationNodeScalarOutput(v));
				}
				if (item.nodeType === NodeType.OperationStartNode) {
					// Include nodes that have scalar inputs (with variable name) or custom scalar values
					return (
						item.variables.some((v) => isScalarValueInput(v)) ||
						item.variables.some((v) => isParentGroupScalarValueInput(v)) ||
						item.variables.some((v) => isScalarInput(v))
					);
				}
				return false;
			}),
		[variableItemList],
	);

	// Series mode: exclude VariableNode, and for OperationGroup/OperationNode only include if has Series outputs
	// Also filter KlineNode variables by interval if filterInterval is set
	// For IndicatorNode, filter entire node if its interval doesn't match filterInterval
	const seriesNodeList = useMemo(
		() =>
			variableItemList
				.filter((item) => {
					if (item.nodeType === NodeType.VariableNode) {
						return false;
					}
					if (item.nodeType === NodeType.OperationGroup) {
						// Check both output (from child OperationGroup) and input (from parent Group via OperationStartNode)
						return item.variables.some((v) => isSeriesOutput(v)) || item.variables.some((v) => isSeriesInput(v));
					}
					if (item.nodeType === NodeType.OperationNode) {
						return item.variables.some((v) => isOperationNodeSeriesOutput(v));
					}
					if (item.nodeType === NodeType.OperationStartNode) {
						return item.variables.some((v) => isSeriesInput(v));
					}
					// For KlineNode, check if it has any variables matching filterInterval
					if (item.nodeType === NodeType.KlineNode && filterInterval !== null) {
						return item.variables.some((v) => {
							const symbol = v as SelectedSymbol;
							return symbol.interval === filterInterval;
						});
					}
					// For IndicatorNode, check if its interval matches filterInterval
					if (item.nodeType === NodeType.IndicatorNode && filterInterval !== null) {
						const indicatorNode = getNodes().find((n) => n.id === item.nodeId);
						if (indicatorNode) {
							const indicatorData = indicatorNode.data as IndicatorNodeData;
							const selectedSymbol = indicatorData?.backtestConfig?.exchangeModeConfig?.selectedSymbol;
							// If no selectedSymbol or interval doesn't match, filter out entire node
							if (!selectedSymbol?.interval || selectedSymbol.interval !== filterInterval) {
								return false;
							}
						}
					}
					return true;
				})
				.map((item) => {
					// For KlineNode with filterInterval set, filter its variables
					if (item.nodeType === NodeType.KlineNode && filterInterval !== null) {
						return {
							...item,
							variables: item.variables.filter((v) => {
								const symbol = v as SelectedSymbol;
								return symbol.interval === filterInterval;
							}),
						};
					}
					return item;
				}),
		[variableItemList, filterInterval, getNodes],
	);

	// Local state for display name input (only save on blur)
	const [localDisplayName, setLocalDisplayName] = useState(config.inputName);

	// Local state for scalar value input (only for custom scalar)
	const [localScalarValue, setLocalScalarValue] = useState(
		isCustomScalar
			? (config as OperationCustomScalarValueConfig).scalarValue.toString()
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
			return (config as OperationCustomScalarValueConfig).scalarValue;
		}
		if (isGroupCustomScalar) {
			return (config as OperationParentGroupScalarValueConfig).fromScalarValue;
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
			// Check both output (from child OperationGroup) and input (from parent Group via OperationStartNode)
			if (selectedNode.nodeType === NodeType.OperationGroup) {
				return selectedNode.variables.filter((variable) => {
					if (isScalarType) {
						return isScalarOutput(variable) || isScalarInput(variable) || isScalarValueInput(variable) || isParentGroupScalarValueInput(variable);
					}
					return isSeriesOutput(variable) || isSeriesInput(variable);
				});
			}
			// If the node is an OperationNode, filter by Series/Scalar type
			if (selectedNode.nodeType === NodeType.OperationNode) {
				return selectedNode.variables.filter((variable) => {
					return isScalarType ? isOperationNodeScalarOutput(variable) : isOperationNodeSeriesOutput(variable);
				});
			}
			if (selectedNode.nodeType === NodeType.OperationStartNode) {
				return selectedNode.variables.filter((variable) => {
					return isScalarType
						? isScalarInput(variable) || isScalarValueInput(variable) || isParentGroupScalarValueInput(variable)
						: isSeriesInput(variable);
				});
			}

			// For KlineNode, filter by interval if filterInterval is set
			if (selectedNode.nodeType === NodeType.KlineNode && filterInterval !== null) {
				return selectedNode.variables.filter((variable) => {
					const symbol = variable as SelectedSymbol;
					return symbol.interval === filterInterval;
				});
			}

			return selectedNode.variables;
		},
		[variableItemList, isScalarType, filterInterval],
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
			return (config as OperationParentGroupScalarValueConfig).fromNodeId;
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
			numValue !== (config as OperationCustomScalarValueConfig).scalarValue
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
	// Only pass varType for OperationGroup/OperationStartNode/OperationNode sources, not for regular nodes
	const currentVariableValue = useMemo(() => {
		if (config.type === "Series") {
			const seriesConfig = config as OperationInputSeriesConfig;
			// console.log("🔍 seriesConfig", seriesConfig);
			if (seriesConfig.fromHandleId && seriesConfig.fromSeriesName) {
				// Only pass varType for OperationGroup/OperationStartNode/OperationNode
				const needVarType = seriesConfig.fromNodeType === NodeType.OperationGroup ||
					seriesConfig.fromNodeType === NodeType.OperationStartNode ||
					seriesConfig.fromNodeType === NodeType.OperationNode;
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
			// console.log("🔍 scalarNodeConfig", scalarNodeConfig);
			if (scalarNodeConfig.fromHandleId && scalarNodeConfig.fromScalarName) {
				// Only pass varType for OperationGroup/OperationStartNode/OperationNode
				const needVarType = scalarNodeConfig.fromNodeType === NodeType.OperationGroup ||
					scalarNodeConfig.fromNodeType === NodeType.OperationStartNode ||
					scalarNodeConfig.fromNodeType === NodeType.OperationNode;
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
			const groupScalarConfig = config as OperationParentGroupScalarValueConfig;
			console.log("🔍 groupScalarConfig", groupScalarConfig);
			if (groupScalarConfig.fromHandleId) {
				// GroupCustomScalar always comes from parent OperationGroup (via OperationStartNode), so always pass varType
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
