import { type NodeProps, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import { useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import { useUpdateBacktestConfig } from "@/hooks/node-config/if-else-node/use-update-backtest-config";
import useTradingModeStore from "@/store/useTradingModeStore";
import type { IfElseNode as IfElseNodeType } from "@/types/node/if-else-node";
import { getNodeDefaultInputHandleId, NodeType } from "@/types/node/index";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";

const IfElseNode: React.FC<NodeProps<IfElseNodeType>> = ({
	id,
	data,
	selected,
}) => {
	const nodeName = data?.nodeName || "条件节点";
	const { tradingMode } = useTradingModeStore();

	const { setDefaultBacktestConfig } = useUpdateBacktestConfig({
		id,
		initialConfig: data?.backtestConfig,
	});

	// 初始化时设置默认配置
	useEffect(() => {
		if (!data?.backtestConfig) {
			setDefaultBacktestConfig();
		}
	}, [setDefaultBacktestConfig, data?.backtestConfig]);

	const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.IfElseNode),
		handleColor: "!bg-red-400",
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			icon={Play}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
		>
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow id={id} data={data} />
			)}
			{tradingMode === TradeMode.LIVE && <LiveModeShow id={id} data={data} />}
		</BaseNode>
	);
};

export default IfElseNode;
