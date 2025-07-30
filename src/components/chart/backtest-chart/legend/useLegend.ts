import dayjs from "dayjs";
import type {
	CandlestickData,
	ISeriesApi,
	MouseEventParams,
	Time,
	WhitespaceData,
} from "lightweight-charts";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { colors } from "./colors";

// const chart = createChart(container, chartOptions);

// const series = chart.addSeries(CandlestickSeries, {
//     upColor: '#26a69a',
//     downColor: '#ef5350',
//     borderVisible: false,
//     wickUpColor: '#26a69a',
//     wickDownColor: '#ef5350',
// });

export type LegendData = {
	open?: string;
	high?: string;
	low?: string;
	close?: string;
	time: Time; // 使用 Time 类型，与 K线数据保持一致
	timeString: string; // 用于显示的时间字符串
	color?: string;
	change?: string;
};

// 移除模拟数据，现在使用真实数据

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
}: CandlestickData): LegendData => {
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
): LegendData | null => {
	const data = s.dataByIndex(Number.MAX_SAFE_INTEGER, -1);

	if (!data) {
		return null;
	}

	if (!isCandlestickData(data)) {
		return null;
	}

	return mapCandlestickDataToLegendData(data);
};

interface UseLegendOptions {
	data?: CandlestickData[];
}

export const useLegend = (options: UseLegendOptions = {}) => {
	const { data = [] } = options;
	const klineSeriesRef = useRef<SeriesApiRef<"Candlestick">>(null);

	// 使用传入的数据或默认数据来初始化 legendData
	const [legendData, setLegendData] = useState<LegendData | null>(() => {
		if (data && data.length > 0) {
			return mapCandlestickDataToLegendData(data[data.length - 1]);
		}
		return null;
	});

	// 🔧 修复：监听数据变化，自动更新 legendData
	useEffect(() => {
		// console.log("Legend: 数据变化", {
		// 	dataLength: data?.length,
		// 	hasData: data && data.length > 0,
		// });
		if (data && data.length > 0) {
			const lastDataPoint = data[data.length - 1];
			// console.log("Legend: 最后一个数据点", lastDataPoint);
			const newLegendData = mapCandlestickDataToLegendData(lastDataPoint);
			// console.log("Legend: 新的图例数据", newLegendData);
			setLegendData((prev) => {
				// 只有在时间不同时才更新，避免不必要的渲染
				const shouldUpdate = prev?.time !== newLegendData.time;
				// console.log("Legend: useEffect 是否更新图例", {
				// 	shouldUpdate,
				// 	prevTime: prev?.time,
				// 	newTime: newLegendData.time,
				// 	prevTimeString: prev?.timeString,
				// 	newTimeString: newLegendData.timeString,
				// });
				if (shouldUpdate) {
					return newLegendData;
				}
				return prev;
			});
		} else {
			// console.log("Legend: 没有数据，设置为 null");
			setLegendData(null);
		}
	}, [data]);

	const onCrosshairMove = useCallback((param: MouseEventParams) => {
		if (!klineSeriesRef.current) {
			// console.log("Legend: ref.current 不存在");
			return;
		}

		const seriesApi = klineSeriesRef.current.api();
		if (!seriesApi) {
			// console.log("Legend: seriesApi 不存在");
			return;
		}

		if (!param) {
			// console.log("Legend: param 不存在");
			return;
		}

		// console.log("Legend: onCrosshairMove 被调用", {
		// 	time: param.time,
		// 	hasSeriesData: param.seriesData.size > 0,
		// });

		if (!param.time) {
			// console.log("Legend: 没有时间参数，获取最后一个数据点");
			const lastBarData = getLastBarLegendData(seriesApi);
			// console.log("Legend: 最后一个数据点", lastBarData);
			setLegendData((prev) =>
				prev?.time !== lastBarData?.time ? lastBarData : prev,
			);
			return;
		}

		// 获取数据，可能为 undefined
		const dataFromChart = param.seriesData.get(seriesApi);
		// console.log("Legend: 从图表获取的数据", dataFromChart);

		// 先检查是否为 undefined，再进行类型检查
		if (!isCandlestickData(dataFromChart)) {
			// console.log("Legend: 数据不是有效的蜡烛图数据，获取最后一个数据点");
			// 如果没有数据，显示最后一个数据点而不是 null
			const lastBarData = getLastBarLegendData(seriesApi);
			// console.log("Legend: 最后一个数据点", lastBarData);
			setLegendData((prev) =>
				prev?.time !== lastBarData?.time ? lastBarData : prev,
			);
			return;
		}

		const newLegendData = mapCandlestickDataToLegendData(dataFromChart);
		// console.log("Legend: 新的图例数据", newLegendData);
		setLegendData((prev) => {
			const shouldUpdate = prev?.time !== newLegendData.time;
			// console.log("Legend: 是否更新图例", {
			// 	shouldUpdate,
			// 	prevTime: prev?.time,
			// 	newTime: newLegendData.time,
			// 	prevTimeString: prev?.timeString,
			// 	newTimeString: newLegendData.timeString,
			// });
			return shouldUpdate ? newLegendData : prev;
		});
	}, []);

	return {
		klineSeriesRef,
		legendData,
		onCrosshairMove,
	};
};
