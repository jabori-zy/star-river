import type { SingleValueData } from "lightweight-charts";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import {
	AreaSeries,
	HistogramSeries,
	LineSeries,
} from "lightweight-charts-react-components";
import { useMemo, useRef } from "react";
import type { SeriesConfig } from "@/types/chart";
import { SeriesType } from "@/types/chart";

// 单个指标 Series 组件的属性接口
export interface IndicatorSeriesProps {
	seriesConfig: SeriesConfig;
	data: SingleValueData[];
	visible?: boolean; // 新增可见性控制属性
}

/**
 * 单个指标 Series 组件
 * 可以被主图指标和子图指标共用
 */
export const IndicatorSeries = ({ seriesConfig, data, visible = true }: IndicatorSeriesProps) => {
	const seriesRef = useRef<SeriesApiRef<"Line"> | SeriesApiRef<"Histogram"> | SeriesApiRef<"Area"> | null>(null);

	const lineSeriesOptions = useMemo(
		() => ({
			color: seriesConfig.color,
		}),
		[seriesConfig.color],
	);

	const histogramSeriesOptions = useMemo(
		() => ({
			color: seriesConfig.color,
		}),
		[seriesConfig.color],
	);

	const areaSeriesOptions = useMemo(
		() => ({
			topColor: seriesConfig.color,
			bottomColor: seriesConfig.color ? `${seriesConfig.color}20` : undefined, // 添加透明度
			lineColor: seriesConfig.color,
		}),
		[seriesConfig.color],
	);

	switch (seriesConfig.type) {
		case SeriesType.LINE:
			return (
				<LineSeries
					ref={seriesRef as React.RefObject<SeriesApiRef<"Line">>}
					data={data}
					options={{
						...lineSeriesOptions,
						lineWidth: 1,
						lastValueVisible: false,
						priceLineVisible: false,
						visible: visible,
					}}
					reactive={true}
					alwaysReplaceData={false}
				/>
			);
		case SeriesType.COLUMN:
			return (
				<HistogramSeries
					ref={seriesRef as React.RefObject<SeriesApiRef<"Histogram">>}
					data={data}
					options={{
						...histogramSeriesOptions,
						lastValueVisible: false,
						priceLineVisible: false,
						visible: visible,
					}}
					reactive={true}
					alwaysReplaceData={false}
				/>
			);
		case SeriesType.MOUNTAIN:
			return (
				<AreaSeries
					ref={seriesRef as React.RefObject<SeriesApiRef<"Area">>}
					data={data}
					options={{
						...areaSeriesOptions,
						visible: visible,
					}}
					reactive={true}
					alwaysReplaceData={false}
				/>
			);
		case SeriesType.DASH:
			// DASH 类型使用 LineSeries 但设置虚线样式
			return (
				<LineSeries
					ref={seriesRef as React.RefObject<SeriesApiRef<"Line">>}
					data={data}
					options={{
						...lineSeriesOptions,
						lineWidth: 1,
						lineStyle: 2, // 虚线样式
						lastValueVisible: false,
						priceLineVisible: false,
						visible: visible,
					}}
					reactive={true}
					alwaysReplaceData={false}
				/>
			);
		default:
			return null;
	}
};

export default IndicatorSeries;
