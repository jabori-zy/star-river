import type { SingleValueData, MouseEventParams } from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { IndicatorLegend, useIndicatorLegend } from "./legend";
import { useImperativeHandle, forwardRef } from "react";

interface MainChartIndicatorLegendProps {
	indicatorKeyStr: IndicatorKeyStr;
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>;
	index: number; // 用于调整位置
}

export interface MainChartIndicatorLegendRef {
	onCrosshairMove: (param: MouseEventParams) => void;
}

/**
 * 主图指标图例组件
 * 单独的组件确保hooks在正确的位置调用
 */
const MainChartIndicatorLegend = forwardRef<MainChartIndicatorLegendRef, MainChartIndicatorLegendProps>(({
	indicatorKeyStr,
	data,
	index,
}, ref) => {
	const { legendData, onCrosshairMove: indicatorOnCrosshairMove } = useIndicatorLegend(indicatorKeyStr, data);

	// 暴露onCrosshairMove方法给父组件
	useImperativeHandle(ref, () => ({
		onCrosshairMove: indicatorOnCrosshairMove,
	}), [indicatorOnCrosshairMove]);

	// 计算top位置，避免使用动态类名
	const topPosition = (index + 1) * 32; // 32px = 8 * 4 (Tailwind的top-8)

	return (
		<IndicatorLegend
			indicatorLegendData={legendData}
			className="absolute left-0 z-10 hover:cursor-pointer hover:bg-gray-100 p-2 rounded-sm"
			style={{ top: `${topPosition}px` }}
		/>
	);
});

export default MainChartIndicatorLegend;
