import type { TFunction } from "i18next";

/**
 * 获取时间单位选项（不包含毫秒）
 * 用于定时器配置等常规时间间隔场景
 */
export const getTimeUnitOptions = (t: TFunction) => [
	{ value: "millisecond", label: t("timeUnit.millisecond") },
	{ value: "second", label: t("timeUnit.second") },
	{ value: "minute", label: t("timeUnit.minute") },
	{ value: "hour", label: t("timeUnit.hour") },
	{ value: "day", label: t("timeUnit.day") },
];

