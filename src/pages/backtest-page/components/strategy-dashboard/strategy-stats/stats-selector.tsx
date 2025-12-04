import { FunnelPlus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import type { StrategyStatsName } from "@/types/statistics";

// 统计选项配置（不包含 label，label 将通过 i18n 动态获取）
const statsOptions: { value: StrategyStatsName }[] = [
	{ value: "balance" },
	{ value: "unrealizedPnl" },
	{ value: "equity" },
	{ value: "cumulativeReturn" },
	{ value: "realizedPnl" },
	{ value: "availableBalance" },
];

const StatsSelector: React.FC = () => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const { addStats, removeStats, chartConfig } =
		useBacktestStatsChartConfigStore();

	// 获取当前选中的统计项（isDelete为false的项）
	const getSelectedStats = (): StrategyStatsName[] => {
		if (!chartConfig) return [];
		return chartConfig.statsChartConfigs
			.filter((config) => !config.isDelete)
			.map((config) => config.seriesConfigs.statsName);
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
			<PopoverContent className="w-full" align="start">
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
								{t(`desktop.backtestPage.performance.${option.value}`)}
							</label>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default StatsSelector;
