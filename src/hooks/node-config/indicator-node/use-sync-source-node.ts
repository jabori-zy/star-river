import { useNodeConnections, useNodesData } from "@xyflow/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { StrategyFlowNode } from "@/types/node";
import { isKlineNode } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import { useBacktestConfig } from "./use-update-backtest-config";

/**
 * 同步指标节点与源 Kline 节点的 Symbol 配置
 *
 * 职责：
 * 1. 监听源节点连接变化
 * 2. 验证连接规则（只能有一个源节点）
 * 3. 自动同步 Kline 节点的 Symbol 到 Indicator 节点
 *
 * @param id - 指标节点 ID
 * @param currentNodeData - 当前节点数据（从外部传入，避免重复获取）
 */
export const useSyncSourceNode = ({
	id,
	currentNodeData,
}: {
	id: string;
	currentNodeData: IndicatorNodeData;
}) => {
	const { updateSelectedSymbol } = useBacktestConfig({ id });

	// 获取当前节点的输入连接
	const connections = useNodeConnections({ id, handleType: "target" });
	const sourceNodes = useNodesData<StrategyFlowNode>(
		connections.map((connection) => connection.source),
	);

	useEffect(() => {
		// 规则1: 指标节点只能有一个源节点
		if (sourceNodes.length > 1) {
			toast.error("indicator node only has one source node");
			return;
		}

		// 规则2: 断开连接时清空选中的 symbol
		if (sourceNodes.length === 0) {
			updateSelectedSymbol(null);
			return;
		}

		// 规则3: 只能连接 Kline 节点
		if (sourceNodes.length === 1) {
			if (!isKlineNode(sourceNodes[0])) {
				// 静默处理：如果源节点不是 Kline 节点，不做任何操作
				// toast.error("indicator node only has been connected by kline node");
				return;
			}

			// 同步 Kline 节点的 Symbol 配置
			syncSymbolFromKlineNode(
				sourceNodes[0].data as KlineNodeData,
				currentNodeData,
				updateSelectedSymbol,
			);
		}
	}, [sourceNodes, id, updateSelectedSymbol]);
};

/**
 * 从 Kline 节点同步 Symbol 到 Indicator 节点
 *
 * 同步规则：
 * 1. 如果 Kline 节点没有 Symbol 配置，清空 Indicator 节点的选中
 * 2. 如果 Indicator 节点没有选中 Symbol，不做任何操作
 * 3. 如果 Indicator 节点的 Symbol 在 Kline 节点中不存在，清空选中
 * 4. 如果 Symbol 的 symbol 或 interval 发生变化，更新选中
 *
 * @param klineNodeData - Kline 节点数据
 * @param indicatorNodeData - Indicator 节点数据
 * @param updateSelectedSymbol - 更新 Symbol 的回调函数
 */
function syncSymbolFromKlineNode(
	klineNodeData: KlineNodeData,
	indicatorNodeData: IndicatorNodeData,
	updateSelectedSymbol: (symbol: SelectedSymbol | null) => void,
) {
	// 获取当前指标节点选中的 symbol
	const selectedSymbol =
		indicatorNodeData?.backtestConfig?.exchangeModeConfig?.selectedSymbol;

	// 如果指标节点没有选中 symbol，不需要同步
	if (!selectedSymbol) {
		return;
	}

	// 获取 Kline 节点的 symbol 配置
	const klineNodeSymbols =
		klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;

	// 如果 Kline 节点没有 symbol 配置，清空指标节点的选中
	if (!klineNodeSymbols || klineNodeSymbols.length === 0) {
		updateSelectedSymbol(null);
		return;
	}

	// 查找匹配的 symbol（通过 configId 匹配）
	const matchingSymbol = klineNodeSymbols.find(
		(symbol) => symbol.configId === selectedSymbol.configId,
	);

	// 如果找不到匹配的 symbol，清空选中
	if (!matchingSymbol) {
		updateSelectedSymbol(null);
		return;
	}

	// 如果 symbol 或 interval 发生变化，更新选中
	if (
		matchingSymbol.symbol !== selectedSymbol.symbol ||
		matchingSymbol.interval !== selectedSymbol.interval
	) {
		updateSelectedSymbol(matchingSymbol);
	}

	// 如果 symbol 和 interval 都没有变化，不做任何操作
}
