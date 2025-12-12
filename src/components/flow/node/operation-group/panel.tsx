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
	OperationInputScalarConfig,
	OperationInputSeriesConfig,
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
	console.log("🔍 variableItemList", variableItemList);

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
	const availableOutputOptions = useMemo(() => {
		if (!childEndNodeId) return [];

		const options: OutputOption[] = [];
		for (const conn of endNodeConnections) {
			const sourceNode = getNodes().find((n) => n.id === conn.source);
			if (sourceNode?.type === NodeType.OperationNode) {
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
		updateSeriesConfigById,
		updateScalarValue,
		updateScalarNodeConfigById,
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
			} else {
				updateScalarDisplayName(configId, displayName);
			}
		},
		[operationConfigs, updateSeriesDisplayName, updateScalarDisplayName],
	);

	// Handle node selection change (for Series type or Scalar from Node)
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
			}
		},
		[operationConfigs, variableItemList, updateSeriesConfigById, updateScalarNodeConfigById],
	);

	// Handle variable selection change (for Series type or Scalar from Node)
	const handleVariableChange = useCallback(
		(
			configId: number,
			nodeId: string,
			handleId: string,
			varName: string,
			varDisplayName: string,
		) => {
			const config = operationConfigs.find((c) => c.configId === configId);
			if (!config) return;

			// Find the selected node and variable to get configId
			const selectedNode = variableItemList.find(
				(item) => item.nodeId === nodeId,
			);
			const selectedVar = selectedNode?.variables.find(
				(v) => v.outputHandleId === handleId,
			);
			const sourceConfigId = selectedVar?.configId ?? 0;

			if (config.type === "Series") {
				updateSeriesConfigById(configId, {
					fromHandleId: handleId,
					fromSeriesConfigId: sourceConfigId,
					fromSeriesName: varName,
					fromSeriesDisplayName: varDisplayName,
				});
			} else if (config.type === "Scalar" && config.source === "Node") {
				updateScalarNodeConfigById(configId, {
					fromHandleId: handleId,
					fromScalarConfigId: sourceConfigId,
					fromScalarName: varName,
					fromScalarDisplayName: varDisplayName,
				});
			}
		},
		[operationConfigs, variableItemList, updateSeriesConfigById, updateScalarNodeConfigById],
	);

	// Handle scalar value change
	const handleScalarValueChange = useCallback(
		(configId: number, value: number) => {
			updateScalarValue(configId, value);
		},
		[updateScalarValue],
	);

	// Handle scalar source change (Value <-> Node)
	const handleScalarSourceChange = useCallback(
		(configId: number, source: ScalarSource) => {
			const currentConfig = operationConfigs.find(
				(c) => c.configId === configId,
			);
			if (!currentConfig || currentConfig.type !== "Scalar") return;

			// Create new config with the new source
			const newConfigs = operationConfigs.map((config) => {
				if (config.configId !== configId) return config;

				const displayName = config.type === "Scalar" ? config.scalarDisplayName : config.seriesDisplayName;

				if (source === "Value") {
					// Convert to custom scalar value
					const newConfig: OperationInputScalarValueConfig = {
						type: "Scalar",
						source: "Value",
						configId: config.configId,
						scalarDisplayName: displayName,
						scalarValue: 0,
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
		[operationConfigs, setOperationConfigs],
	);

	// Handle type change (Series <-> Scalar)
	const handleTypeChange = useCallback(
		(configId: number, newType: "Series" | "Scalar") => {
			const currentConfig = operationConfigs.find(
				(c) => c.configId === configId,
			);
			if (!currentConfig) return;

			// Create new config with the new type
			const newConfigs = operationConfigs.map((config) => {
				if (config.configId !== configId) return config;

				if (newType === "Scalar") {
					// Convert to Scalar (default to custom value input)
					const newScalarConfig: OperationInputScalarValueConfig = {
						type: "Scalar",
						source: "Value",
						configId: config.configId,
						scalarDisplayName:
							config.type === "Series"
								? config.seriesDisplayName
								: config.scalarDisplayName,
						scalarValue:
							config.type === "Scalar" && config.source === "Value"
								? config.scalarValue
								: 0,
					};
					return newScalarConfig;
				}
				// Convert to Series
				const newSeriesConfig: OperationInputSeriesConfig = {
					type: "Series",
					configId: config.configId,
					seriesDisplayName:
						config.type === "Scalar"
							? config.scalarDisplayName
							: config.seriesDisplayName,
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
		[operationConfigs, setOperationConfigs],
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
