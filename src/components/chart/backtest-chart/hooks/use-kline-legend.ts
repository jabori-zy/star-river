import dayjs from "dayjs";
import type {
	CandlestickData,
	DataChangedScope,
	ISeriesApi,
	MouseEventParams,
	Time,
	WhitespaceData,
} from "lightweight-charts";
import { useCallback, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";

export type KlineLegendData = {
	open?: string;
	high?: string;
	low?: string;
	close?: string;
	time: Time; // Use Time type to match K-line data
	timeString: string; // Time string for display
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
		// For minute-level data, display date and time
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
		time: time, // Keep original time format for comparison
		timeString: timeToString(time), // Time string for display
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

export const useKlineLegend = ({ chartId }: UseKlineLegendProps) => {
	// Get data and methods from store
	const { getKlineSeriesRef } = useBacktestChartStore(chartId);

	// Initialize legendData
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

	// Listen to K-line data change events
	const onSeriesDataUpdate = useCallback(
		(_scope: DataChangedScope) => {
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
		},
		[getKlineSeriesRef],
	);

	const onCrosshairMove = useCallback(
		(param: MouseEventParams) => {
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

			// Get data, which may be undefined
			const dataFromChart = param.seriesData.get(seriesApi);

			// First check if undefined, then perform type check
			if (!isCandlestickData(dataFromChart)) {
				// If no data, display the last data point instead of null
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
