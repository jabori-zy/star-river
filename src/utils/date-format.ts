import type { TFunction } from "i18next";
import { DateTime } from "luxon";

// ============================================
// Time Format Options
// ============================================

export interface TimeFormatOptions {
	/**
	 * Whether to show timezone
	 * @default true
	 */
	showTimezone?: boolean;

	/**
	 * Timezone display format
	 * - 'short': UTC+8
	 * - 'long': Asia/Shanghai or custom name
	 * - 'offset': +08:00
	 * @default 'short'
	 */
	timezoneFormat?: "short" | "long" | "offset";

	/**
	 * Date format style
	 * - 'smart': Relative time for recent, absolute for old
	 * - 'compact': MM-DD HH:mm
	 * - 'full': YYYY-MM-DD HH:mm
	 * @default 'smart'
	 */
	dateFormat?: "smart" | "compact" | "full";
}

// ============================================
// Main Format Functions
// ============================================

/**
 * Format time with smart relative display and timezone
 *
 * @param date Date object, ISO string, or luxon DateTime
 * @param options Format options
 * @returns Formatted time string with timezone
 *
 * @example
 * formatTimeWithTimezone(new Date())
 * // => "Just now (UTC+8)"
 *
 * formatTimeWithTimezone('2025-11-18T15:30:00', { dateFormat: 'full' })
 * // => "2025-11-18 15:30 (UTC+8)"
 */
export function formatTimeWithTimezone(
	date: Date | string | DateTime | undefined,
	options: TimeFormatOptions = {},
	t: TFunction,
): string {
	if (!date) return "";

	const {
		showTimezone = true,
		timezoneFormat = "short",
		dateFormat = "smart",
	} = options;

	// Convert to DateTime
	let targetDate: DateTime;
	if (date instanceof DateTime) {
		targetDate = date;
	} else if (typeof date === "string") {
		// Try ISO format first (e.g., "2025-11-18T16:29:10+08:00")
		targetDate = DateTime.fromISO(date);

		// If invalid, try SQL format (e.g., "2025-11-18 16:29:10 +08:00")
		if (!targetDate.isValid) {
			targetDate = DateTime.fromSQL(date);
		}

		// If still invalid, try RFC2822 format
		if (!targetDate.isValid) {
			targetDate = DateTime.fromRFC2822(date);
		}
	} else {
		targetDate = DateTime.fromJSDate(date);
	}

	if (!targetDate.isValid) {
		console.error("[formatTimeWithTimezone] Invalid date:", date);
		return "";
	}

	const now = DateTime.now();

	// Calculate total difference in milliseconds
	const diffInMillis = now.toMillis() - targetDate.toMillis();
	const totalSeconds = Math.floor(diffInMillis / 1000);
	const totalMinutes = Math.floor(totalSeconds / 60);
	const totalHours = Math.floor(totalMinutes / 60);
	const totalDays = Math.floor(totalHours / 24);

	let timeStr = "";

	if (dateFormat === "smart") {
		// Smart relative time
		if (totalSeconds < 60) {
			// Less than 1 minute
			timeStr = t("common.timeFormat.justNow");
		} else if (totalMinutes < 60) {
			// Less than 1 hour
			timeStr = t("common.timeFormat.minuteAgo", { minutes: totalMinutes });
		} else if (totalHours < 24 && targetDate.hasSame(now, "day")) {
			// Today (within same day)
			timeStr = t("common.timeFormat.today", {
				time: targetDate.toFormat("HH:mm"),
			});
		} else if (targetDate.hasSame(now.minus({ days: 1 }), "day")) {
			// Yesterday
			timeStr = t("common.timeFormat.yesterday", {
				time: targetDate.toFormat("HH:mm"),
			});
		} else if (totalDays < 7) {
			// Within 7 days
			timeStr = t("common.timeFormat.daysAgo", { days: totalDays });
		} else if (targetDate.hasSame(now, "year")) {
			// Same year
			timeStr = targetDate.toFormat("MM-dd HH:mm:ss");
		} else {
			// Different year
			timeStr = targetDate.toFormat("yyyy-MM-dd HH:mm:ss");
		}
	} else if (dateFormat === "compact") {
		// Compact format: MM-DD HH:mm
		timeStr = targetDate.toFormat("MM-dd HH:mm:ss");
	} else {
		// Full format: YYYY-MM-DD HH:mm
		timeStr = targetDate.toFormat("yyyy-MM-dd HH:mm:ss");
	}

	if (!showTimezone) {
		return timeStr;
	}

	// Add timezone information
	const offsetHours = targetDate.offset / 60;

	switch (timezoneFormat) {
		case "short": {
			// UTC+8 format
			const sign = offsetHours >= 0 ? "+" : "";
			return `${timeStr} (UTC${sign}${offsetHours})`;
		}
		case "long": {
			// Timezone name (e.g., Asia/Shanghai or custom)
			const zoneName = targetDate.zoneName;
			return `${timeStr} (${zoneName})`;
		}
		case "offset": {
			// +08:00 format
			const offset = targetDate.toFormat("ZZ");
			return `${timeStr} ${offset}`;
		}
		default:
			return timeStr;
	}
}

/**
 * Legacy format function (kept for backward compatibility)
 *
 * @deprecated Use formatTimeWithTimezone instead
 */
export const formatDate = (date: Date | undefined): string => {
	if (!date) return "";
	return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd HH:mm:ss ZZ") || "";
};

// ============================================
// Preset Format Functions
// ============================================

/**
 * Format time with smart relative display (default timezone display)
 *
 * @example
 * formatSmartTime(new Date())
 * // => "Just now (UTC+8)"
 */
export function formatSmartTime(
	date: Date | string | DateTime | undefined,
	t: TFunction,
): string {
	return formatTimeWithTimezone(
		date,
		{
			dateFormat: "smart",
			timezoneFormat: "short",
		},
		t,
	);
}

/**
 * Format time in compact style with timezone
 *
 * @example
 * formatCompactTime(new Date())
 * // => "11-18 17:06 (UTC+8)"
 */
export function formatCompactTime(
	date: Date | string | DateTime | undefined,
	t: TFunction,
): string {
	return formatTimeWithTimezone(
		date,
		{
			dateFormat: "compact",
			timezoneFormat: "short",
		},
		t,
	);
}

/**
 * Format time in full style with timezone
 *
 * @example
 * formatFullTime(new Date())
 * // => "2025-11-18 17:06 (UTC+8)"
 */
export function formatFullTime(
	date: Date | string | DateTime | undefined,
	t: TFunction,
): string {
	return formatTimeWithTimezone(
		date,
		{
			dateFormat: "full",
			timezoneFormat: "short",
		},
		t,
	);
}

/**
 * Format time without timezone
 *
 * @example
 * formatTimeOnly(new Date())
 * // => "Just now"
 */
export function formatTimeOnly(
	date: Date | string | DateTime | undefined,
	t: TFunction,
): string {
	return formatTimeWithTimezone(
		date,
		{
			dateFormat: "compact",
			showTimezone: false,
		},
		t,
	);
}

/**
 * Format time with full details including seconds (for tooltips)
 *
 * @example
 * formatFullTimeWithSeconds(new Date())
 * // => "2025-11-18 17:06:52 +08:00"
 */
export function formatFullTimeWithSeconds(
	date: Date | string | DateTime | undefined,
): string {
	if (!date) return "";

	// Convert to DateTime
	let targetDate: DateTime;
	if (date instanceof DateTime) {
		targetDate = date;
	} else if (typeof date === "string") {
		// Try ISO format first (e.g., "2025-11-18T16:29:10+08:00")
		targetDate = DateTime.fromISO(date);

		// If invalid, try SQL format (e.g., "2025-11-18 16:29:10 +08:00")
		if (!targetDate.isValid) {
			targetDate = DateTime.fromSQL(date);
		}

		// If still invalid, try RFC2822 format
		if (!targetDate.isValid) {
			targetDate = DateTime.fromRFC2822(date);
		}
	} else {
		targetDate = DateTime.fromJSDate(date);
	}

	if (!targetDate.isValid) {
		console.error("[formatTimeWithTimezone] Invalid date:", date);
		return "";
	}

	// Format: YYYY-MM-DD HH:mm:ss +08:00
	return targetDate.toFormat("yyyy-MM-dd HH:mm:ss ZZ");
}
