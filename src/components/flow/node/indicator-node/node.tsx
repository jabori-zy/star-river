import { type NodeProps, Position, useNodeConnections, useNodesData } from "@xyflow/react";
import { Play } from "lucide-react";
import { memo, useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	NodeType,
	isKlineNode,
} from "@/types/node/index";
import type { IndicatorNode as IndicatorNodeType, IndicatorNodeData } from "@/types/node/indicator-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { toast } from "sonner";
import type { KlineNodeData } from "@/types/node/kline-node";
import type { StrategyFlowNode } from "@/types/node";
import { useBacktestConfig } from "@/hooks/node-config/indicator-node";


const IndicatorNode: React.FC<NodeProps<IndicatorNodeType>> = ({
	id,
	selected,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getStartNodeData, getNodeData } = useStrategyWorkflow();
	
	
	const startNodeData = getStartNodeData();
	const currentNodeData = getNodeData(id) as IndicatorNodeData;
	// const sourceNodes = getSourceNodes(id);
	const connections = useNodeConnections({id, handleType: 'target'})
	const sourceNodes = useNodesData<StrategyFlowNode>(connections.map(connection => connection.source));

	const {
		updateSelectedSymbol,
		updateTimeRange,
	} = useBacktestConfig({ id });

	// 监听开始节点的时间范围变化
	useEffect(() => {
		const timeRange = startNodeData?.backtestConfig?.exchangeModeConfig?.timeRange;
		if (timeRange) {
			updateTimeRange(timeRange);
		}
	}, [startNodeData?.backtestConfig?.exchangeModeConfig?.timeRange, updateTimeRange]);


	useEffect(() => {
		// indicator node just has one source kline node
		if (sourceNodes.length > 1) {
			toast.error("indicator node only has one source node");
		}
		// disconnected. clear selected symbol
		else if (sourceNodes.length === 0) {
			updateSelectedSymbol(null);
		}
		else if (sourceNodes.length === 1) {
			if (isKlineNode(sourceNodes[0])) {
				const klineNodeData = sourceNodes[0].data as KlineNodeData;
				// 1.find current node's selected symbol
				const selectedSymbol = currentNodeData?.backtestConfig?.exchangeModeConfig?.selectedSymbol;
				if (selectedSymbol) {
					// 2. find kline node's symbol config
					const klineNodeSymbols = klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;
					// if kline node has no symbol config, then clear current node's selected symbol
					if (klineNodeSymbols && klineNodeSymbols.length === 0) {
						updateSelectedSymbol(null);
					} else {
						// 3. find matching symbol in kline node's symbol config
						const matchingSymbol = klineNodeSymbols?.find(symbol => symbol.configId === selectedSymbol.configId);
						if (!matchingSymbol) {
							updateSelectedSymbol(null);
						} else {
							if (matchingSymbol.symbol !== selectedSymbol.symbol || matchingSymbol.interval !== selectedSymbol.interval) {
								updateSelectedSymbol(matchingSymbol);
							} else {
								// symbol is the same, do nothing
							}
						}
					}
					
				}
			} else {
				// toast.error("indicator node only has been connected by kline node");
			}
		}
	}, [sourceNodes, updateSelectedSymbol]);


	const defaultInputHandle: BaseHandleProps = {
		id: getNodeDefaultInputHandleId(id, NodeType.IndicatorNode),
		type: "target",
		position: Position.Left,
		handleColor: "!bg-red-400",
	};

	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.IndicatorNode),
		type: "source",
		position: Position.Right,
		handleColor: "!bg-red-400",
	};

	return (
		<BaseNode
			id={id}
			nodeName={currentNodeData?.nodeName || "indicator node"}
			icon={Play}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
			defaultOutputHandle={defaultOutputHandle}
		>
			{tradingMode === TradeMode.LIVE && <LiveModeShow id={id} data={currentNodeData} />}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow id={id} data={currentNodeData} />
			)}
		</BaseNode>
	);
};

export default memo(IndicatorNode);
