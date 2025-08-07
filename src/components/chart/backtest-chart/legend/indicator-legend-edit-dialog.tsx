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
import type { SeriesConfig } from "@/types/chart";
import type { IndicatorKeyStr } from "@/types/symbol-key";

// 指标图表专用预设颜色
const INDICATOR_PRESET_COLORS = [
	"#2196F3", // 蓝色 - 主要趋势线
	"#FF6B6B", // 红色 - 卖出信号
	"#4ECDC4", // 青色 - 买入信号
	"#45B7D1", // 天蓝色 - 辅助线
	"#96CEB4", // 绿色 - 成交量
	"#FFEAA7", // 黄色 - 警告信号
	"#DDA0DD", // 紫色 - 震荡指标
	"#98D8C8", // 薄荷绿 - 支撑位
	"#F7DC6F", // 金色 - 阻力位
	"#BB8FCE", // 淡紫色 - 中性信号
	"#85C1E9", // 浅蓝色 - 次要趋势
	"#F8C471", // 橙色 - 动量指标
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
		SeriesConfig[]
	>([]);
	const [tempSeriesConfigs, setTempSeriesConfigs] = useState<SeriesConfig[]>(
		[],
	);

	// 获取当前指标的seriesConfigs
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

	// 更新临时series配置的颜色（不实时保存）
	const updateTempSeriesColor = (index: number, color: string) => {
		const newTempConfigs = [...tempSeriesConfigs];
		newTempConfigs[index] = { ...newTempConfigs[index], color };
		setTempSeriesConfigs(newTempConfigs);
	};

	// 确认修改 - 将临时配置保存到store
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

	// 取消修改 - 恢复原始配置
	const handleCancel = () => {
		setTempSeriesConfigs([...originalSeriesConfigs]);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>编辑指标配置</DialogTitle>
					<DialogDescription>修改指标系列的颜色配置</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					{tempSeriesConfigs.map((series, index) => (
						<div
							key={`${series.name}-${series.indicatorValueKey}-${index}`}
							className="flex items-center justify-between"
						>
							{/* 系列名称 */}
							<Label className="text-sm font-medium text-gray-700">
								{series.name}
							</Label>

							{/* 颜色选择 */}
							<div className="w-20">
								<ColorPicker
									value={series.color || "#000000"}
									onChange={(color) => updateTempSeriesColor(index, color)}
									onChangeComplete={(colorValue) =>
										updateTempSeriesColor(index, colorValue.hex)
									}
									showAlpha={false}
									showPresets={true}
									presetColors={INDICATOR_PRESET_COLORS}
									className="w-full"
								/>
							</div>
						</div>
					))}
				</div>

				{/* 确认和取消按钮 */}
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						取消
					</Button>
					<Button onClick={handleConfirm}>确定</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
