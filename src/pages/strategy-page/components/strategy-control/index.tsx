import { useReactFlow } from "@xyflow/react";
import { Calendar, CreditCard, DollarSign, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateStrategy } from "@/service/strategy";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { type Strategy, TradeMode } from "@/types/strategy";
import BacktestStrategyControl from "./backtest-strategy-control";
import LiveStrategyControl from "./live-strategy-control";

// 声明 window.require 类型
declare global {
	interface Window {
		require?: (module: string) => {
			ipcRenderer?: {
				invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
			};
		};
	}
}

// 交易模式选择器组件
function TradingModeSelector({
	strategy,
	setStrategy,
}: {
	strategy: Strategy | undefined;
	setStrategy: (strategy: Strategy) => void;
}) {
	const strategyTradingMode = strategy?.tradeMode;
	const { tradingMode, setTradingMode } = useTradingModeStore();

	useEffect(() => {
		if (strategyTradingMode) {
			setTradingMode(strategyTradingMode);
		}
	}, [strategyTradingMode, setTradingMode]);

	// 获取交易模式图标
	const getTradingModeIcon = (mode: TradeMode | undefined) => {
		switch (mode) {
			case TradeMode.LIVE:
				return <DollarSign className="h-4 w-4 text-green-500" />;
			case TradeMode.SIMULATE:
				return <CreditCard className="h-4 w-4 text-blue-500" />;
			case TradeMode.BACKTEST:
				return <Calendar className="h-4 w-4 text-purple-500" />;
			default:
				return null;
		}
	};

	// 交易模式名称
	const getTradingModeName = (mode: TradeMode | undefined) => {
		switch (mode) {
			case TradeMode.LIVE:
				return "实盘交易";
			case TradeMode.SIMULATE:
				return "模拟交易";
			case TradeMode.BACKTEST:
				return "回测交易";
			default:
				return "";
		}
	};

	// 交易模式颜色
	const getTradingModeColor = (mode: TradeMode | undefined) => {
		switch (mode) {
			case TradeMode.LIVE:
				return "text-green-500 border-green-200";
			case TradeMode.SIMULATE:
				return "text-blue-500 border-blue-200";
			case TradeMode.BACKTEST:
				return "text-purple-500 border-purple-200";
			default:
				return "";
		}
	};

	const handleModeChange = (value: TradeMode) => {
		if (strategy) {
			setStrategy({
				...strategy,
				tradeMode: value,
			});
			setTradingMode(value);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<span className="flex text-xs text-muted-foreground">交易模式:</span>
			<Select value={tradingMode} onValueChange={handleModeChange}>
				<SelectTrigger
					className={`h-8 w-[130px] ${getTradingModeColor(tradingMode)}`}
				>
					<SelectValue>
						<div className="flex items-center gap-2 w-full">
							{getTradingModeIcon(tradingMode)}
							<span className="text-xs truncate">
								{getTradingModeName(tradingMode)}
							</span>
						</div>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectItem
						value={TradeMode.LIVE}
						className="flex items-center gap-2"
					>
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4 text-green-500" />
							<span>实盘交易</span>
						</div>
					</SelectItem>
					<SelectItem
						value={TradeMode.SIMULATE}
						className="flex items-center gap-2"
					>
						<div className="flex items-center gap-2">
							<CreditCard className="h-4 w-4 text-blue-500" />
							<span>模拟交易</span>
						</div>
					</SelectItem>
					<SelectItem
						value={TradeMode.BACKTEST}
						className="flex items-center gap-2"
					>
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-purple-500" />
							<span>回测交易</span>
						</div>
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

// 保存策略按钮组件
function SaveStrategyButton({ strategy }: { strategy: Strategy }) {
	// console.log("保存策略按钮组件", strategy);
	const [isSaving, setIsSaving] = useState(false);
	const reactFlowInstance = useReactFlow();

	// 保存策略
	const handleSaveStrategy = async () => {
		const nodes = reactFlowInstance.getNodes();
		const edges = reactFlowInstance.getEdges();

		// 根据策略模式获取正确的TradeMode枚举值
		let tradeMode = TradeMode.BACKTEST; // 默认值
		if (strategy?.tradeMode === TradeMode.LIVE) {
			tradeMode = TradeMode.LIVE;
		} else if (strategy?.tradeMode === TradeMode.SIMULATE) {
			tradeMode = TradeMode.SIMULATE;
		}

		const strategyData = {
			id: strategy?.id,
			name: strategy?.name,
			description: strategy?.description,
			config: strategy?.config,
			tradeMode, // 使用枚举值
			nodes,
			edges,
		};

		setIsSaving(true);

		try {
			// 使用service方法替代直接fetch调用
			await updateStrategy(strategy?.id as number, strategyData, {
				showToast: true,
				onFinally: () => {
					setTimeout(() => {
						setIsSaving(false);
					}, 1000);
				},
			});
		} catch (err) {
			// 错误处理已在service中完成
			console.error("保存策略时出错:", err);
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			className="flex items-center gap-2 min-w-[100px] font-medium
        border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400
        transition-all duration-200"
			onClick={handleSaveStrategy}
			disabled={isSaving}
		>
			{isSaving ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<Save className="h-4 w-4" />
			)}
			{isSaving ? "保存中" : "保存策略"}
		</Button>
	);
}

interface StrategyControlProps {
	strategy: Strategy;
	setStrategy: (strategy: Strategy) => void;
}

export function StrategyControl({
	strategy,
	setStrategy,
}: StrategyControlProps) {
	const tradeMode = strategy?.tradeMode;

	// 根据交易模式渲染不同的策略控制组件
	const renderStrategyButton = () => {
		switch (tradeMode) {
			case TradeMode.BACKTEST:
				return (
					<BacktestStrategyControl
						strategyId={strategy?.id}
						tradeMode={tradeMode}
					/>
				);
			case TradeMode.LIVE:
			case TradeMode.SIMULATE:
				return (
					<LiveStrategyControl
						strategyId={strategy?.id}
						tradeMode={tradeMode}
					/>
				);
			default:
				return (
					<LiveStrategyControl
						strategyId={strategy?.id}
						tradeMode={tradeMode}
					/>
				);
		}
	};

	return (
		<div className="flex items-center justify-end px-6 py-2">
			<TradingModeSelector strategy={strategy} setStrategy={setStrategy} />
			<Badge variant="outline" className="font-mono mx-3">
				最后保存: 10:30:25
			</Badge>
			<div className="flex items-center gap-2">
				<SaveStrategyButton strategy={strategy} />
				{renderStrategyButton()}
			</div>
		</div>
	);
}
