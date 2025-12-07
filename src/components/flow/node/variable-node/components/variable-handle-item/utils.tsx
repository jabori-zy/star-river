import type {
	DataFlowTrigger,
	TimerTrigger,
	TriggerType,
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import {
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import {
	getSystemVariableMetadata,
	SystemVariableType,
} from "@/types/variable";
import {
	formatUpdateOperationValue,
	generateValueHighlight,
	generateVariableHighlight,
} from "../../variable-node-utils";

// Get variable type label
export const getVariableLabel = (
	variable: string,
	t: (key: string) => string,
): string => {
	// Check if it's a system variable
	if (
		Object.values(SystemVariableType).includes(variable as SystemVariableType)
	) {
		const metadata =
			getSystemVariableMetadata(t)[variable as SystemVariableType];
		return metadata.varDisplayName;
	}
	// For custom variables, directly return the variable name
	return variable;
};

// Get variable trigger type label
export const getVariableTypeLabel = (type: "condition" | "timer"): string => {
	if (type === "condition") {
		return "Condition Trigger";
	} else if (type === "timer") {
		return "Timer Trigger";
	}
	return type;
};

// Format symbol display
export const formatSymbolDisplay = (symbol: string | null): string => {
	return symbol || "All Symbols";
};

// Format timer configuration display
export const getTimerConfigDisplay = (timerConfig: TimerTrigger): string => {
	if (timerConfig.mode === "interval") {
		const unitMap = {
			second: "s",
			minute: "min",
			hour: "h",
			day: "d",
		};
		return `${timerConfig.interval}${unitMap[timerConfig.unit]}`;
	} else {
		// Scheduled mode
		const { repeatMode } = timerConfig;
		let description = "";

		// Hourly mode: display interval
		if (repeatMode === "hourly") {
			const { hourlyInterval, minuteOfHour } = timerConfig;
			description =
				hourlyInterval === 1
					? `Every hour at minute ${minuteOfHour}`
					: `Every ${hourlyInterval} hours at minute ${minuteOfHour}`;
			return description;
		}

		// Other modes
		const repeatMap = {
			daily: "Daily",
			weekly: "Weekly",
			monthly: "Monthly",
		};
		description = repeatMap[repeatMode as "daily" | "weekly" | "monthly"];

		// Weekly mode: add weekday information
		if (repeatMode === "weekly") {
			const { dayOfWeek } = timerConfig;
			const weekdayMap: Record<number, string> = {
				1: "Mon",
				2: "Tue",
				3: "Wed",
				4: "Thu",
				5: "Fri",
				6: "Sat",
				7: "Sun",
			};
			description += ` ${weekdayMap[dayOfWeek] || ""}`;
		}

		// Daily mode: add weekday information (if selected)
		if (repeatMode === "daily") {
			const { daysOfWeek } = timerConfig;
			if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
				const weekdayMap: Record<number, string> = {
					1: "Mon",
					2: "Tue",
					3: "Wed",
					4: "Thu",
					5: "Fri",
					6: "Sat",
					7: "Sun",
				};
				const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join(",");
				description += ` (${weekdayNames})`;
			}
		}

		// Monthly mode: add date information
		if (repeatMode === "monthly") {
			const { dayOfMonth } = timerConfig;
			if (typeof dayOfMonth === "number") {
				description += ` Day ${dayOfMonth}`;
			} else {
				const dayMap: Record<string, string> = {
					first: "First day",
					last: "Last day",
				};
				description += ` ${dayMap[dayOfMonth]}`;
			}
		}

		description += ` ${timerConfig.time}`;
		return description;
	}
};

// Get update operation type display text
export const getUpdateOperationLabel = (
	type: UpdateVarValueOperation,
	t: (key: string) => string,
): string => {
	const labels: Record<UpdateVarValueOperation, string> = {
		set: "=",
		add: "+=",
		subtract: "-=",
		multiply: "*=",
		divide: "/=",
		max: "max",
		min: "min",
		toggle: "Toggle",
		append: "Append",
		remove: "Remove",
		clear: "Clear",
	};
	return labels[type];
};

// Get variable configuration brief description
export const getVariableConfigDescription = (
	config: VariableConfig,
	t: (key: string) => string,
): string => {
	const variableText = getVariableLabel(config.varName, t);
	const effectiveTriggerType = getEffectiveTriggerType(config);
	const timerConfig = getTimerTriggerConfig(config);

	if (config.varOperation === "get") {
		const symbolText = formatSymbolDisplay(
			("symbol" in config ? config.symbol : null) || null,
		);
		const typeText = getVariableTypeLabel(
			effectiveTriggerType === "timer" || effectiveTriggerType === "condition"
				? effectiveTriggerType
				: "condition",
		);

		let description = `${symbolText} - ${variableText} (${typeText})`;
		if (effectiveTriggerType === "timer" && timerConfig) {
			description += ` - ${getTimerConfigDisplay(timerConfig)}`;
		}

		return description;
	} else if (config.varOperation === "update") {
		// Update mode
		const opLabel = getUpdateOperationLabel(config.updateVarValueOperation, t);
		if (config.updateVarValueOperation === "toggle") {
			return `Update Variable - ${variableText} (${opLabel})`;
		}
		return `Update Variable - ${variableText} ${opLabel}`;
	} else {
		// Reset mode
		const typeText = getVariableTypeLabel(
			effectiveTriggerType === "timer" || effectiveTriggerType === "condition"
				? effectiveTriggerType
				: "condition",
		);
		let description = `Reset Variable - ${variableText} (${typeText})`;

		if (effectiveTriggerType === "timer" && timerConfig) {
			description += ` - ${getTimerConfigDisplay(timerConfig)}`;
		}

		return description;
	}
};

// Generate trigger condition text (for node panel display)
export const generateTriggerConditionText = (
	config: VariableConfig,
	t: (key: string) => string,
): string | null => {
	const effectiveTriggerType = getEffectiveTriggerType(config);

	if (effectiveTriggerType === "condition") {
		// Condition trigger mode
		const conditionTrigger =
			config.triggerConfig?.type === "condition"
				? config.triggerConfig.config
				: null;

		if (!conditionTrigger) return null;

		const nodeName = conditionTrigger.fromNodeName;
		const caseLabel =
			conditionTrigger.triggerType === "case"
				? `Case ${conditionTrigger.caseId}`
				: "Else";

		if (!nodeName) return null;

		return `${t("variableNode.triggerCase")}: ${nodeName}/${caseLabel}`;
	}

	if (effectiveTriggerType === "timer") {
		// Timer trigger mode
		const timerConfig = getTimerTriggerConfig(config);
		if (!timerConfig) return null;

		if (timerConfig.mode === "interval") {
			// Fixed interval mode
			const unitMap = {
				second: "s",
				minute: "min",
				hour: "h",
				day: "d",
			};
			return `Fixed Interval: Every ${timerConfig.interval}${unitMap[timerConfig.unit]}`;
		}

		if (timerConfig.mode === "scheduled") {
			// Scheduled execution mode
			const { repeatMode } = timerConfig;

			if (repeatMode === "hourly") {
				const { hourlyInterval, minuteOfHour } = timerConfig;
				if (hourlyInterval === 1) {
					return `Scheduled: At minute ${minuteOfHour} of every hour`;
				}
				return `Scheduled: At minute ${minuteOfHour} of every ${hourlyInterval} hours`;
			}

			if (repeatMode === "daily") {
				const { time, daysOfWeek } = timerConfig;
				let text = `Scheduled: Daily ${time}`;

				if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
					const weekdayMap: Record<number, string> = {
						1: "Mon",
						2: "Tue",
						3: "Wed",
						4: "Thu",
						5: "Fri",
						6: "Sat",
						7: "Sun",
					};
					const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join(", ");
					text += ` (${weekdayNames})`;
				}

				return text;
			}

			if (repeatMode === "weekly") {
				const { time, dayOfWeek } = timerConfig;
				const weekdayMap: Record<number, string> = {
					1: "Mon",
					2: "Tue",
					3: "Wed",
					4: "Thu",
					5: "Fri",
					6: "Sat",
					7: "Sun",
				};
				return `Scheduled: Weekly ${weekdayMap[dayOfWeek]} ${time}`;
			}

			if (repeatMode === "monthly") {
				const { time, dayOfMonth } = timerConfig;

				if (typeof dayOfMonth === "number") {
					return `Scheduled: Day ${dayOfMonth} of every month ${time}`;
				}

				if (dayOfMonth === "first") {
					return `Scheduled: First day of every month ${time}`;
				}

				if (dayOfMonth === "last") {
					return `Scheduled: Last day of every month ${time}`;
				}
			}
		}
	}

	if (effectiveTriggerType === "dataflow") {
		// Dataflow trigger mode
		const dataflowConfig =
			config.triggerConfig?.type === "dataflow"
				? config.triggerConfig.config
				: null;

		if (!dataflowConfig) return null;

		const fromNodeName = dataflowConfig.fromNodeName;
		const fromNodeType = dataflowConfig.fromNodeType;
		const fromVarConfigId = dataflowConfig.fromVarConfigId;
		const fromVarDisplayName =
			dataflowConfig.fromVarDisplayName || dataflowConfig.fromVar;

		if (!fromNodeName || !fromVarDisplayName) return null;

		// Get node type label
		const nodeTypeLabels: Record<string, string> = {
			indicatorNode: "Indicator",
			klineNode: "Kline",
			variableNode: "Variable",
			ifElseNode: "Condition",
			startNode: "Start",
			futuresOrderNode: "Futures Order",
			PositionNode: "Position",
		};
		const nodeTypeLabel = nodeTypeLabels[fromNodeType] || "Node";

		// Build complete path: node name/node type config ID/variable display name
		return `Dataflow: ${fromNodeName}/${nodeTypeLabel}${fromVarConfigId}/${fromVarDisplayName}`;
	}

	return null;
};

/**
 * Generate update operation text (for node card display)
 * Supports special display in dataflow mode
 * Returns React.ReactNode to support styled variable names
 */
export const generateUpdateOperationNodeText = (
	varDisplayName: string,
	operationType: UpdateVarValueOperation,
	operationValue: string | number | boolean | string[] | null,
	triggerType: TriggerType,
	t: (key: string) => string,
	dataflowTrigger?: DataFlowTrigger | null,
): React.ReactNode => {
	// Special handling in dataflow mode
	if (triggerType === "dataflow" && dataflowTrigger) {
		// max/min operations
		if (operationType === "max" || operationType === "min") {
			const operationTypeLabel = operationType === "max" ? "max" : "min";
			return (
				<>
					Take {operationTypeLabel} of {generateVariableHighlight(varDisplayName)} and{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		// Add/subtract/multiply/divide operations, display operator format
		if (operationType === "add") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} +{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		if (operationType === "subtract") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} -{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		if (operationType === "multiply") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} ×{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		if (operationType === "divide") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} ÷{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		// set operation
		if (operationType === "set") {
			return (
				<>Set to {generateValueHighlight(dataflowTrigger.fromVarDisplayName)}</>
			);
		}
	}

	// For other cases, use standard format
	const operationLabel = getUpdateOperationLabel(operationType, t);
	const formattedValue = formatUpdateOperationValue(
		operationValue,
		operationType,
	);

	// Combine operation label and value, add style to value
	if (operationLabel && formattedValue) {
		return (
			<>
				{operationLabel} {generateValueHighlight(formattedValue)}
			</>
		);
	}

	if (operationLabel) {
		return operationLabel;
	}

	if (formattedValue) {
		return generateValueHighlight(formattedValue);
	}

	return null;
};
