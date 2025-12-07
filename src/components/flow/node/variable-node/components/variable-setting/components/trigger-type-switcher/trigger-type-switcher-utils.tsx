import type { TFunction } from "i18next";

/**
 * Get time unit options (excluding milliseconds)
 * Used for timer configuration and regular time interval scenarios
 */
export const getTimeUnitOptions = (t: TFunction) => [
	{ value: "millisecond", label: t("common.timeUnit.millisecond") },
	{ value: "second", label: t("common.timeUnit.second") },
	{ value: "minute", label: t("common.timeUnit.minute") },
	{ value: "hour", label: t("common.timeUnit.hour") },
	{ value: "day", label: t("common.timeUnit.day") },
];
