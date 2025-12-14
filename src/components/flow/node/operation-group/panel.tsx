import { useNodeConnections, useReactFlow } from "@xyflow/react";
import type React from "react";
import { useCallback, useMemo } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Separator } from "@/components/ui/separator";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useUpdateOpGroupConfig } from "@/hooks/node-config/operation-group";
import { NodeType } from "@/types/node";
import type {
	OperationInputScalarValueConfig,
	OperationInputGroupScalarValueConfig,
	OperationInputScalarConfig,
	OperationInputSeriesConfig,
	OperationInputConfig,
	OperationGroupData,
} from "@/types/node/group/operation-group";
import type { ScalarSource } from "./components/input-configer";
import type { OperationNodeData } from "@/types/node/operation-node";
import { TradeMode } from "@/types/strategy";
import { InputConfiger } from "./components/input-configer";
import { OutputConfiger, type OutputOption } from "./components/output-configer";
import { WindowConfig } from "./components/window-config";
import { FillingMethodSelector } from "./components/filling-method-selector";
import { Label } from "@/components/ui/label";

export const OperationGroupPanel: React.FC<SettingProps> = ({ id }) => {
	const { getConnectedNodeVariables } = useStrategyWorkflow();
	const { getNodes } = useReactFlow();

	// Get all incoming connections to this node
	const connections = useNodeConnections({ id, handleType: "target" });

	// Get variables from connected upstream nodes
	const variableItemList = getConnectedNodeVariables(
		connections,
		TradeMode.BACKTEST,
	);
	// console.log("🔍 variableItemList", variableItemList);

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
						displayName: outputConfig.outputName,
					});
				}
			} else if (sourceNode?.type === NodeType.OperationGroup) {
				// Handle child OperationGroup source
				const groupData = sourceNode.data as OperationGroupData;
				const outputConfigs = groupData?.outputConfigs ?? [];

				// Add each output from the child group as an available option
				for (const outputConfig of outputConfigs) {
					options.push({
						sourceNodeId: sourceNode.id,
						sourceNodeName: groupData.nodeName,
						outputType: outputConfig.type,
						sourceHandleId: outputConfig.outputHandleId,
						displayName: outputConfig.outputName,
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
		updateScalarNodeInputName,
		updateScalarGroupInputName,
		updateGroupScalarValueInputName,
		updateSeriesConfigById,
		updateScalarValue,
		updateScalarNodeConfigById,
		updateScalarGroupConfigById,
		updateGroupScalarValueConfigById,
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
	} = useUpdateOpGroupConfig({ id });

	// Handle add new config (default to Series type)
	const handleAddConfig = useCallback(() => {
		addSeriesConfig({
			type: "Series",
			source: "Node",
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
			} else if (config.type === "Scalar" && config.source === "Node") {
				// Scalar from upstream Node
				updateScalarNodeInputName(configId, inputName);
			} else if (config.type === "Scalar" && config.source === "Group") {
				// Scalar from parent Group
				updateScalarGroupInputName(configId, inputName);
			} else if (config.type === "CustomScalarValue" && config.source === "Group") {
				// Custom scalar value from parent Group
				updateGroupScalarValueInputName(configId, inputName);
			} else {
				// CustomScalarValue with source: null (self-defined)
				updateScalarInputName(configId, inputName);
			}
		},
		[operationConfigs, updateSeriesInputName, updateScalarInputName, updateScalarNodeInputName, updateScalarGroupInputName, updateGroupScalarValueInputName],
	);

	// Handle node selection change (for Series type or Scalar from Node/Group)
	const handleNodeChange = useCallback(
		(configId: number, nodeId: string) => {
			const config = operationConfigs.find((c) => c.configId === configId);
			if (!config) return;

			const selectedNode = variableItemList.find(
				(item) => item.nodeId === nodeId,
			);
			if (!selectedNode) return;

			if (config.type === "Series") {
				updateSeriesConfigById(configId, {
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromNodeType: selectedNode.nodeType,
					// Clear variable selection when node changes
					fromHandleId: "",
					fromSeriesConfigId: 0,
					fromSeriesName: "",
					fromSeriesDisplayName: "",
				});
			} else if (config.type === "Scalar" && config.source === "Node") {
				updateScalarNodeConfigById(configId, {
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromNodeType: selectedNode.nodeType,
					// Clear variable selection when node changes
					fromHandleId: "",
					fromScalarConfigId: 0,
					fromScalarName: "",
					fromScalarDisplayName: "",
				});
			} else if (config.type === "Scalar" && config.source === "Group") {
				updateScalarGroupConfigById(configId, {
					fromNodeId: nodeId,
					fromNodeName: selectedNode.nodeName,
					fromNodeType: selectedNode.nodeType,
					// Clear variable selection when node changes
					fromHandleId: "",
					fromScalarConfigId: 0,
					fromScalarName: "",
					fromScalarDisplayName: "",
				});
			} else if (config.type === "CustomScalarValue" && config.source === "Group") {
				updateGroupScalarValueConfigById(configId, {
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
		[operationConfigs, variableItemList, updateSeriesConfigById, updateScalarNodeConfigById, updateScalarGroupConfigById, updateGroupScalarValueConfigById],
	);

	// Handle variable selection change (for Series type or Scalar from Node/Group)
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

			// Determine if the source is from a Group (OperationStartNode means parent Group's input)
			const isFromGroup = selectedNode.nodeType === NodeType.OperationStartNode;

			console.log("🔍 handleVariableChange:", {
				configId,
				nodeId,
				handleId,
				varName,
				varDisplayName,
				varConfigId,
				varType,
				isFromGroup,
				currentConfigType: config.type,
			});

			// Handle based on selected variable type (varType)
			if (varType === "Series" || config.type === "Series") {
				updateSeriesConfigById(configId, {
					source: isFromGroup ? "Group" : "Node",
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
				// Need to convert current config to OperationInputGroupScalarValueConfig
				const currentInputName = config.inputName;
				const newConfig: OperationInputGroupScalarValueConfig = {
					type: "CustomScalarValue",
					source: "Group",
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
					source: isFromGroup ? "Group" : "Node",
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
		[operationConfigs, variableItemList, updateSeriesConfigById, setOperationConfigs],
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
			console.log("🔍 handleScalarSourceChange", configId, source);
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
					const newConfig: OperationInputScalarValueConfig = {
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
				// Convert to scalar from node
				const newConfig: OperationInputScalarConfig = {
					type: "Scalar",
					source: "Node",
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
					const newScalarConfig: OperationInputScalarValueConfig = {
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
				// Convert to Series
				const newSeriesConfig: OperationInputSeriesConfig = {
					type: "Series",
					source: "Node",
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
			sourceHandleId: "",
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

				return {
					type: option.outputType as "Series" | "Scalar",
					configId: config.configId,
					outputHandleId: config.outputHandleId,
					outputName: option.displayName,
					sourceNodeId: option.sourceNodeId,
					sourceNodeName: option.sourceNodeName,
					sourceHandleId: option.sourceHandleId,
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
			{/* Input Parameters */}
			<InputConfiger
				variableItemList={variableItemList}
				inputConfigs={operationConfigs}
				onAddConfig={handleAddConfig}
				onUpdateDisplayName={handleUpdateInputName}
				onUpdateNode={handleNodeChange}
				onUpdateVariable={handleVariableChange}
				onUpdateScalarValue={handleScalarValueChange}
				onTypeChange={handleTypeChange}
				onScalarSourceChange={handleScalarSourceChange}
				onRemoveConfig={removeOperationConfigById}
			/>

			<Separator />

			{/* Input Window Config */}
			{inputWindow && (
				<div className="space-y-2">
					<Label className="text-sm font-medium">Input Window</Label>
					<div className="border rounded-md p-2">
						<WindowConfig
							windowConfig={inputWindow}
							onChange={setInputWindow}
							disabled={isChildGroup}
							disabledMessage="Input window size is controlled by parent group."
						/>
					</div>
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
