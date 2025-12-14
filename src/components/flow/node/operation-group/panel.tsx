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
import { OperationConfiger } from "./components/input-configer";
import { OutputConfiger, type OutputOption } from "./components/output-configer";

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
						displayName:
							outputConfig.type === "Series"
								? outputConfig.seriesDisplayName
								: outputConfig.scalarDisplayName,
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
						displayName:
							outputConfig.type === "Series"
								? outputConfig.seriesDisplayName
								: outputConfig.scalarDisplayName,
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
		updateSeriesDisplayName,
		updateScalarDisplayName,
		updateScalarNodeDisplayName,
		updateScalarGroupDisplayName,
		updateGroupScalarValueDisplayName,
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
		updateOutputDisplayName,
		removeOutputConfigById,
	} = useUpdateOpGroupConfig({ id });

	// Handle add new config (default to Series type)
	const handleAddConfig = useCallback(() => {
		addSeriesConfig({
			type: "Series",
			source: "Node",
			seriesDisplayName: "",
			fromNodeType: NodeType.KlineNode,
			fromNodeId: "",
			fromNodeName: "",
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
	}, [addSeriesConfig]);

	// Handle display name update (for both Series and Scalar)
	const handleUpdateDisplayName = useCallback(
		(configId: number, displayName: string) => {
			const config = operationConfigs.find((c) => c.configId === configId);
			if (!config) return;

			if (config.type === "Series") {
				updateSeriesDisplayName(configId, displayName);
			} else if (config.type === "Scalar" && config.source === "Node") {
				// Scalar from upstream Node
				updateScalarNodeDisplayName(configId, displayName);
			} else if (config.type === "Scalar" && config.source === "Group") {
				// Scalar from parent Group
				updateScalarGroupDisplayName(configId, displayName);
			} else if (config.type === "CustomScalarValue" && config.source === "Group") {
				// Custom scalar value from parent Group
				updateGroupScalarValueDisplayName(configId, displayName);
			} else {
				// CustomScalarValue with source: null (self-defined)
				updateScalarDisplayName(configId, displayName);
			}
		},
		[operationConfigs, updateSeriesDisplayName, updateScalarDisplayName, updateScalarNodeDisplayName, updateScalarGroupDisplayName, updateGroupScalarValueDisplayName],
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
				const currentDisplayName = config.scalarDisplayName;
				const newConfig: OperationInputGroupScalarValueConfig = {
					type: "CustomScalarValue",
					source: "Group",
					configId: config.configId,
					scalarDisplayName: currentDisplayName,
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
				const currentDisplayName = config.scalarDisplayName;
				const newConfig: OperationInputScalarConfig = {
					type: "Scalar",
					source: isFromGroup ? "Group" : "Node",
					configId: config.configId,
					scalarDisplayName: currentDisplayName,
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

	// Helper to get display name from any config type
	const getScalarDisplayName = useCallback((config: OperationInputConfig): string => {
		if (config.type === "Series") {
			return config.seriesDisplayName;
		}
		return config.scalarDisplayName;
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

				const displayName = getScalarDisplayName(config);

				if (source === "Value") {
					// Convert to custom scalar value (self-defined)
					const newConfig: OperationInputScalarValueConfig = {
						type: "CustomScalarValue",
						source: null,
						configId: config.configId,
						scalarDisplayName: displayName,
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
					scalarDisplayName: displayName,
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
		[operationConfigs, setOperationConfigs, getScalarDisplayName],
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
						scalarDisplayName:
							config.type === "Series"
								? config.seriesDisplayName
								: config.scalarDisplayName,
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
					seriesDisplayName: getScalarDisplayName(config),
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
		[operationConfigs, setOperationConfigs, getScalarDisplayName],
	);

	// Handle add output config (empty config, user will select source later)
	const handleAddOutputConfig = useCallback(() => {
		addOutputSeriesConfig({
			type: "Series",
			seriesDisplayName: "",
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

				if (option.outputType === "Series") {
					return {
						type: "Series" as const,
						configId: config.configId,
						outputHandleId: config.outputHandleId,
						seriesDisplayName: option.displayName,
						sourceNodeId: option.sourceNodeId,
						sourceNodeName: option.sourceNodeName,
						sourceHandleId: option.sourceHandleId,
					};
				}
				return {
					type: "Scalar" as const,
					configId: config.configId,
					outputHandleId: config.outputHandleId,
					scalarDisplayName: option.displayName,
					sourceNodeId: option.sourceNodeId,
					sourceNodeName: option.sourceNodeName,
					sourceHandleId: option.sourceHandleId,
				};
			});

			setOutputConfigs(newConfigs);
		},
		[outputConfigs, setOutputConfigs],
	);

	// Handle update output display name
	const handleUpdateOutputDisplayName = useCallback(
		(configId: number, displayName: string) => {
			updateOutputDisplayName(configId, displayName);
		},
		[updateOutputDisplayName],
	);

	// Handle remove output config
	const handleRemoveOutputConfig = useCallback(
		(configId: number) => {
			removeOutputConfigById(configId);
		},
		[removeOutputConfigById],
	);

	return (
		<div className="h-full overflow-y-auto bg-white p-4 space-y-4">
			<OperationConfiger
				variableItemList={variableItemList}
				operationConfigs={operationConfigs}
				onAddConfig={handleAddConfig}
				onUpdateDisplayName={handleUpdateDisplayName}
				onUpdateNode={handleNodeChange}
				onUpdateVariable={handleVariableChange}
				onUpdateScalarValue={handleScalarValueChange}
				onTypeChange={handleTypeChange}
				onScalarSourceChange={handleScalarSourceChange}
				onRemoveConfig={removeOperationConfigById}
			/>

			<Separator />

			<OutputConfiger
				availableOutputs={availableOutputOptions}
				outputConfigs={outputConfigs}
				onAddConfig={handleAddOutputConfig}
				onSelectSource={handleSelectOutputSource}
				onUpdateDisplayName={handleUpdateOutputDisplayName}
				onRemoveConfig={handleRemoveOutputConfig}
			/>
		</div>
	);
};

export default OperationGroupPanel;
