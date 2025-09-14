import { DateTime } from 'luxon';

/**
 * 将本地日历时间对齐到 UTC 轴：chartMs = getTime() - offsetMs（原生Date）或 toMillis() + offset*60*1000（Luxon DateTime）。
 * 适用于"图表只认 UTC，但希望本地 00:00 在 UTC 轴显示为 00:00"的场景。
 */
export const getChartAlignedUtcMs = (input: DateTime): number => {
    // Luxon DateTime：使用加法，因为 toMillis() 已经是本地时间对应的UTC时间戳
    const offsetMs = input.offset * 60 * 1000;
    return input.toMillis() + offsetMs;
	
};

/**
 * 将本地日历时间对齐到 UTC 轴的秒级时间戳（向下取整）。
 */
export const getChartAlignedUtcSeconds = (input: string | DateTime): number => {
    const datetime = input instanceof DateTime ? input : DateTime.fromISO(input);
	return Math.floor(getChartAlignedUtcMs(datetime) / 1000);
};
