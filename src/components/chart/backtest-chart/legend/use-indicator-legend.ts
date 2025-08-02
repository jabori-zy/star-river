import type {
	MouseEventParams,
	SingleValueData,
	Time,
} from "lightweight-charts";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { getIndicatorConfig, getValueLegendShowName } from "@/types/indicator/indicator-config";
import type { IndicatorType } from "@/types/indicator";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey, IndicatorKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { colors } from "./colors";

export type IndicatorLegendData = {
	indicatorName: string;
	values: Record<string, { label: string; value: string; color?: string }>;
	time: Time;
	timeString: string;
};

// 解析指标名称从indicatorKeyStr
const parseIndicatorName = (indicatorKeyStr: IndicatorKeyStr): string => {
	try {
		const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
		console.log("indicatorKey", indicatorKey.indicatorConfig);
		const config = getIndicatorConfig(indicatorKey.indicatorType);
		return config?.displayName || indicatorKey.indicatorType;
	} catch (error) {
		console.error("解析指标名称失败:", error);
		return "Unknown";
	}
};

// 时间转换为字符串
const timeToString = (time: Time): string => {
	if (typeof time === "number") {
		return new Date(time * 1000).toLocaleString();
	}
	if (typeof time === "object") {
		const date = new Date(time.year, time.month - 1, time.day);
		return date.toLocaleDateString();
	}
	return time;
};

// 获取指标值的颜色
const getIndicatorValueColor = (_key: string, index: number): string => {
	const colorList = [colors.blue, colors.green, colors.red, colors.gray];
	return colorList[index % colorList.length];
};

// 将指标数据转换为图例数据
const mapIndicatorDataToLegendData = (
	indicatorKeyStr: IndicatorKeyStr,
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	time: Time,
): IndicatorLegendData | null => {
	const indicatorName = parseIndicatorName(indicatorKeyStr);
	const values: Record<string,{ label: string; value: string; color?: string }> = {};

	let foundData = false;
	let colorIndex = 0;

	// 解析indicatorType用于获取legend名称
	let indicatorType: string | undefined;
	try {
		const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
		indicatorType = indicatorKey.indicatorType;
	} catch (error) {
		console.error("解析indicatorType失败:", error);
	}

	// 遍历所有指标值字段
	Object.entries(data).forEach(([key, seriesData]) => {
		if (key === "timestamp") return; // 跳过timestamp字段

		// 查找对应时间的数据点
		const dataPoint = seriesData.find((point) => point.time === time);

		if (dataPoint) {
			foundData = true;

			// 使用新的方法获取legend显示名称，如果没有则使用原始key
			const legendShowName = indicatorType
				? getValueLegendShowName(indicatorType as IndicatorType, key as keyof IndicatorValueConfig)
				: undefined;

			values[key] = {
				label: legendShowName || key,
				value: dataPoint.value.toFixed(2),
				color: getIndicatorValueColor(key, colorIndex++),
			};
		}
	});

	if (!foundData) {
		return null;
	}

	const result = {
		indicatorName,
		values,
		time,
		timeString: timeToString(time),
	};

	return result;
};

// 获取最新数据点的图例数据
const getLastDataLegendData = (
	indicatorKeyStr: IndicatorKeyStr,
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
): IndicatorLegendData | null => {
	let latestTime: Time | null = null;
	let latestTimestamp = 0;

	// 找到最新的时间点
	Object.entries(data).forEach(([key, seriesData]) => {
		if (key === "timestamp" || seriesData.length === 0) return;

		const lastPoint = seriesData[seriesData.length - 1];
		const timestamp = typeof lastPoint.time === "number" ? lastPoint.time : 0;

		if (timestamp > latestTimestamp) {
			latestTimestamp = timestamp;
			latestTime = lastPoint.time;
		}
	});

	if (!latestTime) {
		return null;
	}

	return mapIndicatorDataToLegendData(indicatorKeyStr, data, latestTime);
};

export const useIndicatorLegend = (
	indicatorKeyStr: IndicatorKeyStr,
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
) => {
	const seriesRefs = useRef<
		Record<
			string,
			| SeriesApiRef<"Line">
			| SeriesApiRef<"Area">
			| SeriesApiRef<"Histogram">
			| null
		>
	>({});
	const [legendData, setLegendData] = useState<IndicatorLegendData | null>(
		() => {
			if (data && Object.keys(data).length > 0) {
				return getLastDataLegendData(indicatorKeyStr, data);
			}
			return null;
		},
	);

	// 监听数据变化，自动更新图例数据
	useEffect(() => {
		if (data && Object.keys(data).length > 0) {
			const newLegendData = getLastDataLegendData(indicatorKeyStr, data);
			setLegendData((prev) => {
				// 只有在时间不同时才更新，避免不必要的渲染
				const shouldUpdate = prev?.time !== newLegendData?.time;
				return shouldUpdate ? newLegendData : prev;
			});
		} else {
			setLegendData(null);
		}
	}, [data, indicatorKeyStr]);

	const onCrosshairMove = useCallback(
		(param: MouseEventParams) => {
			if (!param || !param.time) {
				// 没有时间参数时，显示最新数据
				const lastData = getLastDataLegendData(indicatorKeyStr, data);
				setLegendData((prev) => {
					const shouldUpdate = prev?.time !== lastData?.time;
					return shouldUpdate ? lastData : prev;
				});
				return;
			}

			// 根据鼠标位置获取对应时间的数据
			const newLegendData = mapIndicatorDataToLegendData(
				indicatorKeyStr,
				data,
				param.time,
			);

			if (newLegendData) {
				setLegendData((prev) => {
					const shouldUpdate = prev?.time !== newLegendData.time;
					return shouldUpdate ? newLegendData : prev;
				});
			} else {
				// 如果没有找到数据，显示最新数据
				const lastData = getLastDataLegendData(indicatorKeyStr, data);
				setLegendData((prev) => {
					const shouldUpdate = prev?.time !== lastData?.time;
					return shouldUpdate ? lastData : prev;
				});
			}
		},
		[indicatorKeyStr, data],
	);

	return {
		seriesRefs,
		legendData,
		onCrosshairMove,
	};
};
