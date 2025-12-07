import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { getStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import type { StrategyStatsName } from "@/types/statistics";

// Statistics chart dedicated preset colors
const STATS_PRESET_COLORS = [
	"#2196F3", // Blue - main data line
	"#FF6B6B", // Red - loss related
	"#4ECDC4", // Cyan - profit related
	"#45B7D1", // Sky blue - asset related
	"#96CEB4", // Green - success related
	"#FFEAA7", // Yellow - warning related
	"#DDA0DD", // Purple - ratio related
	"#98D8C8", // Mint green - risk related
	"#F7DC6F", // Gold - return related
	"#BB8FCE", // Lilac - other indicators
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
	const { t } = useTranslation();
	const { getStatsChartConfig: getStatsChartConfigFromStore, updateStatsColor } =
		useBacktestStatsChartConfigStore();
	const [tempColor, setTempColor] = useState<string>("#000000");
	const [originalColor, setOriginalColor] = useState<string>("#000000");

	// Get current statistics configuration color
	useEffect(() => {
		if (open) {
			const config = getStatsChartConfigFromStore(statsName);
			const currentColor = config?.seriesConfigs.color || "#000000";
			setOriginalColor(currentColor);
			setTempColor(currentColor);
		}
	}, [open, statsName, getStatsChartConfigFromStore]);

	// Confirm modification - save new color
	const handleConfirm = () => {
		updateStatsColor(statsName, tempColor);
		onOpenChange(false);
	};

	// Cancel modification - restore original color
	const handleCancel = () => {
		setTempColor(originalColor);
		onOpenChange(false);
	};

	// Get localized display name
	const displayName = getStatsChartConfig(statsName, t).seriesConfigs.name;

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[350px]">
				<DialogHeader>
					<DialogTitle>Edit Stats Configuration</DialogTitle>
					<DialogDescription>Modify color configuration for "{displayName}"</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="flex items-center justify-between">
						{/* Stats name */}
						<Label className="text-sm font-medium text-gray-700">
							{displayName}
						</Label>

						{/* Color picker */}
						<div className="w-12">
							<ColorPicker
								value={tempColor}
								onChange={(color) => setTempColor(color)}
								onChangeComplete={(colorValue) => setTempColor(colorValue.hex)}
								showAlpha={true}
								showPresets={true}
								presetColors={STATS_PRESET_COLORS}
								className="w-full"
							/>
						</div>
					</div>

					{/* Color preview */}
					<div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
						<span className="text-sm text-gray-600">Preview:</span>
						<div
							className="w-4 h-4 rounded border"
							style={{ backgroundColor: tempColor }}
						/>
						<span className="text-sm font-mono" style={{ color: tempColor }}>
							123.45
						</span>
					</div>
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
