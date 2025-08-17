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
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import type { StrategyStatsName } from "@/types/statistics";

// 统计图表专用预设颜色
const STATS_PRESET_COLORS = [
	"#2196F3", // 蓝色 - 主要数据线
	"#FF6B6B", // 红色 - 亏损相关
	"#4ECDC4", // 青色 - 盈利相关
	"#45B7D1", // 天蓝色 - 资产相关
	"#96CEB4", // 绿色 - 成功相关
	"#FFEAA7", // 黄色 - 警告相关
	"#DDA0DD", // 紫色 - 比率相关
	"#98D8C8", // 薄荷绿 - 风险相关
	"#F7DC6F", // 金色 - 收益相关
	"#BB8FCE", // 淡紫色 - 其他指标
];

interface StatsLegendEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	statsName: StrategyStatsName;
}

export function StatsLegendEditDialog({
	open,
	onOpenChange,
	statsName,
}: StatsLegendEditDialogProps) {
	const { getStatsChartConfig, updateStatsColor } = useBacktestStatsChartConfigStore();
	const [tempColor, setTempColor] = useState<string>("#000000");
	const [originalColor, setOriginalColor] = useState<string>("#000000");

	// 获取当前统计配置的颜色
	useEffect(() => {
		if (open) {
			const config = getStatsChartConfig(statsName);
			const currentColor = config?.seriesConfigs.color || "#000000";
			setOriginalColor(currentColor);
			setTempColor(currentColor);
		}
	}, [open, statsName, getStatsChartConfig]);

	// 确认修改 - 保存新颜色
	const handleConfirm = () => {
		updateStatsColor(statsName, tempColor);
		onOpenChange(false);
	};

	// 取消修改 - 恢复原始颜色
	const handleCancel = () => {
		setTempColor(originalColor);
		onOpenChange(false);
	};

	// 获取统计配置信息用于显示
	const statsConfig = getStatsChartConfig(statsName);
	const displayName = statsConfig?.seriesConfigs.name || statsName;

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[350px]">
				<DialogHeader>
					<DialogTitle>编辑统计配置</DialogTitle>
					<DialogDescription>修改 "{displayName}" 的颜色配置</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="flex items-center justify-between">
						{/* 统计名称 */}
						<Label className="text-sm font-medium text-gray-700">
							{displayName}
						</Label>

						{/* 颜色选择 */}
						<div className="w-12">
							<ColorPicker
								value={tempColor}
								onChange={(color) => setTempColor(color)}
								onChangeComplete={(colorValue) =>
									setTempColor(colorValue.hex)
								}
								showAlpha={true}
								showPresets={true}
								presetColors={STATS_PRESET_COLORS}
								className="w-full"
							/>
						</div>
					</div>

					{/* 颜色预览 */}
					<div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
						<span className="text-sm text-gray-600">预览:</span>
						<div
							className="w-4 h-4 rounded border"
							style={{ backgroundColor: tempColor }}
						/>
						<span className="text-sm font-mono" style={{ color: tempColor }}>
							123.45
						</span>
					</div>
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