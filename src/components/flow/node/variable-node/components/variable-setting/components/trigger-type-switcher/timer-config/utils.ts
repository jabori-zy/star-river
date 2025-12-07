import type { TimerTrigger } from "@/types/node/variable-node";

/**
 * Calculate next execution time
 */
export const calculateNextExecutionTime = (config: TimerTrigger): Date => {
	const now = new Date();

	if (config.mode === "interval") {
		// Fixed interval mode: current time + interval
		const { interval, unit } = config;
		const nextTime = new Date(now);

		switch (unit) {
			case "second":
				nextTime.setSeconds(nextTime.getSeconds() + interval);
				break;
			case "minute":
				nextTime.setMinutes(nextTime.getMinutes() + interval);
				break;
			case "hour":
				nextTime.setHours(nextTime.getHours() + interval);
				break;
			case "day":
				nextTime.setDate(nextTime.getDate() + interval);
				break;
		}

		return nextTime;
	} else {
		// Scheduled execution mode
		const { repeatMode } = config;

		if (repeatMode === "hourly") {
			// Hourly/every n hours mode
			const { hourlyInterval, minuteOfHour } = config;
			const nextTime = new Date(now);

			// Set to the specified minute of the next hour
			nextTime.setMinutes(minuteOfHour, 0, 0);

			// If the current time has passed this minute, move to the next interval
			if (nextTime <= now) {
				nextTime.setHours(nextTime.getHours() + hourlyInterval);
			}

			// Ensure it's a multiple of the interval
			const currentHour = nextTime.getHours();
			const targetHour =
				Math.ceil(currentHour / hourlyInterval) * hourlyInterval;
			nextTime.setHours(targetHour);
			nextTime.setMinutes(minuteOfHour, 0, 0);

			return nextTime;
		} else if (repeatMode === "daily") {
			// Daily mode
			const { time, daysOfWeek: customWeekdays } = config;
			const [hours, minutes] = time.split(":").map(Number);
			const nextTime = new Date(now);
			nextTime.setHours(hours, minutes, 0, 0);

			// If today's time has passed, move to tomorrow
			if (nextTime <= now) {
				nextTime.setDate(nextTime.getDate() + 1);
			}

			// Check if the day of week matches
			if (customWeekdays && customWeekdays.length > 0) {
				while (true) {
					const dayOfWeek = nextTime.getDay() === 0 ? 7 : nextTime.getDay();
					if (customWeekdays.includes(dayOfWeek)) {
						break;
					}
					nextTime.setDate(nextTime.getDate() + 1);
				}
			}

			return nextTime;
		} else if (repeatMode === "weekly") {
			// Weekly mode
			const { time, dayOfWeek } = config;
			const [hours, minutes] = time.split(":").map(Number);
			const targetWeekday = dayOfWeek; // Required, single select
			const nextTime = new Date(now);
			nextTime.setHours(hours, minutes, 0, 0);

			const currentWeekday = nextTime.getDay() === 0 ? 7 : nextTime.getDay();
			let daysToAdd = targetWeekday - currentWeekday;

			// If it's the same day but time has passed, or target date is before this week
			if (daysToAdd < 0 || (daysToAdd === 0 && nextTime <= now)) {
				daysToAdd += 7;
			}

			nextTime.setDate(nextTime.getDate() + daysToAdd);
			return nextTime;
		} else if (repeatMode === "monthly") {
			// Monthly mode
			const { time, dayOfMonth } = config;
			const [hours, minutes] = time.split(":").map(Number);
			const nextTime = new Date(now);
			nextTime.setHours(hours, minutes, 0, 0);

			let targetDay: number;
			if (typeof dayOfMonth === "number") {
				targetDay = dayOfMonth;
			} else if (dayOfMonth === "first") {
				targetDay = 1;
			} else {
				// "last" - last day
				targetDay = new Date(
					nextTime.getFullYear(),
					nextTime.getMonth() + 1,
					0,
				).getDate();
			}

			nextTime.setDate(targetDay);

			// If the date of this month has passed, move to next month
			if (nextTime <= now) {
				nextTime.setMonth(nextTime.getMonth() + 1);
				if (dayOfMonth === "last") {
					// Recalculate the last day of next month
					targetDay = new Date(
						nextTime.getFullYear(),
						nextTime.getMonth() + 1,
						0,
					).getDate();
				}
				nextTime.setDate(targetDay);
			}

			// Handle case when the month has insufficient days (e.g., February doesn't have day 30)
			if (typeof dayOfMonth === "number" && dayOfMonth > 28) {
				const daysInMonth = new Date(
					nextTime.getFullYear(),
					nextTime.getMonth() + 1,
					0,
				).getDate();
				if (dayOfMonth > daysInMonth) {
					// Handle according to fallback strategy
					if (config.monthlyFallback === "skip") {
						// Skip this month, move to next month
						nextTime.setMonth(nextTime.getMonth() + 1);
						// Recursively check next month
						return calculateNextExecutionTime(config);
					} else {
						// Default or "last-day": use the last day of the month
						nextTime.setDate(daysInMonth);
					}
				}
			}

			return nextTime;
		}
	}

	return now;
};

/**
 * Generate Cron expression
 * Cron format: minute hour day month weekday
 * @param config - Timer configuration
 * @returns Cron expression string
 */
export const generateCronExpression = (config: TimerTrigger): string => {
	if (config.mode === "interval") {
		// Fixed interval mode
		const { interval, unit } = config;

		switch (unit) {
			case "second":
				// Cron doesn't support second-level, convert to execute every minute (approximate)
				// Should actually be handled by backend with other scheduling methods
				return `*/${Math.ceil(interval / 60)} * * * *`;

			case "minute":
				if (interval === 1) {
					return "* * * * *"; // Every minute
				}
				return `*/${interval} * * * *`; // Every N minutes

			case "hour":
				return `0 */${interval} * * *`; // Minute 0 of every N hours

			case "day":
				return `0 0 */${interval} * *`; // 00:00 of every N days

			default:
				return "0 0 * * *"; // Default: every day at 00:00
		}
	} else {
		// Scheduled execution mode
		const { repeatMode } = config;

		if (repeatMode === "hourly") {
			// Hourly/every n hours mode
			const { hourlyInterval, minuteOfHour } = config;
			if (hourlyInterval === 1) {
				return `${minuteOfHour} * * * *`; // Minute X of every hour
			}
			return `${minuteOfHour} */${hourlyInterval} * * *`; // Minute X of every N hours
		} else if (repeatMode === "daily") {
			// Daily mode
			const { time, daysOfWeek: customWeekdays } = config;
			const [hours, minutes] = time.split(":").map(Number);

			if (customWeekdays && customWeekdays.length > 0) {
				// With weekday filter
				// In Cron: 0=Sunday, 1=Monday, ..., 6=Saturday
				// Our data: 1=Monday, 2=Tuesday, ..., 7=Sunday
				const cronWeekdays = customWeekdays
					.map((day) => (day === 7 ? 0 : day))
					.sort()
					.join(",");
				return `${minutes} ${hours} * * ${cronWeekdays}`;
			}
			return `${minutes} ${hours} * * *`; // Daily
		} else if (repeatMode === "weekly") {
			// Weekly mode
			const { time, dayOfWeek } = config;
			const [hours, minutes] = time.split(":").map(Number);
			const weekday = dayOfWeek; // Required, single select
			const cronWeekday = weekday === 7 ? 0 : weekday;
			return `${minutes} ${hours} * * ${cronWeekday}`;
		} else if (repeatMode === "monthly") {
			// Monthly mode
			const { time, dayOfMonth } = config;
			const [hours, minutes] = time.split(":").map(Number);

			if (typeof dayOfMonth === "number") {
				// Specific date - generate standard cron expression
				// Backend uses monthlyFallback field to decide how to handle insufficient days
				return `${minutes} ${hours} ${dayOfMonth} * *`;
			} else if (dayOfMonth === "first") {
				// First day
				return `${minutes} ${hours} 1 * *`;
			} else if (dayOfMonth === "last") {
				// Last day - some cron implementations support L, but it's not standard syntax
				// Backend can parse this special marker or handle it in other ways (e.g., using 28-31 range)
				return `${minutes} ${hours} L * *`;
			}

			return `${minutes} ${hours} 1 * *`; // Default: first day
		}
	}

	return "0 0 * * *"; // Default: every day at 00:00
};
