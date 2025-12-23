import { useEffect, useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorSeriesConfig } from "@/types/chart";
import type { IndicatorKeyStr } from "@/types/symbol-key";

// Indicator chart preset colors
const INDICATOR_PRESET_COLORS = [
	"#2196F3", // Blue - Main trend line
	"#FF6B6B", // Red - Sell signal
	"#4ECDC4", // Cyan - Buy signal
	"#45B7D1", // Sky blue - Auxiliary line
	"#96CEB4", // Green - Volume
	"#FFEAA7", // Yellow - Warning signal
	"#DDA0DD", // Purple - Oscillation indicator
	"#98D8C8", // Mint green - Support level
	"#F7DC6F", // Gold - Resistance level
	"#BB8FCE", // Light purple - Neutral signal
];

interface IndicatorLegendEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	chartId: number;
	indicatorKeyStr: IndicatorKeyStr;
}

export function IndicatorLegendEditDialog({
	open,
	onOpenChange,
	chartId,
	indicatorKeyStr,
}: IndicatorLegendEditDialogProps) {
	const { getChartConfig, setChartConfig } = useBacktestChartConfigStore();
	const chartConfig = useBacktestChartConfigStore((state) => state.chartConfig);
	const [originalSeriesConfigs, setOriginalSeriesConfigs] = useState<
		IndicatorSeriesConfig[]
	>([]);
	const [tempSeriesConfigs, setTempSeriesConfigs] = useState<IndicatorSeriesConfig[]>(
		[],
	);

	// Get current indicator's seriesConfigs
	useEffect(() => {
		if (open) {
			const chart = getChartConfig(chartId);
			if (chart) {
				const indicatorConfig = chart.indicatorChartConfigs.find(
					(config) =>
						config.indicatorKeyStr === indicatorKeyStr && !config.isDelete,
				);
				if (indicatorConfig) {
					const configs = [...indicatorConfig.seriesConfigs];
					setOriginalSeriesConfigs(configs);
					setTempSeriesConfigs(configs);
				}
			}
		}
	}, [open, chartId, indicatorKeyStr, getChartConfig]);

	// Update temporary series config color (not saved in real-time)
	const updateTempSeriesColor = (index: number, color: string) => {
		const newTempConfigs = [...tempSeriesConfigs];
		newTempConfigs[index] = { ...newTempConfigs[index], color };
		setTempSeriesConfigs(newTempConfigs);
	};

	// Confirm changes - save temporary config to store
	const handleConfirm = () => {
		const newChartConfig = {
			...chartConfig,
			charts: chartConfig.charts.map((chart) =>
				chart.id === chartId
					? {
							...chart,
							indicatorChartConfigs: chart.indicatorChartConfigs.map(
								(config) =>
									config.indicatorKeyStr === indicatorKeyStr
										? { ...config, seriesConfigs: tempSeriesConfigs }
										: config,
							),
						}
					: chart,
			),
		};
		setChartConfig(newChartConfig);
		onOpenChange(false);
	};

	// Cancel changes - restore original config
	const handleCancel = () => {
		setTempSeriesConfigs([...originalSeriesConfigs]);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[350px]">
				<DialogHeader>
					<DialogTitle>Edit Indicator Config</DialogTitle>
					<DialogDescription>Modify indicator series color configuration</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					{tempSeriesConfigs.map((series, index) => (
						<div
							key={`${series.name}-${series.indicatorValueKey}-${index}`}
							className="flex items-center justify-between"
						>
							{/* Series name */}
							<Label className="text-sm font-medium text-gray-700">
								{series.name}
							</Label>

							{/* Color picker */}
							<div className="w-12">
								<ColorPicker
									value={series.color || "#000000"}
									onChange={(color) => updateTempSeriesColor(index, color)}
									onChangeComplete={(colorValue) =>
										updateTempSeriesColor(index, colorValue.hex)
									}
									showAlpha={true}
									showPresets={true}
									presetColors={INDICATOR_PRESET_COLORS}
									className="w-full"
								/>
							</div>
						</div>
					))}
				</div>

				{/* Confirm and cancel buttons */}
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleConfirm}>Confirm</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
