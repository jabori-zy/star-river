import type { NodeType } from "@/types/node";
import type {
	ConditionTrigger,
	TimerTrigger,
} from "@/types/node/variable-node";
import { getNodeTypeLabel } from "../../node-utils";

/**
 * Trigger condition prefix generation utility functions
 */

/**
 * Generate variable name highlight element
 */
export const generateVariableHighlight = (name?: string): React.ReactNode => {
	if (!name) return null;
	return <span className="text-orange-600 font-medium">{name}</span>;
};

/**
 * Generate value highlight element
 */
export const generateValueHighlight = (value: string): React.ReactNode => {
	return <span className="text-blue-600 font-medium">{value}</span>;
};

/**
 * Generate trading pair symbol highlight element
 */
export const generateSymbolHighlight = (symbol?: string): React.ReactNode => {
	if (!symbol) return null;
	return <span className="text-indigo-600 font-medium">{symbol}</span>;
};

/**
 * Get trigger label from TriggerCase
 * @param triggerCase Trigger configuration
 * @returns Trigger label (e.g. "Case 1" or "Else")
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
 * Generate timer trigger interval prefix text
 * @param timerConfig Timer configuration
 * @returns Interval text, e.g. "Every 5 minutes," or null
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
 * Generate scheduled execution mode prefix text
 * @param timerConfig Timer configuration
 * @returns Scheduled execution text, e.g. "At minute 30 of every hour," or null
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
		// Hourly: At minute {} of every {} hour(s),
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
		// Daily: Every day {}:{} (Mon, Tue...)
		const { time, daysOfWeek } = timerConfig;
		const weekdayMap: Record<number, string> = {
			1: t("common.weekdayAbbr.monday"),
			2: t("common.weekdayAbbr.tuesday"),
			3: t("common.weekdayAbbr.wednesday"),
			4: t("common.weekdayAbbr.thursday"),
			5: t("common.weekdayAbbr.friday"),
			6: t("common.weekdayAbbr.saturday"),
			7: t("common.weekdayAbbr.sunday"),
		};

		let prefix = t("variableNode.hint.scheduleDaily", { time: time });

		// If specific weekdays are selected, add weekday information
		if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
			const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join("、");
			prefix += ` (${weekdayNames})`;
		}

		return `${prefix}，`;
	}

	if (repeatMode === "weekly") {
		// Weekly: Every {Wednesday} {}:{}
		const { time, dayOfWeek } = timerConfig;
		const weekdayMap: Record<number, string> = {
			1: t("common.weekday.monday"),
			2: t("common.weekday.tuesday"),
			3: t("common.weekday.wednesday"),
			4: t("common.weekday.thursday"),
			5: t("common.weekday.friday"),
			6: t("common.weekday.saturday"),
			7: t("common.weekday.sunday"),
		};
		const weekdayName = weekdayMap[dayOfWeek] || "";
		return t("variableNode.hint.scheduleWeekly", {
			weekday: weekdayName,
			time: time,
		});
	}

	if (repeatMode === "monthly") {
		// Monthly: Day {} of every month at {}:{}, last day of every month
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
 * Generate trigger condition prefix
 * Supports both condition trigger and timer trigger modes (interval and scheduled)
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
	// Timer trigger mode: prioritize checking scheduled mode
	if (timerTrigger?.mode === "scheduled") {
		const schedulePrefix = generateSchedulePrefix(timerTrigger, t);
		if (schedulePrefix) {
			return schedulePrefix;
		}
	}

	// Timer trigger mode: check interval mode
	const timerPrefix = generateTimerIntervalPrefix(t, timerTrigger);
	if (timerPrefix) {
		return timerPrefix;
	}

	// Condition trigger mode: generate condition branch prefix
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
			{t("variableNode.hint.isTrue")}
			{", "}
		</>
	);
};

/**
 * Generate full path display for dataflow trigger
 * @param fromNodeName Source node name
 * @param fromNodeType Source node type
 * @param fromVarConfigId Source variable configuration ID
 * @param fromVarDisplayName Source variable display name
 * @param t Translation function
 * @returns Full path string, e.g. "NodeName/VariableNode1/VariableDisplayName"
 */
export const generateDataflowPath = (
	fromNodeName: string,
	fromNodeType: NodeType,
	fromVarConfigId: number,
	fromVarDisplayName: string,
	t: (key: string, options?: { [key: string]: string }) => string,
): string => {
	// Get node type label
	const nodeTypeLabel = getNodeTypeLabel(fromNodeType, t);

	// Build full path: NodeName/NodeTypeConfigID/VariableDisplayName
	return `${fromNodeName}/${nodeTypeLabel}${fromVarConfigId}/${fromVarDisplayName}`;
};
