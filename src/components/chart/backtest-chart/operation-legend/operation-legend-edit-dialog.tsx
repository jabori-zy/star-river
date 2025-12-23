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
import type { OperationSeriesConfig } from "@/types/chart";
import type { OperationKeyStr } from "@/types/symbol-key";
import { parseSeriesName } from "./operation-legend-utils";

// Operation chart preset colors
const OPERATION_PRESET_COLORS = [
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

interface OperationLegendEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	chartId: number;
	operationKeyStr: OperationKeyStr;
}

export function OperationLegendEditDialog({
	open,
	onOpenChange,
	chartId,
	operationKeyStr,
}: OperationLegendEditDialogProps) {
	const { getChartConfig, setChartConfig } = useBacktestChartConfigStore();
	const chartConfig = useBacktestChartConfigStore((state) => state.chartConfig);
	const [originalSeriesConfigs, setOriginalSeriesConfigs] = useState<
		OperationSeriesConfig[]
	>([]);
	const [tempSeriesConfigs, setTempSeriesConfigs] = useState<OperationSeriesConfig[]>(
		[],
	);

	// Get current operation's seriesConfigs
	useEffect(() => {
		if (open) {
			const chart = getChartConfig(chartId);
			if (chart) {
				const operationConfig = chart.operationChartConfigs?.find(
					(config) =>
						config.operationKeyStr === operationKeyStr && !config.isDelete,
				);
				if (operationConfig) {
					const configs = [...operationConfig.seriesConfigs];
					setOriginalSeriesConfigs(configs);
					setTempSeriesConfigs(configs);
				}
			}
		}
	}, [open, chartId, operationKeyStr, getChartConfig]);

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
							operationChartConfigs: (chart.operationChartConfigs || []).map(
								(config) =>
									config.operationKeyStr === operationKeyStr
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
					<DialogTitle>Edit Operation Config</DialogTitle>
					<DialogDescription>Modify operation series color configuration</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					{tempSeriesConfigs.map((series, index) => (
						<div
							key={`${series.name}-${series.outputSeriesKey}-${index}`}
							className="flex items-center justify-between"
						>
							{/* Series name */}
							<Label className="text-sm font-medium text-gray-700">
								{parseSeriesName(series.name)}
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
									presetColors={OPERATION_PRESET_COLORS}
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
