import { type NodeProps, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import { memo } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { getNodeDefaultOutputHandleId, NodeType } from "@/types/node/index";
import type { StartNode as StartNodeType } from "@/types/node/start-node";
import {
	type StrategyBacktestConfig,
	type StrategyLiveConfig,
	TradeMode,
} from "@/types/strategy";
import BacktestNodeShow from "./components/node-show/backtest-mode-show";
import LiveNodeShow from "./components/node-show/live-mode-show";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { StartNodeData } from "@/types/node/start-node";

const StartNode: React.FC<NodeProps<StartNodeType>> = ({
	id,
	selected,
	isConnectable,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getNodeData } = useStrategyWorkflow();
	const startNodeData = getNodeData(id) as StartNodeData;

	// 节点名称
	const nodeName = startNodeData?.nodeName || "策略起点";
	const liveConfig = startNodeData?.liveConfig || ({} as StrategyLiveConfig);
	const backtestConfig = startNodeData?.backtestConfig ||({} as StrategyBacktestConfig);

	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.StartNode),
		type: "source",
		position: Position.Right,
		isConnectable: isConnectable,
		handleColor: "!bg-red-400",
	};

	// 设置默认实盘和回测配置 - 只在配置为空时初始化
	// useEffect(() => {
	// 	// 只有当配置为空或未定义时才设置默认配置
	// 	if (!startNodeData?.liveConfig) {
	// 		setDefaultLiveConfig();
	// 	}
	// 	if (!startNodeData?.backtestConfig) {
	// 		setDefaultBacktestConfig();
	// 	}
	// }, [
	// 	setDefaultLiveConfig,
	// 	setDefaultBacktestConfig,
	// 	startNodeData?.liveConfig,
	// 	startNodeData?.backtestConfig,
	// ]);

	// 关键：监听全局状态变化，同步到节点data
	// useEffect(() => {
	// 	// 只有当全局状态存在时才同步到节点
	// 	if (startNodeData?.liveConfig || startNodeData?.backtestConfig) {
	// 		setNodes((nodes) =>
	// 			nodes.map((node) =>
	// 				node.id === id
	// 					? {
	// 							...node,
	// 							data: {
	// 								...node.data,
	// 								// 如果全局状态存在，则更新对应的配置
	// 								...(startNodeData?.liveConfig && { liveConfig: startNodeData?.liveConfig }),
	// 								...(startNodeData?.backtestConfig && {
	// 									backtestConfig: startNodeData?.backtestConfig,
	// 								}),
	// 							},
	// 						}
	// 					: node,
	// 			),
	// 		);
	// 	}
	// }, [id, startNodeData?.liveConfig, startNodeData?.backtestConfig, setNodes]);

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			icon={Play}
			selected={selected}
			selectedBorderColor="border-red-400"
			defaultOutputHandle={defaultOutputHandle}
		>
			{/* 实盘模式 */}
			{tradingMode === TradeMode.LIVE && (
				<LiveNodeShow liveConfig={liveConfig} />
			)}
			{/* 回测模式 */}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestNodeShow backtestConfig={backtestConfig} />
			)}
		</BaseNode>
	);
};

export default memo(StartNode);
