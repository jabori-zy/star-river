import type { TimerConfig } from "@/types/node/variable-node";

/**
 * 计算下次执行时间
 */
export const calculateNextExecutionTime = (config: TimerConfig): Date => {
	const now = new Date();

	if (config.mode === "interval") {
		// 固定间隔模式：当前时间 + 间隔
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
		// 定时执行模式
		const { repeatMode, time, hourlyInterval, customWeekdays, dayOfMonth } =
			config;
		const [hours, minutes] = time.split(":").map(Number);

		if (repeatMode === "hourly") {
			// 每小时/每n小时模式
			const interval = hourlyInterval || 1;
			const nextTime = new Date(now);

			// 设置到下一个整点的指定分钟
			nextTime.setMinutes(minutes, 0, 0);

			// 如果当前时间已经过了这个分钟，移到下一个间隔
			if (nextTime <= now) {
				nextTime.setHours(nextTime.getHours() + interval);
			}

			// 确保是间隔的倍数
			const currentHour = nextTime.getHours();
			const targetHour = Math.ceil(currentHour / interval) * interval;
			nextTime.setHours(targetHour);
			nextTime.setMinutes(minutes, 0, 0);

			return nextTime;
		} else if (repeatMode === "daily") {
			// 每天模式
			const nextTime = new Date(now);
			nextTime.setHours(hours, minutes, 0, 0);

			// 如果今天的时间已经过了，移到明天
			if (nextTime <= now) {
				nextTime.setDate(nextTime.getDate() + 1);
			}

			// 检查星期是否匹配
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
			// 每周模式
			const targetWeekday = customWeekdays?.[0] || 1; // 默认周一
			const nextTime = new Date(now);
			nextTime.setHours(hours, minutes, 0, 0);

			const currentWeekday = nextTime.getDay() === 0 ? 7 : nextTime.getDay();
			let daysToAdd = targetWeekday - currentWeekday;

			// 如果是同一天但时间已过，或者目标日期在本周之前
			if (daysToAdd < 0 || (daysToAdd === 0 && nextTime <= now)) {
				daysToAdd += 7;
			}

			nextTime.setDate(nextTime.getDate() + daysToAdd);
			return nextTime;
		} else if (repeatMode === "monthly") {
			// 每月模式
			const nextTime = new Date(now);
			nextTime.setHours(hours, minutes, 0, 0);

			let targetDay: number;
			if (typeof dayOfMonth === "number") {
				targetDay = dayOfMonth;
			} else if (dayOfMonth === "first") {
				targetDay = 1;
			} else {
				// "last" - 最后一天
				targetDay = new Date(
					nextTime.getFullYear(),
					nextTime.getMonth() + 1,
					0,
				).getDate();
			}

			nextTime.setDate(targetDay);

			// 如果本月的日期已经过了，移到下个月
			if (nextTime <= now) {
				nextTime.setMonth(nextTime.getMonth() + 1);
				if (dayOfMonth === "last") {
					// 重新计算下个月的最后一天
					targetDay = new Date(
						nextTime.getFullYear(),
						nextTime.getMonth() + 1,
						0,
					).getDate();
				}
				nextTime.setDate(targetDay);
			}

			// 处理月份天数不足的情况（例如2月没有30日）
			if (typeof dayOfMonth === "number" && dayOfMonth > 28) {
				const daysInMonth = new Date(
					nextTime.getFullYear(),
					nextTime.getMonth() + 1,
					0,
				).getDate();
				if (dayOfMonth > daysInMonth) {
					// 根据回退策略处理
					if (config.monthlyFallback === "skip") {
						// 跳过该月，移到下个月
						nextTime.setMonth(nextTime.getMonth() + 1);
						// 递归检查下个月
						return calculateNextExecutionTime(config);
					} else {
						// 默认或 "last-day": 使用该月最后一天
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
 * 生成 Cron 表达式
 * Cron 格式：分 时 日 月 星期
 * @param config - 定时配置
 * @returns Cron 表达式字符串
 */
export const generateCronExpression = (config: TimerConfig): string => {
	if (config.mode === "interval") {
		// 固定间隔模式
		const { interval, unit } = config;

		switch (unit) {
			case "second":
				// Cron 不支持秒级，转换为每分钟执行（近似）
				// 实际应该由后端用其他调度方式处理
				return `*/${Math.ceil(interval / 60)} * * * *`;

			case "minute":
				if (interval === 1) {
					return "* * * * *"; // 每分钟
				}
				return `*/${interval} * * * *`; // 每N分钟

			case "hour":
				return `0 */${interval} * * *`; // 每N小时的第0分钟

			case "day":
				return `0 0 */${interval} * *`; // 每N天的00:00

			default:
				return "0 0 * * *"; // 默认每天00:00
		}
	} else {
		// 定时执行模式
		const { repeatMode, time, hourlyInterval, customWeekdays, dayOfMonth } =
			config;
		const [hours, minutes] = time.split(":").map(Number);

		if (repeatMode === "hourly") {
			// 每小时/每n小时模式
			const interval = hourlyInterval || 1;
			if (interval === 1) {
				return `${minutes} * * * *`; // 每小时的第X分钟
			}
			return `${minutes} */${interval} * * *`; // 每N小时的第X分钟
		} else if (repeatMode === "daily") {
			// 每天模式
			if (customWeekdays && customWeekdays.length > 0) {
				// 有星期过滤
				// Cron 中：0=周日, 1=周一, ..., 6=周六
				// 我们的数据：1=周一, 2=周二, ..., 7=周日
				const cronWeekdays = customWeekdays
					.map((day) => (day === 7 ? 0 : day))
					.sort()
					.join(",");
				return `${minutes} ${hours} * * ${cronWeekdays}`;
			}
			return `${minutes} ${hours} * * *`; // 每天
		} else if (repeatMode === "weekly") {
			// 每周模式
			const weekday = customWeekdays?.[0] || 1; // 默认周一
			const cronWeekday = weekday === 7 ? 0 : weekday;
			return `${minutes} ${hours} * * ${cronWeekday}`;
		} else if (repeatMode === "monthly") {
			// 每月模式
			if (typeof dayOfMonth === "number") {
				// 具体日期 - 生成标准 cron 表达式
				// 后端通过 monthlyFallback 字段来决定如何处理天数不足的情况
				return `${minutes} ${hours} ${dayOfMonth} * *`;
			} else if (dayOfMonth === "first") {
				// 第一天
				return `${minutes} ${hours} 1 * *`;
			} else if (dayOfMonth === "last") {
				// 最后一天 - 某些 cron 实现支持 L，但不是标准语法
				// 后端可以解析这个特殊标记或使用其他方式处理（如使用 28-31 范围）
				return `${minutes} ${hours} L * *`;
			}

			return `${minutes} ${hours} 1 * *`; // 默认第一天
		}
	}

	return "0 0 * * *"; // 默认每天00:00
};
