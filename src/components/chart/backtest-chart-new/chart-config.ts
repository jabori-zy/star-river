import { CrosshairMode, type Time, type ChartOptions, type DeepPartial } from "lightweight-charts";
import dayjs from "dayjs";


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
                return dayjs(time * 1000).format("YYYY-MM-DD HH:mm");
            }

            if (typeof time === "object" && time !== null && "year" in time) {
                const date = new Date(time.year, time.month - 1, time.day);
                return dayjs(date).format("YYYY-MM-DD");
            }

            if (typeof time === "string") {
                return dayjs(time).format("YYYY-MM-DD");
            }

            return String(time);
        },
    },
    timeScale: {
        visible: true,
        timeVisible: true,
    },
};