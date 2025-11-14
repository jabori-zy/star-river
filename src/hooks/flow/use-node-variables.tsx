import { type Connection, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { isDefaultOutputHandleId, NodeType } from "@/types/node/index";
import type {
	IndicatorNodeData,
	SelectedIndicator,
} from "@/types/node/indicator-node";
import type { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import type {
	VariableConfig,
	VariableNodeData,
} from "@/types/node/variable-node";
import { TradeMode } from "@/types/strategy";
import type { IfElseNodeData, CaseItem } from "@/types/node/if-else-node";

// 定义变量项类型，用于存储节点变量信息
export interface VariableItem {
	nodeId: string;
	nodeName: string;
	nodeType: NodeType;
	variables: (SelectedIndicator | SelectedSymbol | VariableConfig)[]; // 可以包含指标节点、K线节点和变量节点的数据
}

/**
 * 节点变量管理相关的hook
 */
const useNodeVariables = () => {
	// 获取 ReactFlow 的节点信息
	const { getNode } = useReactFlow();

	/**
	 * 向变量列表中添加或更新变量选项
	 * @param variableList 当前变量列表
	 * @param nodeId 节点ID
	 * @param nodeName 节点名称
	 * @param nodeType 节点类型
	 * @param variable 要添加的变量
	 */
	const addOrUpdateVariableItem = useCallback(
		(
			variableList: VariableItem[],
			nodeId: string,
			nodeName: string,
			nodeType: NodeType,
			variable: SelectedIndicator | SelectedSymbol | VariableConfig,
		) => {
			// 查找是否已存在相同节点ID的变量项
			const existingItem = variableList.find((item) => item.nodeId === nodeId);

			if (existingItem) {
				// 检查是否已存在相同outputHandleId的变量，避免重复添加
				const existingVariable = existingItem.variables.find(
					(v) => v.outputHandleId === variable.outputHandleId,
				);
				if (!existingVariable) {
					existingItem.variables.push(variable);
				}
			} else {
				// 创建新的变量项
				variableList.push({
					nodeId,
					nodeName,
					nodeType,
					variables: [variable],
				});
			}
		},
		[],
	);

	/**
	 * 获取连接节点的变量信息(ifelse节点专用)
	 * 遍历所有连接，收集源节点的变量信息，用于后续节点使用
	 * @param connections 连接列表
	 * @param tradeMode 交易模式（实盘/回测）
	 * @returns 变量项列表
	 */
	const getConnectedNodeVariables = useCallback(
		(connections: Connection[], tradeMode: TradeMode) => {
			const tempVariableItemList: VariableItem[] = [];

			// 遍历所有连接，收集变量信息
			for (const connection of connections) {
				const sourceNodeId = connection.source;
				const sourceHandleId = connection.sourceHandle;

				// 如果sourceHandleId为空，跳过此连接
				if (!sourceHandleId) continue;

				// 判断上游节点是否有default output handle,如果是，则需要添加所有变量
				const isDefaultOutput = isDefaultOutputHandleId(sourceHandleId);
				const node = getNode(sourceNodeId);

				if (!node) continue;

				const nodeType = node.type as NodeType;

				// 根据节点类型分别处理变量收集
				if (nodeType === NodeType.IndicatorNode) {
					// 处理指标节点
					const indicatorNodeData = node.data as IndicatorNodeData;
					const selectedIndicators =
						tradeMode === TradeMode.LIVE
							? indicatorNodeData?.liveConfig?.selectedIndicators
							: indicatorNodeData?.backtestConfig?.exchangeModeConfig
									?.selectedIndicators;

					if (isDefaultOutput) {
						// 默认输出：添加所有指标变量
						selectedIndicators?.forEach((indicator: SelectedIndicator) => {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								indicatorNodeData.nodeName,
								NodeType.IndicatorNode,
								indicator,
							);
						});
					} else {
						// 特定输出：只添加匹配的指标变量
						const selectedIndicator = selectedIndicators?.find(
							(indicator: SelectedIndicator) =>
								indicator.outputHandleId === sourceHandleId,
						);
						if (selectedIndicator) {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								indicatorNodeData.nodeName,
								NodeType.IndicatorNode,
								selectedIndicator,
							);
						}
					}
				}
				// 收集K线节点变量
				else if (nodeType === NodeType.KlineNode) {
					// 处理K线节点
					const klineNodeData = node.data as KlineNodeData;
					const selectedSymbols =
						tradeMode === TradeMode.LIVE
							? klineNodeData?.liveConfig?.selectedSymbols
							: klineNodeData?.backtestConfig?.exchangeModeConfig
									?.selectedSymbols;

					if (isDefaultOutput) {
						// 默认输出：添加所有K线变量
						selectedSymbols?.forEach((symbol: SelectedSymbol) => {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								klineNodeData.nodeName,
								NodeType.KlineNode,
								symbol,
							);
						});
					} else {
						// 特定输出：只添加匹配的K线变量
						const selectedSymbol = selectedSymbols?.find(
							(symbol: SelectedSymbol) =>
								symbol.outputHandleId === sourceHandleId,
						);
						if (selectedSymbol) {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								klineNodeData.nodeName,
								NodeType.KlineNode,
								selectedSymbol,
							);
						}
					}
				} else if (nodeType === NodeType.VariableNode) {
					// 处理变量节点
					const variableNodeData = node.data as VariableNodeData;
					console.log("variableNodeData", variableNodeData);
					const variableConfigs =
						tradeMode === TradeMode.LIVE
							? variableNodeData?.liveConfig?.variableConfigs
							: variableNodeData?.backtestConfig?.variableConfigs;

					if (isDefaultOutput) {
						// 默认输出：添加所有变量配置
						variableConfigs?.forEach((variableConfig: VariableConfig) => {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								variableNodeData.nodeName,
								NodeType.VariableNode,
								variableConfig,
							);
						});
					} else {
						// 特定输出：只添加匹配的变量配置
						const variableConfig = variableConfigs?.find(
							(config: VariableConfig) =>
								config.outputHandleId === sourceHandleId,
						);
						if (variableConfig) {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								variableNodeData.nodeName,
								NodeType.VariableNode,
								variableConfig,
							);
						}
					}
				}
			}

			return tempVariableItemList;
		},
		[getNode, addOrUpdateVariableItem],
	);

	/**
	 * 获取上游 if-else 节点的 case 信息
	 * 用于收集连接到当前节点的 if-else 节点的 case 配置
	 * @param connections 连接列表
	 * @param tradeMode 交易模式（实盘/回测）
	 * @returns case 信息列表，包含节点信息和对应的 case 配置
	 */
	const getIfElseNodeCases = useCallback(
		(connections: Connection[], tradeMode: TradeMode) => {
			// 导入 IfElseNodeData 和 CaseItem 类型
			const tempCaseList: Array<{
				nodeId: string;
				nodeName: string;
				nodeType: NodeType;
				caseItem: CaseItem | string;
			}> = [];

			// 遍历所有连接，收集 if-else 节点的 case 信息
			for (const connection of connections) {
				const sourceNodeId = connection.source;
				const sourceHandleId = connection.sourceHandle;

				// 如果 sourceHandleId 为空，跳过此连接
				if (!sourceHandleId) continue;

				const node = getNode(sourceNodeId);
				if (!node) continue;

				const nodeType = node.type as NodeType;

				// 只处理 if-else 节点
				if (nodeType === NodeType.IfElseNode) {

					// 动态导入类型以避免循环依赖
					const ifElseNodeData = node.data as IfElseNodeData; // 使用 any 避免直接导入 IfElseNodeData


					// if_else_node_1762999781229_v36t5s0_else_output split by "_"
					const sourceHandleIdParts = sourceHandleId.split("_");
					if (sourceHandleIdParts[sourceHandleIdParts.length - 2] === "else") {
						tempCaseList.push({
							nodeId: node.id,
							nodeName: ifElseNodeData.nodeName,
							nodeType: NodeType.IfElseNode,
							caseItem: "else",
						});
						continue;
					}

					// 根据交易模式获取对应的配置
					const cases =
						tradeMode === TradeMode.LIVE
							? ifElseNodeData?.liveConfig?.cases
							: ifElseNodeData?.backtestConfig?.cases;

					// 查找匹配的 case（通过 outputHandleId）
					const matchedCase = cases?.find(
						(caseItem: CaseItem) => caseItem.outputHandleId === sourceHandleId,
					);
					if (matchedCase) {
						tempCaseList.push({
							nodeId: node.id,
							nodeName: ifElseNodeData.nodeName,
							nodeType: NodeType.IfElseNode,
							caseItem: matchedCase,
						});
					}
				}
			}

			return tempCaseList;
		},
		[getNode],
	);

	return {
		getConnectedNodeVariables,
		getIfElseNodeCases,
	};
};

export default useNodeVariables;
