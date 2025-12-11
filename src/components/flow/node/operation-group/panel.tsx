import { useNodeConnections } from "@xyflow/react";
import type React from "react";
import { useCallback } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useUpdateOpGroupConfig } from "@/hooks/node-config/operation-group";
import { NodeType } from "@/types/node";
import type { ScalarConfig, SeriesConfig } from "@/types/node/group/operation-group";
import { TradeMode } from "@/types/strategy";
import { OperationConfiger } from "./components/series-configer";

export const OperationGroupPanel: React.FC<SettingProps> = ({ id }) => {
	const { getConnectedNodeVariables } = useStrategyWorkflow();

	// Get all incoming connections to this node
	const connections = useNodeConnections({ id, handleType: "target" });

	// Get variables from connected upstream nodes
	const variableItemList = getConnectedNodeVariables(
		connections,
		TradeMode.BACKTEST,
	);

	// Get configs and update functions from hook
	const {
		operationConfigs,
		addSeriesConfig,
		updateSeriesDisplayName,
		updateScalarDisplayName,
		updateSeriesConfigById,
		updateScalarValue,
		removeOperationConfigById,
		setOperationConfigs,
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

	// Handle node selection change (only for Series type)
	const handleNodeChange = useCallback(
		(configId: number, nodeId: string) => {
			const selectedNode = variableItemList.find(
				(item) => item.nodeId === nodeId,
			);
			if (selectedNode) {
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
			}
		},
		[variableItemList, updateSeriesConfigById],
	);

	// Handle variable selection change (only for Series type)
	const handleVariableChange = useCallback(
		(
			configId: number,
			nodeId: string,
			handleId: string,
			varName: string,
			varDisplayName: string,
		) => {
			// Find the selected node and variable to get seriesConfigId
			const selectedNode = variableItemList.find(
				(item) => item.nodeId === nodeId,
			);
			const selectedVar = selectedNode?.variables.find(
				(v) => v.outputHandleId === handleId,
			);
			const seriesConfigId = selectedVar?.configId ?? 0;

			updateSeriesConfigById(configId, {
				fromHandleId: handleId,
				fromSeriesConfigId: seriesConfigId,
				fromSeriesName: varName,
				fromSeriesDisplayName: varDisplayName,
			});
		},
		[variableItemList, updateSeriesConfigById],
	);

	// Handle scalar value change
	const handleScalarValueChange = useCallback(
		(configId: number, value: number) => {
			updateScalarValue(configId, value);
		},
		[updateScalarValue],
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
					// Convert to Scalar
					const newScalarConfig: ScalarConfig = {
						type: "Scalar",
						configId: config.configId,
						outputHandleId: config.outputHandleId,
						scalarDisplayName:
							config.type === "Series"
								? config.seriesDisplayName
								: config.scalarDisplayName,
						scalarValue: config.type === "Scalar" ? config.scalarValue : 0,
					};
					return newScalarConfig;
				}
				// Convert to Series
				const newSeriesConfig: SeriesConfig = {
					type: "Series",
					configId: config.configId,
					outputHandleId: config.outputHandleId,
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

	return (
		<div className="h-full overflow-y-auto bg-white p-4">
			<OperationConfiger
				variableItemList={variableItemList}
				operationConfigs={operationConfigs}
				onAddConfig={handleAddConfig}
				onUpdateDisplayName={handleUpdateDisplayName}
				onUpdateNode={handleNodeChange}
				onUpdateVariable={handleVariableChange}
				onUpdateScalarValue={handleScalarValueChange}
				onTypeChange={handleTypeChange}
				onRemoveConfig={removeOperationConfigById}
			/>
		</div>
	);
};

export default OperationGroupPanel;
