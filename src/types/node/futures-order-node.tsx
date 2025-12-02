import type { Node } from "@xyflow/react";
import type { FuturesOrderConfig } from "@/types/order";
import type {
	BacktestDataSource,
	SelectedAccount,
	TimeRange,
} from "@/types/strategy";
import type { NodeDataBase } from ".";

export type FuturesOrderNodeLiveConfig = {
	futuresOrderConfigs: FuturesOrderConfig[];
	selectedAccount?: SelectedAccount;
};

export type FuturesOrderNodeSimulateConfig = {
	futuresOrderConfigs: FuturesOrderConfig[];
	selectedSimulateAccount?: SelectedAccount;
};

export type FuturesOrderNodeBacktestExchangeModeConfig = {
	selectedAccount?: SelectedAccount;
	timeRange: TimeRange; // 回测时间范围
};

export type FuturesOrderNodeBacktestConfig = {
	dataSource: BacktestDataSource;
	exchangeModeConfig?: FuturesOrderNodeBacktestExchangeModeConfig;
	futuresOrderConfigs: FuturesOrderConfig[];
};

export type FuturesOrderNodeData = NodeDataBase & {
	// 针对不同交易模式的条件配置
	liveConfig?: FuturesOrderNodeLiveConfig;
	backtestConfig?: FuturesOrderNodeBacktestConfig;
	simulateConfig?: FuturesOrderNodeSimulateConfig;
};

export type FuturesOrderNode = Node<FuturesOrderNodeData, "futuresOrderNode">;
