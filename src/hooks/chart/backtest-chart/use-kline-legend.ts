import dayjs from "dayjs";
import type {
	CandlestickData,
	ISeriesApi,
	DataChangedScope,
	MouseEventParams,
	Time,
	WhitespaceData
} from "lightweight-charts";
import { useCallback, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";

export type KlineLegendData = {
	open?: string;
	high?: string;
	low?: string;
	close?: string;
	time: Time; // 使用 Time 类型，与 K线数据保持一致
	timeString: string; // 用于显示的时间字符串
	color?: string;
	change?: string;
};

const colors = {
	red: "#ef4444",
	green: "#22c55e",
};

const isCandlestickData = (
	data: CandlestickData<Time> | WhitespaceData<Time> | undefined,
): data is CandlestickData<Time> => {
	return (
		data != null &&
		"close" in data &&
		"open" in data &&
		"high" in data &&
		"low" in data
	);
};

const timeToString = (time: Time): string => {
	if (typeof time === "number") {
		// 对于分钟级数据，显示日期和时间
		return dayjs(time * 1000).format("YYYY-MM-DD HH:mm");
	}

	if (typeof time === "object") {
		const date = new Date(time.year, time.month - 1, time.day);
		return dayjs(date).format("YYYY-MM-DD");
	}

	return time;
};

const mapCandlestickDataToLegendData = ({
	open,
	high,
	low,
	close,
	time,
}: CandlestickData<Time>): KlineLegendData => {
	const decreased = open > close;
	const sign = decreased ? "-" : "+";
	const difference = Math.abs(close - open);

	return {
		open: open.toFixed(2),
		high: high.toFixed(2),
		low: low.toFixed(2),
		close: close.toFixed(2),
		time: time, // 保持原始时间格式用于比较
		timeString: timeToString(time), // 用于显示的时间字符串
		color: decreased ? colors.red : colors.green,
		change: `${sign}${difference.toFixed(2)} (${sign}${((difference / open) * 100).toFixed(2)}%)`,
	};
};

const getLastBarLegendData = (
	s: ISeriesApi<"Candlestick">,
): KlineLegendData | null => {
	const data = s.dataByIndex(Number.MAX_SAFE_INTEGER, -1);

	if (!data) {
		return null;
	}

	if (!isCandlestickData(data)) {
		return null;
	}

	return mapCandlestickDataToLegendData(data);
};

interface UseKlineLegendProps {
	chartId: number;
}

export const useKlineLegend = ({chartId}: UseKlineLegendProps) => {
	// 从 store 获取数据和方法
	const { getKlineSeriesRef } = useBacktestChartStore(chartId);

	// 初始化 legendData
	const [legendData, setLegendData] = useState<KlineLegendData | null>(() => {
		const klineSeries = getKlineSeriesRef();
		if (!klineSeries) return null;

		const data = klineSeries.data();
		if (data && data.length > 0) {
			const lastData = data[data.length - 1] as CandlestickData<Time>;
			return mapCandlestickDataToLegendData(lastData);
		}
		return null;
	});

	// 监听 K线数据变化事件
	const onSeriesDataUpdate = useCallback((_scope: DataChangedScope) => {
		const klineSeries = getKlineSeriesRef();
		if (!klineSeries) return;

		const data = klineSeries.data();
		if (data && data.length > 0) {
			const lastDataPoint = data[data.length - 1] as CandlestickData<Time>;
			const newLegendData = mapCandlestickDataToLegendData(lastDataPoint);
			setLegendData(newLegendData);
		} else {
			setLegendData(null);
		}
	}, [getKlineSeriesRef]);

	const onCrosshairMove = useCallback((param: MouseEventParams) => {
			const seriesApi = getKlineSeriesRef();
			if (!seriesApi) {
				return;
			}

			if (!param) {
				return;
			}

			if (!param.time) {
				const lastBarData = getLastBarLegendData(seriesApi);
				setLegendData((prev) =>
					prev?.time !== lastBarData?.time ? lastBarData : prev,
				);
				return;
			}

			// 获取数据，可能为 undefined
			const dataFromChart = param.seriesData.get(seriesApi);

			// 先检查是否为 undefined，再进行类型检查
			if (!isCandlestickData(dataFromChart)) {
				// 如果没有数据，显示最后一个数据点而不是 null
				const lastBarData = getLastBarLegendData(seriesApi);
				setLegendData((prev) =>
					prev?.time !== lastBarData?.time ? lastBarData : prev,
				);
				return;
			}

			const newLegendData = mapCandlestickDataToLegendData(dataFromChart);
			setLegendData((prev) => {
				const shouldUpdate = prev?.time !== newLegendData.time;
				return shouldUpdate ? newLegendData : prev;
			});
		},
		[getKlineSeriesRef],
	);

	return {
		klineLegendData: legendData,
		onCrosshairMove,
		onSeriesDataUpdate,
	};
};
