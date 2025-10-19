import type {
	ConditionTrigger,
	TimerTrigger,
} from "@/types/node/variable-node";
import { getNodeTypeLabel } from "../../node-utils";
import type { NodeType } from "@/types/node";

/**
 * 触发条件前缀生成工具函数
 */

/**
 * 生成变量名高亮元素
 */
export const generateVariableHighlight = (name?: string): React.ReactNode => {
	if (!name) return null;
	return <span className="text-orange-600 font-medium">{name}</span>;
};

/**
 * 生成值高亮元素
 */
export const generateValueHighlight = (value: string): React.ReactNode => {
	return <span className="text-blue-600 font-medium">{value}</span>;
};

/**
 * 生成交易对符号高亮元素
 */
export const generateSymbolHighlight = (symbol?: string): React.ReactNode => {
	if (!symbol) return null;
	return <span className="text-indigo-600 font-medium">{symbol}</span>;
};

/**
 * 从 TriggerCase 获取触发标签
 * @param triggerCase 触发配置
 * @returns 触发标签（如 "Case 1" 或 "Else"）
 */
export const getTriggerCaseLabel = (
	triggerCase: ConditionTrigger | null,
): string | null => {
	if (!triggerCase) return null;

	if (triggerCase.triggerType === "case") {
		return `Case ${triggerCase.caseId}`;
	}
	return "Else";
};

/**
 * 生成定时触发的时间间隔前缀文案
 * @param timerConfig 定时配置
 * @returns 时间间隔文案，如 "每5分钟，" 或 null
 */
export const generateTimerIntervalPrefix = (
	t: (key: string, options?: { [key: string]: string }) => string,
	timerConfig?: TimerTrigger,
): string | null => {
	if (!timerConfig || timerConfig?.mode !== "interval") {
		return null;
	}

	const { interval, unit } = timerConfig;
	switch (unit) {
		case "second":
			return t("variableNode.hint.intervalSecond", {
				interval: interval.toString(),
			});
		case "minute":
			return t("variableNode.hint.intervalMinute", {
				interval: interval.toString(),
			});
		case "hour":
			return t("variableNode.hint.intervalHour", {
				interval: interval.toString(),
			});
		case "day":
			return t("variableNode.hint.intervalDay", {
				interval: interval.toString(),
			});
	}
};

/**
 * 生成定时执行模式的前缀文案
 * @param timerConfig 定时配置
 * @returns 定时执行文案，如 "每小时的第30分钟，" 或 null
 */
export const generateSchedulePrefix = (
	timerConfig: TimerTrigger,
	t: (key: string, options?: { [key: string]: string }) => string,
): string | null => {
	if (!timerConfig || timerConfig.mode !== "scheduled") {
		return null;
	}

	const { repeatMode } = timerConfig;

	if (repeatMode === "hourly") {
		// 每小时: 每{}小时的第{}分钟，
		const { hourlyInterval, minuteOfHour } = timerConfig;
		if (hourlyInterval === 1) {
			return t("variableNode.hint.scheduleHourlyOne", {
				minute: minuteOfHour.toString(),
			});
		}
		return t("variableNode.hint.scheduleHourly", {
			hourlyInterval: hourlyInterval.toString(),
			minute: minuteOfHour.toString(),
		});
	}

	if (repeatMode === "daily") {
		// 每天: 每天 {}:{} (周一，周二...)
		const { time, daysOfWeek } = timerConfig;
		const weekdayMap: Record<number, string> = {
			1: t("weekdayAbbr.monday"),
			2: t("weekdayAbbr.tuesday"),
			3: t("weekdayAbbr.wednesday"),
			4: t("weekdayAbbr.thursday"),
			5: t("weekdayAbbr.friday"),
			6: t("weekdayAbbr.saturday"),
			7: t("weekdayAbbr.sunday"),
		};

		let prefix = t("variableNode.hint.scheduleDaily", { time: time });

		// 如果选择了特定的星期，添加星期信息
		if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
			const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join("、");
			prefix += ` (${weekdayNames})`;
		}

		return `${prefix}，`;
	}

	if (repeatMode === "weekly") {
		// 每周: 每周{三} {}:{}
		const { time, dayOfWeek } = timerConfig;
		const weekdayMap: Record<number, string> = {
			1: t("weekday.monday"),
			2: t("weekday.tuesday"),
			3: t("weekday.wednesday"),
			4: t("weekday.thursday"),
			5: t("weekday.friday"),
			6: t("weekday.saturday"),
			7: t("weekday.sunday"),
		};
		const weekdayName = weekdayMap[dayOfWeek] || "";
		return t("variableNode.hint.scheduleWeekly", {
			weekday: weekdayName,
			time: time,
		});
	}

	if (repeatMode === "monthly") {
		// 每月: 每月第{}天的{}:{}，每个月的最后一天
		const { time, dayOfMonth } = timerConfig;

		if (typeof dayOfMonth === "number") {
			return t("variableNode.hint.scheduleMonthly", {
				dayOfMonth: dayOfMonth.toString(),
				time: time,
			});
		}

		if (dayOfMonth === "first") {
			return t("variableNode.hint.scheduleMonthlyFirst", { time: time });
		}

		if (dayOfMonth === "last") {
			return t("variableNode.hint.scheduleMonthlyLast", { time: time });
		}
	}

	return null;
};

/**
 * 生成触发条件前缀
 * 支持条件触发和定时触发两种模式（interval 和 scheduled）
 */
export const generateTriggerPrefix = ({
	conditionTrigger,
	timerTrigger,
	t,
}: {
	conditionTrigger?: ConditionTrigger | null;
	timerTrigger?: TimerTrigger;
	t: (key: string, options?: { [key: string]: string }) => string;
}): React.ReactNode | null => {
	// 定时触发模式：优先检查 scheduled 模式
	if (timerTrigger?.mode === "scheduled") {
		const schedulePrefix = generateSchedulePrefix(timerTrigger, t);
		if (schedulePrefix) {
			return schedulePrefix;
		}
	}

	// 定时触发模式：检查 interval 模式
	const timerPrefix = generateTimerIntervalPrefix(t, timerTrigger);
	if (timerPrefix) {
		return timerPrefix;
	}

	// 条件触发模式：生成条件分支前缀
	if (!conditionTrigger) return null;

	const triggerNodeName = conditionTrigger.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(conditionTrigger);

	if (!triggerNodeName || !triggerCaseLabel) return null;

	return (
		<>
			{t("variableNode.hint.when")}{" "}
			<span className="text-blue-600 font-medium">
				{triggerNodeName}/{triggerCaseLabel}
			</span>{" "}
			{t("variableNode.hint.isTrue")}{", "}
		</>
	);
};

/**
 * 生成数据流触发的完整路径显示
 * @param fromNodeName 来源节点名称
 * @param fromNodeType 来源节点类型
 * @param fromVarConfigId 来源变量配置ID
 * @param fromVarDisplayName 来源变量显示名称
 * @param t 翻译函数
 * @returns 完整路径字符串，如 "节点名称/变量节点1/变量显示名"
 */
export const generateDataflowPath = (
	fromNodeName: string,
	fromNodeType: NodeType | null,
	fromVarConfigId: number,
	fromVarDisplayName: string,
	t: (key: string, options?: { [key: string]: string }) => string,
): string => {
	// 获取节点类型标签
	const nodeTypeLabel = getNodeTypeLabel(fromNodeType, t);

	// 构建完整路径：节点名称/节点类型配置ID/变量显示名称
	return `${fromNodeName}/${nodeTypeLabel}${fromVarConfigId}/${fromVarDisplayName}`;
};
