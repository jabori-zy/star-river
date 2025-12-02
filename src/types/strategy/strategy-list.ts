import type { StrategyRunState } from "@/types/strategy";

export type StrategyInfo = {
	id: number;
	name: string;
	description: string;
	status: StrategyRunState;
	tradeMode: string;
	nodeCount: number;
	createTime: string;
	updateTime: string;
};
