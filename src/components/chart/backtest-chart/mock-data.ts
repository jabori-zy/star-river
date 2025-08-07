import dayjs from "dayjs";
import type { Time, UTCTimestamp } from "lightweight-charts";
import type { Candlestick } from "./backtest-chart-store";

// 支持多种时间格式的类型，与 lightweight-charts 的 Time 类型兼容

const createStubArray = (length: number) => new Array(length).fill(0);

export const generateOHLCData = (length: number): Candlestick[] => {
	const start = dayjs().subtract(length, "day");
	let previousClose = Math.max(1, Math.random() * 100);

	return createStubArray(length).map((_, i) => {
		const open = previousClose;
		const high = open + Math.random() * 10;
		let low = open - Math.random() * 10;

		low = Math.max(0, low);

		const minimalDistance = 0.01;
		const adjustedHigh = Math.max(high, low + minimalDistance);

		const close = low + Math.random() * (adjustedHigh - low);

		previousClose = close;

		// 生成秒级时间戳
		const timestamp = start.add(i, "day").unix() as UTCTimestamp;

		return {
			time: timestamp,
			open,
			high: adjustedHigh,
			low,
			close,
		};
	});
};

type GenerateLineDataOptions = {
	lastItemTime?: string;
};

type LineData<T> = {
	time: T;
	value: number;
};

export const generateLineData = (
	length: number,
	{ lastItemTime }: GenerateLineDataOptions = {},
): LineData<string>[] => {
	const start = lastItemTime
		? dayjs(lastItemTime).subtract(length, "day")
		: dayjs().subtract(length, "day");
	let lastValue = Math.floor(Math.random() * 100);

	return createStubArray(length).map((_, i) => {
		const change = Math.floor(Math.random() * 21) - 10;
		lastValue = Math.max(0, lastValue + change);

		return {
			time: start.add(i, "day").format("YYYY-MM-DD"),
			value: lastValue,
		};
	});
};

export const generateNextDataPoint = (last: Candlestick): Candlestick => {
	// 修复时间生成逻辑，处理lightweight-charts的时间对象格式
	console.log("last", last);
	let nextTime: Time;

	// 检查时间数据的格式
	if (typeof last.time === "number") {
		// 处理数字时间戳格式（秒级）
		console.log("处理数字时间戳格式:", last.time);
		const nextTimestamp = (last.time + 86400) as UTCTimestamp; // 加一天（86400秒）
		nextTime = nextTimestamp;
	} else if (
		typeof last.time === "object" &&
		last.time !== null &&
		"year" in last.time
	) {
		// 处理 {day, month, year} 对象格式
		const timeObj = last.time as { year: number; month: number; day: number };
		console.log("处理时间对象格式:", timeObj);

		// 使用对象属性创建dayjs实例
		const lastDate = dayjs()
			.year(timeObj.year)
			.month(timeObj.month - 1)
			.date(timeObj.day);
		console.log("解析的日期:", lastDate.format("YYYY-MM-DD"));

		if (lastDate.isValid()) {
			nextTime = lastDate.add(1, "day").format("YYYY-MM-DD");
		} else {
			nextTime = dayjs().format("YYYY-MM-DD");
		}
	} else if (typeof last.time === "string") {
		// 处理字符串格式
		console.log("处理字符串格式:", last.time);
		const lastTime = dayjs(last.time);
		if (lastTime.isValid()) {
			nextTime = lastTime.add(1, "day").format("YYYY-MM-DD");
		} else {
			console.warn("检测到无效时间字符串，使用当前时间:", last.time);
			nextTime = dayjs().format("YYYY-MM-DD");
		}
	} else {
		// 处理其他格式或无效数据
		console.warn("未知的时间格式，使用当前时间:", last.time);
		nextTime = dayjs().format("YYYY-MM-DD");
	}

	console.log("生成的下一个时间:", nextTime);

	const open = last.close;

	const volatility = (Math.random() * open) / 10 + 1;
	const direction = Math.random() > 0.5 ? 1 : -1;
	const change = volatility * direction;
	const minThreshold = 5;

	const close =
		open + change >= minThreshold
			? open + change
			: open - change < -minThreshold
				? open - change
				: open + change;

	const high = Math.max(open, close) + volatility / 2;
	const potentialLow = Math.min(open, close) - volatility / 2;
	const low =
		potentialLow >= minThreshold ? potentialLow : Math.max(open, close);

	return {
		time: nextTime,
		open: Number(open.toFixed(2)),
		high: Number(high.toFixed(2)),
		low: Number(low.toFixed(2)),
		close: Number(close.toFixed(2)),
	};
};
