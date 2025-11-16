import { type NodeProps, Position } from "@xyflow/react";
import { memo, useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import { useBacktestConfig } from "@/hooks/node-config/if-else-node";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { IfElseNode as IfElseNodeType } from "@/types/node/if-else-node";
import { getNodeDefaultInputHandleId, getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node/index";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { IndicatorNodeData } from "@/types/node/indicator-node";
import { KlineNodeData } from "@/types/node/kline-node";
import { VariableNodeData } from "@/types/node/variable-node/variable-config-types";

const IfElseNode: React.FC<NodeProps<IfElseNodeType>> = ({
	id,
	selected,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getSourceNodes, getNodeData } = useStrategyWorkflow();

	const { backtestConfig, resetCases: resetBacktestCases, resetConditionVariable, updateConditionVariableMetadata } = useBacktestConfig({ id });

	const currentNodeData = getNodeData(id) as IfElseNodeData;
	const handleColor = currentNodeData?.nodeConfig?.handleColor || getNodeDefaultColor(NodeType.IfElseNode);
	const sourceNodes = getSourceNodes(id);

	useEffect(() => {
		if (sourceNodes.length === 0 && backtestConfig?.cases?.length !== 0) {
			resetBacktestCases();
		} 
		else if (backtestConfig?.cases && sourceNodes.length > 0 && backtestConfig?.cases?.length > 0) {
			sourceNodes.forEach((sn) => {
				const nodeId = sn.id;
				// filter caseConfig related to the source node.
				const caseConfig = backtestConfig?.cases?.filter((c) => c.conditions.some((condition) => {
					const leftMatches = condition.left?.nodeId === nodeId;
					const rightMatches = condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId;
					return leftMatches || rightMatches;
				}));

				// if no case , return.
				if (caseConfig.length === 0) {
					return;
				}

				switch (sn.type) {
					// The indicator configuration can only be deleted, not modified.
					case NodeType.IndicatorNode:
						const snData = sn.data as IndicatorNodeData;
						const snBacktestConfig = snData.backtestConfig?.exchangeModeConfig;
						const selectedIndicators = snBacktestConfig?.selectedIndicators ?? [];

						// Check each case that references this indicator node
						caseConfig.forEach((cc) => {
							cc.conditions.forEach((condition) => {
								// Check left variable
								// Only check if varConfigId is not null (null means user is still configuring)
								if (condition.left?.nodeId === nodeId && condition.left?.varConfigId !== null) {
									const configExists = selectedIndicators.some(
										si => si.configId === condition.left?.varConfigId
									);
									if (!configExists) {
										// Config has been deleted, reset left variable
										console.warn(
											`Indicator config ${condition.left?.varConfigId} not found, resetting condition ${condition.conditionId} left variable`
										);
										resetConditionVariable(cc.caseId, condition.conditionId, 'left');
									}
								}

								// Check right variable (skip if it's a constant)
								// Only check if varConfigId is not null (null means user is still configuring)
								if (condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId && condition.right.varConfigId !== null) {
									const rightVarConfigId = condition.right.varConfigId;
									const configExists = selectedIndicators.some(
										si => si.configId === rightVarConfigId
									);
									if (!configExists) {
										// Config has been deleted, reset right variable
										console.warn(
											`Indicator config ${rightVarConfigId} not found, resetting condition ${condition.conditionId} right variable`
										);
										resetConditionVariable(cc.caseId, condition.conditionId, 'right');
									}
								}
							});
						});
						break;

					// The kline configuration can only be deleted, not modified.
					case NodeType.KlineNode:
						const klineData = sn.data as KlineNodeData;
						const klineBacktestConfig = klineData.backtestConfig?.exchangeModeConfig;
						const selectedSymbols = klineBacktestConfig?.selectedSymbols ?? [];

						// Check each case that references this kline node
						caseConfig.forEach((cc) => {
							cc.conditions.forEach((condition) => {
								// Check left variable
								// Only check if varConfigId is not null (null means user is still configuring)
								if (condition.left?.nodeId === nodeId && condition.left?.varConfigId !== null) {
									const configExists = selectedSymbols.some(
										ss => ss.configId === condition.left?.varConfigId
									);
									if (!configExists) {
										// Config has been deleted, reset left variable
										console.warn(
											`Kline config ${condition.left?.varConfigId} not found, resetting condition ${condition.conditionId} left variable`
										);
										resetConditionVariable(cc.caseId, condition.conditionId, 'left');
									}
								}

								// Check right variable (skip if it's a constant)
								// Only check if varConfigId is not null (null means user is still configuring)
								if (condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId && condition.right.varConfigId !== null) {
									const rightVarConfigId = condition.right.varConfigId;
									const configExists = selectedSymbols.some(
										ss => ss.configId === rightVarConfigId
									);
									if (!configExists) {
										// Config has been deleted, reset right variable
										console.warn(
											`Kline config ${rightVarConfigId} not found, resetting condition ${condition.conditionId} right variable`
										);
										resetConditionVariable(cc.caseId, condition.conditionId, 'right');
									}
								}
							});
						});
						break;

					// The variable configuration can be modified (varName, varDisplayName, varValueType) or deleted
					case NodeType.VariableNode:
						const variableData = sn.data as VariableNodeData;
						const variableConfigs = variableData.backtestConfig?.variableConfigs ?? [];

						// Check each case that references this variable node
						caseConfig.forEach((cc) => {
							cc.conditions.forEach((condition) => {
								// Check left variable
								// Only check if varConfigId is not null (null means user is still configuring)
								if (condition.left?.nodeId === nodeId && condition.left?.varConfigId !== null) {
									const matchedConfig = variableConfigs.find(
										vc => vc.configId === condition.left?.varConfigId
									);

									if (!matchedConfig) {
										// Config has been deleted, reset left variable
										console.warn(
											`Variable config ${condition.left?.varConfigId} not found, resetting condition ${condition.conditionId} left variable`
										);
										resetConditionVariable(cc.caseId, condition.conditionId, 'left');
									} else {
										// Config exists, check if metadata changed
										const needsUpdate =
											matchedConfig.varName !== condition.left.varName ||
											matchedConfig.varDisplayName !== condition.left.varDisplayName ||
											matchedConfig.varValueType !== condition.left.varValueType;

										if (needsUpdate) {
											console.warn(
												`Variable config ${condition.left?.varConfigId} metadata changed, updating condition ${condition.conditionId} left variable`
											);
											updateConditionVariableMetadata(
												cc.caseId,
												condition.conditionId,
												'left',
												matchedConfig.varName,
												matchedConfig.varDisplayName,
												matchedConfig.varValueType
											);
										}
									}
								}

								// Check right variable (skip if it's a constant)
								// Only check if varConfigId is not null (null means user is still configuring)
								if (condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId && condition.right.varConfigId !== null) {
									const rightVarConfigId = condition.right.varConfigId;
									const matchedConfig = variableConfigs.find(
										vc => vc.configId === rightVarConfigId
									);

									if (!matchedConfig) {
										// Config has been deleted, reset right variable
										console.warn(
											`Variable config ${rightVarConfigId} not found, resetting condition ${condition.conditionId} right variable`
										);
										resetConditionVariable(cc.caseId, condition.conditionId, 'right');
									} else {
										// Config exists, check if metadata changed
										const needsUpdate =
											matchedConfig.varName !== condition.right.varName ||
											matchedConfig.varDisplayName !== condition.right.varDisplayName ||
											matchedConfig.varValueType !== condition.right.varValueType;

										if (needsUpdate) {
											console.warn(
												`Variable config ${rightVarConfigId} metadata changed, updating condition ${condition.conditionId} right variable`
											);
											updateConditionVariableMetadata(
												cc.caseId,
												condition.conditionId,
												'right',
												matchedConfig.varName,
												matchedConfig.varDisplayName,
												matchedConfig.varValueType
											);
										}
									}
								}
							});
						});
						break;
				}
			});

			// Reverse check: find orphan configurations that reference disconnected nodes
			// This handles the case where a node is disconnected but its configurations remain
			const sourceNodeIds = new Set(sourceNodes.map(sn => sn.id));

			backtestConfig.cases.forEach((cc) => {
				cc.conditions.forEach((condition) => {
					// Check left variable references a disconnected node
					if (condition.left?.nodeId && !sourceNodeIds.has(condition.left.nodeId)) {
						console.warn(
							`Node ${condition.left.nodeId} is disconnected, resetting condition ${condition.conditionId} left variable`
						);
						resetConditionVariable(cc.caseId, condition.conditionId, 'left');
					}

					// Check right variable references a disconnected node (skip constants)
					if (condition.right && 'nodeId' in condition.right && condition.right.nodeId && !sourceNodeIds.has(condition.right.nodeId)) {
						console.warn(
							`Node ${condition.right.nodeId} is disconnected, resetting condition ${condition.conditionId} right variable`
						);
						resetConditionVariable(cc.caseId, condition.conditionId, 'right');
					}
				});
			});
		}
	}, [id, sourceNodes]);


	const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.IfElseNode),
		handleColor: handleColor,
	};

	return (
		<BaseNode
			id={id}
			nodeName={currentNodeData?.nodeName || "if else node"}
			iconName={currentNodeData?.nodeConfig?.iconName || getNodeIconName(NodeType.IfElseNode)}
			iconBackgroundColor={currentNodeData?.nodeConfig?.iconBackgroundColor || getNodeDefaultColor(NodeType.IfElseNode)}
			borderColor={currentNodeData?.nodeConfig?.borderColor || getNodeDefaultColor(NodeType.IfElseNode)}
			isHovered={currentNodeData?.nodeConfig?.isHovered || false}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
			className="!max-w-none"
		>
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow id={id} data={currentNodeData} handleColor={handleColor} />
			)}
			{tradingMode === TradeMode.LIVE && <LiveModeShow id={id} data={currentNodeData} />}
		</BaseNode>
	);
};

export default memo(IfElseNode);
