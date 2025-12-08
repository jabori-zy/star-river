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

// Statistics option configuration (excludes label, which will be dynamically retrieved via i18n)
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

	// Get currently selected statistics (items where isDelete is false)
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
			// If this is the last selected stat, don't allow deselection
			if (isLastSelectedStat && selectedStats.includes(stat)) {
				return;
			}
			removeStats(stat);
		}
	};

	const isCheckboxDisabled = (stat: StrategyStatsName) => {
		// If this is the last selected stat, disable deselection
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
