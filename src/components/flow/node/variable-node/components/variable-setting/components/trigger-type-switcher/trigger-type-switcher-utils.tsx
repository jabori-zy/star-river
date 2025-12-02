import type { TFunction } from "i18next";

/**
 * 获取时间单位选项（不包含毫秒）
 * 用于定时器配置等常规时间间隔场景
 */
export const getTimeUnitOptions = (t: TFunction) => [
	{ value: "millisecond", label: t("common.timeUnit.millisecond") },
	{ value: "second", label: t("common.timeUnit.second") },
	{ value: "minute", label: t("common.timeUnit.minute") },
	{ value: "hour", label: t("common.timeUnit.hour") },
	{ value: "day", label: t("common.timeUnit.day") },
];
