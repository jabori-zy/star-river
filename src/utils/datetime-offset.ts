import { DateTime } from "luxon";

/**
 * 将本地日历时间对齐到 UTC 轴：chartMs = getTime() - offsetMs（原生Date）或 toMillis() + offset*60*1000（Luxon DateTime）。
 * 适用于"图表只认 UTC，但希望本地 00:00 在 UTC 轴显示为 00:00"的场景。
 */

// /**
//  * 将本地日历时间对齐到 UTC 轴的秒级时间戳（向下取整）。
//  */
// export const getChartAlignedUtcSeconds = (input: string | DateTime): number => {
//     const datetime = input instanceof DateTime ? input : DateTime.fromISO(input);
// 	return Math.floor(getChartAlignedUtcTimestamp(datetime) / 1000);
// };
