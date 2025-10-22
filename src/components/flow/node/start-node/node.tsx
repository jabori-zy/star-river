import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Play } from "lucide-react";
import { useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import { useBacktestConfig } from "@/hooks/node-config/start-node/use-update-backtest-config";
import { useLiveConfig } from "@/hooks/node-config/start-node/use-update-live-config";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
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

const StartNode: React.FC<NodeProps<StartNodeType>> = ({
	id,
	data,
	selected,
	isConnectable,
}) => {
	const { tradingMode } = useTradingModeStore();

	// 获取ReactFlow实例以更新节点数据
	const { setNodes } = useReactFlow();

	// 从全局状态获取数据
	const { liveConfig: globalLiveConfig, backtestConfig: globalBacktestConfig } =
		useStartNodeDataStore();

	const { setDefaultLiveConfig } = useLiveConfig({
		initialConfig: data?.liveConfig || undefined,
		nodeId: id,
	});
	const { setDefaultBacktestConfig } = useBacktestConfig({
		initialConfig: data?.backtestConfig || undefined,
		nodeId: id,
	});

	// 节点名称
	const nodeName = data?.nodeName || "策略起点";
	// 实盘配置 - 优先使用全局状态数据
	const liveConfig =
		globalLiveConfig || data?.liveConfig || ({} as StrategyLiveConfig);
	// 回测配置 - 优先使用全局状态数据
	const backtestConfig =
		globalBacktestConfig ||
		data?.backtestConfig ||
		({} as StrategyBacktestConfig);

	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.StartNode),
		type: "source",
		position: Position.Right,
		isConnectable: isConnectable,
		handleColor: "!bg-red-400",
	};

	// 设置默认实盘和回测配置 - 只在配置为空时初始化
	useEffect(() => {
		// 只有当配置为空或未定义时才设置默认配置
		if (!data?.liveConfig) {
			setDefaultLiveConfig();
		}
		if (!data?.backtestConfig) {
			setDefaultBacktestConfig();
		}
	}, [
		setDefaultLiveConfig,
		setDefaultBacktestConfig,
		data?.liveConfig,
		data?.backtestConfig,
	]);

	// 关键：监听全局状态变化，同步到节点data
	useEffect(() => {
		// 只有当全局状态存在时才同步到节点
		if (globalLiveConfig || globalBacktestConfig) {
			setNodes((nodes) =>
				nodes.map((node) =>
					node.id === id
						? {
								...node,
								data: {
									...node.data,
									// 如果全局状态存在，则更新对应的配置
									...(globalLiveConfig && { liveConfig: globalLiveConfig }),
									...(globalBacktestConfig && {
										backtestConfig: globalBacktestConfig,
									}),
								},
							}
						: node,
				),
			);
		}
	}, [id, globalLiveConfig, globalBacktestConfig, setNodes]);

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

export default StartNode;
