import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { FunnelPlus } from "lucide-react";
import type { StrategyStatsName } from "@/types/statistics";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";



const statsOptions: { value: StrategyStatsName; label: string }[] = [
	{ value: "balance", label: "账户余额" },
	{ value: "unrealizedPnl", label: "未实现盈亏" },
	{ value: "totalEquity", label: "总权益" },
	{ value: "cumulativeReturn", label: "累计收益" },
	{ value: "realizedPnl", label: "已实现盈亏" },
	{ value: "positionCount", label: "持仓数量" },
];

const StatsSelector: React.FC = () => {
	const [open, setOpen] = useState(false);
	const { addStats, removeStats, chartConfig } = useBacktestStatsChartConfigStore();

	// 获取当前选中的统计项（isDelete为false的项）
	const getSelectedStats = (): StrategyStatsName[] => {
		if (!chartConfig) return [];
		return chartConfig.statsChartConfigs
			.filter(config => !config.isDelete)
			.map(config => config.seriesConfigs.statsName);
	};

	const selectedStats = getSelectedStats();
	const isLastSelectedStat = selectedStats.length === 1;

	const handleStatsToggle = (stat: StrategyStatsName, checked: boolean) => {
		if (checked) {
			addStats(stat);
		} else {
			// 如果是最后一个选中的统计项，不允许取消选择
			if (isLastSelectedStat && selectedStats.includes(stat)) {
				return;
			}
			removeStats(stat);
		}
	};

	const isCheckboxDisabled = (stat: StrategyStatsName) => {
		// 如果这是最后一个选中的统计项，则禁用取消选择
		return isLastSelectedStat && selectedStats.includes(stat);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm">
					<FunnelPlus size={12} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-40" align="start">
				<div className="space-y-2">
					{statsOptions.map((option) => (
						<div key={option.value} className="flex items-center space-x-2">
							<Checkbox
								id={option.value}
								checked={selectedStats.includes(option.value)}
								disabled={isCheckboxDisabled(option.value)}
								onCheckedChange={(checked) =>
									handleStatsToggle(option.value, checked as boolean)
								}
							/>
							<label
								htmlFor={option.value}
								className={`text-sm font-normal leading-none ${
									isCheckboxDisabled(option.value) 
										? "cursor-not-allowed opacity-50" 
										: "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								}`}
							>
								{option.label}
							</label>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default StatsSelector;