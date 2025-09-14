
import {
	type ChartOptions,
	CrosshairMode,
	type DeepPartial,
	type Time,
} from "lightweight-charts";
import {DateTime} from "luxon";

export const chartOptions: DeepPartial<ChartOptions> = {
	grid: {
		vertLines: {
			visible: false,
		},
		horzLines: {
			visible: false,
		},
	},
	crosshair: {
		mode: CrosshairMode.Normal,
		vertLine: {
			style: 3,
			color: "#080F25",
		},
		horzLine: {
			style: 3,
			color: "#080F25",
		},
	},
	layout: {
		panes: {
			separatorColor: "#080F25",
		},
	},
	localization: {
		timeFormatter: (time: Time) => {
			// 将时间戳转换为 yyyy-mm-dd hh:mm 格式
			if (typeof time === "number") {
				return DateTime.fromMillis(time * 1000).toUTC().toFormat("yyyy-MM-dd HH:mm");
			}

			if (typeof time === "object" && time !== null && "year" in time) {
				const date = new Date(time.year, time.month - 1, time.day);
				return DateTime.fromJSDate(date).toUTC().toFormat("yyyy-MM-dd");
			}

			if (typeof time === "string") {
				return DateTime.fromISO(time).toUTC().toFormat("yyyy-MM-dd");
			}

			return String(time);
		},
	},
	timeScale: {
		visible: true,
		timeVisible: true,
	},
};
