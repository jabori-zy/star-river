import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	createDefaultScheduledConfig,
	type IntervalTimerConfig,
	type ScheduledTimerConfig,
	type TimerTrigger,
} from "@/types/node/variable-node";
import IntervalConfiger from "./interval-configer";
import ScheduleConfiger from "./schedule-configer";

interface TimerConfigComponentProps {
	timerConfig: TimerTrigger;
	onTimerConfigChange: (config: TimerTrigger) => void;
}

const TimerConfigComponent: React.FC<TimerConfigComponentProps> = ({
	timerConfig,
	onTimerConfigChange,
}) => {
	const { t } = useTranslation();
	// Use ref to cache configurations of both modes to avoid data loss when switching
	const intervalConfigCache = React.useRef<IntervalTimerConfig | null>(null);
	const scheduledConfigCache = React.useRef<ScheduledTimerConfig | null>(null);
	const pendingInternalUpdates = React.useRef(0);

	// Sync current mode's configuration to cache in real-time
	React.useEffect(() => {
		const isInternalUpdate = pendingInternalUpdates.current > 0;
		if (isInternalUpdate) {
			pendingInternalUpdates.current -= 1;
		}

		if (timerConfig.mode === "interval") {
			intervalConfigCache.current = timerConfig;
			if (!isInternalUpdate) {
				scheduledConfigCache.current = null;
			}
		} else {
			scheduledConfigCache.current = timerConfig;
			if (!isInternalUpdate) {
				intervalConfigCache.current = null;
			}
		}
	}, [timerConfig]);

	const emitTimerConfigChange = (config: TimerTrigger) => {
		pendingInternalUpdates.current += 1;
		onTimerConfigChange(config);
	};

	const handleIntervalConfigChange = (config: IntervalTimerConfig) => {
		emitTimerConfigChange(config);
	};

	const handleScheduledConfigChange = (config: ScheduledTimerConfig) => {
		emitTimerConfigChange(config);
	};

	const handleModeChange = (mode: "interval" | "scheduled") => {
		if (timerConfig.mode === mode) {
			return;
		}

		// Switch to target mode, prioritize using cached configuration
		if (mode === "interval") {
			emitTimerConfigChange(
				intervalConfigCache.current || {
					mode: "interval",
					interval: 1,
					unit: "minute",
				},
			);
		} else {
			emitTimerConfigChange(
				scheduledConfigCache.current || createDefaultScheduledConfig("daily"),
			);
		}
	};

	return (
		<div className="space-y-3">
			{/* Mode toggle */}
			<RadioGroup
				value={timerConfig.mode}
				onValueChange={(value) =>
					handleModeChange(value as "interval" | "scheduled")
				}
				className="flex items-center gap-6"
			>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="interval" id="mode-interval" />
					<Label
						htmlFor="mode-interval"
						className="cursor-pointer font-normal text-sm"
					>
						{t("variableNode.interval")}
					</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="scheduled" id="mode-scheduled" />
					<Label
						htmlFor="mode-scheduled"
						className="cursor-pointer font-normal text-sm"
					>
						{t("variableNode.schedule")}
					</Label>
				</div>
			</RadioGroup>

			{/* Fixed interval mode UI */}
			{timerConfig.mode === "interval" && (
				<IntervalConfiger
					config={timerConfig}
					onChange={handleIntervalConfigChange}
				/>
			)}

			{/* Scheduled execution mode UI */}
			{timerConfig.mode === "scheduled" && (
				<ScheduleConfiger
					config={timerConfig}
					onChange={handleScheduledConfigChange}
				/>
			)}
		</div>
	);
};

export default TimerConfigComponent;
