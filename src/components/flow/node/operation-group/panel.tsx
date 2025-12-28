import { useNodeConnections, useReactFlow } from "@xyflow/react";
import type React from "react";
import { useCallback, useMemo } from "react";
import { CircleAlert } from "lucide-react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Separator } from "@/components/ui/separator";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useSourceSeriesLength from "@/hooks/flow/use-source-series-length";
import { useUpdateOpGroupConfig } from "@/hooks/node-config/operation-group";
import { NodeType } from "@/types/node";
import type {
	OperationCustomScalarValueConfig,
	OperationParentGroupScalarValueConfig,
	OperationInputScalarConfig,
	OperationInputSeriesConfig,
	OperationInputConfig,
	OperationGroupData,
	InputSource,
} from "@/types/node/group/operation-group";
import type { ScalarSource } from "./components/input-configer";
import type { OperationNodeData } from "@/types/node/operation-node";
import type { KlineNodeData } from "@/types/node/kline-node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import { TradeMode } from "@/types/strategy";
import { InputConfiger } from "./components/input-configer";
import { OutputConfiger, type OutputOption } from "./components/output-configer";
import { WindowConfig, type WindowSizeLimitInfo } from "./components/window-config";
import { FillingMethodSelector } from "./components/filling-method-selector";
import { OutputNameInput } from "./components/output_name_input";
import { Label } from "@/components/ui/label";

export const OperationGroupPanel: React.FC<SettingProps> = ({ id }) => {
	const { getConnectedNodeVariables } = useStrategyWorkflow();
	const { getMinSeriesLengthLimit } = useSourceSeriesLength();
	const { getNodes } = useReactFlow();

	// Get all incoming connections to this node
	const connections = useNodeConnections({ id, handleType: "target" });

	// Get variables from connected upstream nodes
	const variableItemList = getConnectedNodeVariables(
		connections,
		TradeMode.BACKTEST,
	);
	// console.log("🔍 variableItemList", variableItemList);

	// Get the minimum series length limit from upstream nodes
	// This is used to limit the rolling window size
	const windowLimitInfo = useMemo((): WindowSizeLimitInfo | null => {
		const minLimit = getMinSeriesLengthLimit(connections, TradeMode.BACKTEST);
		if (!minLimit) return null;
		return {
			limitType: "upstream-output",
			nodeName: minLimit.nodeName,
			size: minLimit.seriesLength,
		};
	}, [connections, getMinSeriesLengthLimit]);

	// Find EndNode ID within this group
	const childEndNodeId = useMemo(() => {
		return getNodes().find(
			(node) => node.parentId === id && node.type === NodeType.OperationEndNode,
		)?.id ?? "";
	}, [getNodes, id]);

	// Use useNodeConnections to reactively listen to EndNode's connections
	// Use `childEndNodeId || id` as fallback to ensure hook always has valid ID
	// When panel switches, id may change to another node before component unmounts
	const endNodeConnections = useNodeConnections({
		id: childEndNodeId || id,
		handleType: "target",
	});

	// Compute available output options from nodes connected to EndNode
	// Supports both OperationNode and child OperationGroup as sources
	const availableOutputOptions = useMemo(() => {
		if (!childEndNodeId) return [];

		const options: OutputOption[] = [];
		for (const conn of endNodeConnections) {
			const sourceNode = getNodes().find((n) => n.id === conn.source);

			if (sourceNode?.type === NodeType.OperationNode) {
				// Handle OperationNode source
				const nodeData = sourceNode.data as OperationNodeData;
				const outputConfig = nodeData?.outputConfig;
				if (outputConfig) {
					options.push({
						sourceNodeId: sourceNode.id,
						sourceNodeName: nodeData.nodeName ?? "Operation Node",
						outputType: outputConfig.type,
						sourceHandleId: outputConfig.outputHandleId,
						sourceOutputConfigId: outputConfig.configId,
						displayName: outputConfig.outputName,
						sourceName: outputConfig.outputName,
					});
				}
			} else if (sourceNode?.type === NodeType.OperationGroup) {
				// Handle child OperationGroup source
				const groupData = sourceNode.data as OperationGroupData;
				const outputConfigs = groupData?.outputConfigs ?? [];

				// Add each output from the child group as an available option
				for (const outputConfig of outputConfigs) {
					// For child OperationGroup, use outputName as sourceName
					// because outputName is the externally exposed name of the group's output
					// sourceSeriesName/sourceScalarName are the internal source names within the group
					options.push({
						sourceNodeId: sourceNode.id,
						sourceNodeName: groupData.nodeName,
						outputType: outputConfig.type,
						sourceHandleId: outputConfig.outputHandleId,
						sourceOutputConfigId: outputConfig.configId,
						displayName: outputConfig.outputName,
						sourceName: outputConfig.outputName,
					});
				}
			}
		}

		return options;
	}, [childEndNodeId, endNodeConnections, getNodes]);
	

	// Get configs and update functions from hook
	const {
		operationConfigs,
		addSeriesConfig,
		updateSeriesInputName,
		updateScalarInputName,
		updateSeriesConfigById,
		updateScalarValue,
		updateScalarConfigInputName,
		updateParentGroupScalarValueConfigById,
		updateParentGroupScalarValueInputName,
		removeOperationConfigById,
		setOperationConfigs,
		// Output configs
		outputConfigs,
		setOutputConfigs,
		addOutputSeriesConfig,
		updateOutputName,
		removeOutputConfigById,
		// Window config
		inputWindow,
		setInputWindow,
		// Filling method
		fillingMethod,
		setFillingMethod,
		// Group output name
		groupOutputName,
		setGroupOutputName,
		// Input interval
		inputInterval,
		setInputInterval,
	} = useUpdateOpGroupConfig({ id });

	// Handle add new config (default to Series type)
	const handleAddConfig = useCallback(() => {
		addSeriesConfig({
			type: "Series",
			source: "OuterNode",
			inputName: "",
			fromNodeType: NodeType.KlineNode,
			fromNodeId: "",
			fromNodeName: "",
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
	}, [addSeriesConfig]);

	// Handle input name update (for both Series and Scalar)
	const handleUpdateInputName = useCallback(
		(configId: number, inputName: string) => {
			const config = operationConfigs.find((c) => c.configId === configId);
			if (!config) return;

			if (config.type === "Series") {
				updateSeriesInputName(configId, inputName);
			} else if (config.type === "Scalar") {
				// Scalar from any source (OuterNode, OperationNode, ParentGroup, ChildGroup)
				updateScalarConfigInputName(configId, config.source, inputName);
			} else if (config.type === "CustomScalarValue" && config.source === "ParentGroup") {
				// Custom scalar value from parent Group
				updateParentGroupScalarValueInputName(configId, inputName);
			} else {
				// CustomScalarValue with source: null (self-defined)
				updateScalarInputName(configId, inputName);
			}
		},
		[operationConfigs, updateSeriesInputName, updateScalarInputName, updateScalarConfigInputName, updateParentGroupScalarValueInputName],
	);

	// Handle node selection change (for Series type or Scalar from any source)
	const handleNodeChange = useCallback(
		(configId: number, nodeId: string) => {
			const config = operationConfigs.find((c) => c.configId === configId);
			if (!config) return;

			const selectedNode = variableItemList.find(
				(item) => item.nodeId === nodeId,
			);
			if (!selectedNode) return;

			// Determine preliminary source based on selected node type
			// Note: This is a preliminary source that may be refined when variable is selected
			// For OperationGroup, we default to ParentGroup (from parent Group via OperationStartNode)
			// but handleVariableChange will set the correct source based on selected variable
			const getPreliminarySource = (): InputSource => {
				if (selectedNode.nodeType === NodeType.OperationGroup) {
					// Default to ParentGroup, will be refined in handleVariableChange
					return "ParentGroup";
				}
				if (selectedNode.nodeType === NodeType.OperationNode) {
					return "OperationNode";
				}
				// KlineNode, IndicatorNode, VariableNode
				return "OuterNode";
			};

			const preliminarySource = getPreliminarySource();

			// Extract interval from IndicatorNode if applicable
			// IndicatorNode has a single selectedSymbol for all indicators
			if (selectedNode.nodeType === NodeType.IndicatorNode) {
				const indicatorNode = getNodes().find((n) => n.id === nodeId);
				if (indicatorNode) {
					const indicatorData = indicatorNode.data as IndicatorNodeData;
					const selectedSymbol = indicatorData?.backtestConfig?.exchangeModeConfig?.selectedSymbol;
					if (selectedSymbol?.interval) {
						setInputInterval(selectedSymbol.interval);
						console.log("🔍 Set inputInterval from IndicatorNode:", selectedSymbol.interval);
					}
				}
			}

			if (config.type === "Series") {
				updateSeriesConfigById(configId, {
					source: preliminarySource,
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromNodeType: selectedNode.nodeType,
					// Clear variable selection when node changes
					fromHandleId: "",
					fromSeriesConfigId: 0,
					fromSeriesName: "",
					fromSeriesDisplayName: "",
				});
			} else if (config.type === "Scalar") {
				// Scalar from any source - update with preliminary source
				// Need to replace the entire config since source changed
				const currentInputName = config.inputName;
				const newConfig: OperationInputScalarConfig = {
					type: "Scalar",
					source: preliminarySource,
					configId: config.configId,
					inputName: currentInputName,
					fromNodeType: selectedNode.nodeType,
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromHandleId: "",
					fromScalarConfigId: 0,
					fromScalarName: "",
					fromScalarDisplayName: "",
				};
				const newConfigs = operationConfigs.map((c) =>
					c.configId === configId ? newConfig : c,
				);
				setOperationConfigs(newConfigs);
			} else if (config.type === "CustomScalarValue" && config.source === "ParentGroup") {
				updateParentGroupScalarValueConfigById(configId, {
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromNodeType: selectedNode.nodeType,
					// Clear variable selection when node changes
					fromHandleId: "",
					fromScalarConfigId: 0,
					fromScalarDisplayName: "",
					fromScalarValue: 0,
				});
			}
		},
		[operationConfigs, variableItemList, updateSeriesConfigById, updateParentGroupScalarValueConfigById, setOperationConfigs, getNodes, setInputInterval],
	);

	// Handle variable selection change (for Series type or Scalar from any source)
	// varType indicates the type of the selected variable from parent node
	const handleVariableChange = useCallback(
		(
			configId: number,
			nodeId: string,
			handleId: string,
			varName: string,
			varDisplayName: string,
			varConfigId: number,
			varType?: string,
		) => {
			const config = operationConfigs.find((c) => c.configId === configId);
			if (!config) return;

			// Get the selected node info
			const selectedNode = variableItemList.find((item) => item.nodeId === nodeId);
			if (!selectedNode) return;

			// Find the selected variable from the node's variables
			const selectedVariable = selectedNode.variables.find(v => v.configId === varConfigId);

			// Determine the source type based on node type and variable structure
			// OperationInputConfig has 'inputName' field (from parent Group)
			// OperationOutputConfig has 'outputName' field (from child OperationGroup)
			const getSourceType = (): InputSource => {
				if (selectedNode.nodeType === NodeType.OperationGroup) {
					// If variable has 'inputName', it's from parent Group's input (via OperationStartNode)
					if (selectedVariable && 'inputName' in selectedVariable) {
						return "ParentGroup";
					}
					// If variable has 'outputName', it's from child OperationGroup's output
					return "ChildGroup";
				}
				if (selectedNode.nodeType === NodeType.OperationNode) {
					return "OperationNode";
				}
				// KlineNode, IndicatorNode, VariableNode
				return "OuterNode";
			};

			const sourceType = getSourceType();

			console.log("🔍 handleVariableChange:", {
				configId,
				nodeId,
				handleId,
				varName,
				varDisplayName,
				varConfigId,
				varType,
				sourceType,
				currentConfigType: config.type,
			});

			// Extract interval from KlineNode if applicable
			if (selectedNode.nodeType === NodeType.KlineNode) {
				const klineNode = getNodes().find((n) => n.id === nodeId);
				if (klineNode) {
					const klineData = klineNode.data as KlineNodeData;
					const selectedSymbols = klineData?.backtestConfig?.exchangeModeConfig?.selectedSymbols ?? [];
					// Find the symbol config matching varConfigId
					const symbolConfig = selectedSymbols.find((s) => s.configId === varConfigId);
					if (symbolConfig?.interval) {
						setInputInterval(symbolConfig.interval);
						console.log("🔍 Set inputInterval from KlineNode:", symbolConfig.interval);
					}
				}
			}

			// Handle based on selected variable type (varType)
			if (varType === "Series" || config.type === "Series") {
				updateSeriesConfigById(configId, {
					source: sourceType,
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromNodeType: selectedNode.nodeType,
					fromHandleId: handleId,
					fromSeriesConfigId: varConfigId,
					fromSeriesName: varName,
					fromSeriesDisplayName: varDisplayName,
				});
			} else if (varType === "CustomScalarValue") {
				// Selected variable is CustomScalarValue from parent Group
				// Need to convert current config to OperationParentGroupScalarValueConfig
				const currentInputName = config.inputName;
				const newConfig: OperationParentGroupScalarValueConfig = {
					type: "CustomScalarValue",
					source: "ParentGroup",
					configId: config.configId,
					inputName: currentInputName,
					fromNodeType: selectedNode.nodeType,
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromHandleId: handleId,
					fromScalarConfigId: varConfigId,
					fromScalarDisplayName: varDisplayName,
					fromScalarValue: Number.parseFloat(varName) || 0,
				};
				// Replace the config in the array
				const newConfigs = operationConfigs.map((c) =>
					c.configId === configId ? newConfig : c,
				);
				setOperationConfigs(newConfigs);
			} else if (varType === "Scalar" || config.type === "Scalar") {
				// Scalar with variable name
				// Need to replace the entire config to change source
				const currentInputName = config.inputName;
				const newConfig: OperationInputScalarConfig = {
					type: "Scalar",
					source: sourceType,
					configId: config.configId,
					inputName: currentInputName,
					fromNodeType: selectedNode.nodeType,
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromHandleId: handleId,
					fromScalarConfigId: varConfigId,
					fromScalarName: varName,
					fromScalarDisplayName: varDisplayName,
				};
				const newConfigs = operationConfigs.map((c) =>
					c.configId === configId ? newConfig : c,
				);
				setOperationConfigs(newConfigs);
			}
		},
		[operationConfigs, variableItemList, updateSeriesConfigById, setOperationConfigs, getNodes, setInputInterval],
	);

	// Handle scalar value change
	const handleScalarValueChange = useCallback(
		(configId: number, value: number) => {
			updateScalarValue(configId, value);
		},
		[updateScalarValue],
	);

	// Helper to get input name from any config type
	const getInputName = useCallback((config: OperationInputConfig): string => {
		return config.inputName;
	}, []);

	// Handle scalar source change (Value <-> Node)
	const handleScalarSourceChange = useCallback(
		(configId: number, source: ScalarSource) => {
			const currentConfig = operationConfigs.find(
				(c) => c.configId === configId,
			);
			// Allow change from Scalar or CustomScalarValue types
			if (!currentConfig || (currentConfig.type !== "Scalar" && currentConfig.type !== "CustomScalarValue")) return;

			// Create new config with the new source
			const newConfigs = operationConfigs.map((config) => {
				if (config.configId !== configId) return config;

				const inputName = getInputName(config);

				if (source === "Value") {
					// Convert to custom scalar value (self-defined)
					const newConfig: OperationCustomScalarValueConfig = {
						type: "CustomScalarValue",
						source: null,
						configId: config.configId,
						inputName,
						scalarValue: config.type === "CustomScalarValue" && config.source === null
							? config.scalarValue
							: 0,
					};
					return newConfig;
				}
				// Convert to scalar from node (default to OuterNode)
				const newConfig: OperationInputScalarConfig = {
					type: "Scalar",
					source: "OuterNode",
					configId: config.configId,
					inputName,
					fromNodeType: NodeType.KlineNode,
					fromNodeId: "",
					fromNodeName: "",
					fromHandleId: "",
					fromScalarConfigId: 0,
					fromScalarName: "",
					fromScalarDisplayName: "",
				};
				return newConfig;
			});

			setOperationConfigs(newConfigs);
		},
		[operationConfigs, setOperationConfigs, getInputName],
	);

	// Handle type change (Series <-> Scalar)
	const handleTypeChange = useCallback(
		(configId: number, newType: "Series" | "Scalar" | "CustomScalarValue") => {
			const currentConfig = operationConfigs.find(
				(c) => c.configId === configId,
			);
			if (!currentConfig) return;

			// Create new config with the new type
			const newConfigs = operationConfigs.map((config) => {
				if (config.configId !== configId) return config;

				if (newType === "Scalar") {
					// Convert to CustomScalarValue (default to custom value input)
					const newScalarConfig: OperationCustomScalarValueConfig = {
						type: "CustomScalarValue",
						source: null,
						configId: config.configId,
						inputName: config.inputName,
						scalarValue:
							config.type === "CustomScalarValue" && config.source === null
								? config.scalarValue
								: 0,
					};
					return newScalarConfig;
				}
				// Convert to Series (default to OuterNode)
				const newSeriesConfig: OperationInputSeriesConfig = {
					type: "Series",
					source: "OuterNode",
					configId: config.configId,
					inputName: getInputName(config),
					fromNodeType: NodeType.KlineNode,
					fromNodeId: "",
					fromNodeName: "",
					fromHandleId: "",
					fromSeriesConfigId: 0,
					fromSeriesName: "",
					fromSeriesDisplayName: "",
				};
				return newSeriesConfig;
			});

			setOperationConfigs(newConfigs);
		},
		[operationConfigs, setOperationConfigs, getInputName],
	);

	// Handle add output config (empty config, user will select source later)
	const handleAddOutputConfig = useCallback(() => {
		addOutputSeriesConfig({
			type: "Series",
			outputName: "",
			sourceNodeId: "",
			sourceNodeName: "",
			sourceSeriesName: "",
			sourceHandleId: "",
			sourceOutputConfigId: 0,
		});
	}, [addOutputSeriesConfig]);

	// Handle select source for output config
	const handleSelectOutputSource = useCallback(
		(configId: number, option: OutputOption) => {
			// Find current config and update it with new source info
			const currentConfig = outputConfigs.find((c) => c.configId === configId);
			if (!currentConfig) return;

			// Create new config with correct type based on source
			const newConfigs = outputConfigs.map((config) => {
				if (config.configId !== configId) return config;

				if (option.outputType === "Series") {
					return {
						type: "Series" as const,
						configId: config.configId,
						outputHandleId: config.outputHandleId,
						outputName: option.displayName,
						sourceNodeId: option.sourceNodeId,
						sourceNodeName: option.sourceNodeName,
						sourceSeriesName: option.sourceName,
						sourceHandleId: option.sourceHandleId,
						sourceOutputConfigId: option.sourceOutputConfigId,
					};
				}
				// Scalar type
				return {
					type: "Scalar" as const,
					configId: config.configId,
					outputHandleId: config.outputHandleId,
					outputName: option.displayName,
					sourceNodeId: option.sourceNodeId,
					sourceNodeName: option.sourceNodeName,
					sourceScalarName: option.sourceName,
					sourceHandleId: option.sourceHandleId,
					sourceOutputConfigId: option.sourceOutputConfigId,
				};
			});

			setOutputConfigs(newConfigs);
		},
		[outputConfigs, setOutputConfigs],
	);

	// Handle update output name
	const handleUpdateOutputName = useCallback(
		(configId: number, outputName: string) => {
			updateOutputName(configId, outputName);
		},
		[updateOutputName],
	);

	// Handle remove output config
	const handleRemoveOutputConfig = useCallback(
		(configId: number) => {
			removeOutputConfigById(configId);
		},
		[removeOutputConfigById],
	);

	// Handle remove input config with interval cleanup
	const handleRemoveInputConfig = useCallback(
		(configId: number) => {
			// First remove the config
			removeOperationConfigById(configId);

			// Check if there are any remaining Series configs after removal
			const remainingSeriesConfigs = operationConfigs.filter(
				(c) => c.configId !== configId && c.type === "Series"
			);

			// If no Series configs remain, reset inputInterval to null
			if (remainingSeriesConfigs.length === 0) {
				setInputInterval(null);
			}
		},
		[operationConfigs, removeOperationConfigById, setInputInterval],
	);

	// Check if this is a child group (has parentId pointing to an OperationGroup)
	const isChildGroup = useMemo(() => {
		const currentNode = getNodes().find((n) => n.id === id);
		if (currentNode?.parentId) {
			const parentNode = getNodes().find((n) => n.id === currentNode.parentId);
			return parentNode?.type === NodeType.OperationGroup;
		}
		return false;
	}, [id, getNodes]);

	return (
		<div className="h-full overflow-y-auto bg-white p-4 space-y-4">
			{/* Output Name - Only show for non-child groups */}
			{!isChildGroup && (
				<OutputNameInput
					value={groupOutputName}
					onChange={setGroupOutputName}
				/>
			)}

			<Separator />

			{/* Input Parameters */}
			<InputConfiger
				variableItemList={variableItemList}
				inputConfigs={operationConfigs}
				filterInterval={inputInterval}
				onAddConfig={handleAddConfig}
				onUpdateDisplayName={handleUpdateInputName}
				onUpdateNode={handleNodeChange}
				onUpdateVariable={handleVariableChange}
				onUpdateScalarValue={handleScalarValueChange}
				onTypeChange={handleTypeChange}
				onScalarSourceChange={handleScalarSourceChange}
				onRemoveConfig={handleRemoveInputConfig}
			/>

			<Separator />

			{/* Input Window Config */}
			{inputWindow && (
				<div className="space-y-2">
					<Label className="text-sm font-medium">Input Window</Label>
					{isChildGroup ? (
						<p className="text-xs text-yellow-600 flex items-center gap-1">
							<CircleAlert className="h-3.5 w-3.5" />
							Input window size is controlled by parent group.
						</p>
					) : (
						<div className="border rounded-md p-2">
							<WindowConfig
								windowConfig={inputWindow}
								onChange={setInputWindow}
								maxSize={windowLimitInfo?.size ?? 200}
								limitInfo={windowLimitInfo}
							/>
						</div>
					)}
				</div>
			)}

			<Separator />

			{/* Filling Method */}
			{fillingMethod && (
				<FillingMethodSelector
					value={fillingMethod}
					onChange={setFillingMethod}
				/>
			)}

			<Separator />

			{/* Output Parameters */}
			<OutputConfiger
				availableOutputs={availableOutputOptions}
				outputConfigs={outputConfigs}
				onAddConfig={handleAddOutputConfig}
				onSelectSource={handleSelectOutputSource}
				onUpdateDisplayName={handleUpdateOutputName}
				onRemoveConfig={handleRemoveOutputConfig}
			/>
		</div>
	);
};

export default OperationGroupPanel;
