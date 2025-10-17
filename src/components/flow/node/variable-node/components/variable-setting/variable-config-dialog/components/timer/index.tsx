import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
	IntervalTimerConfig,
	ScheduledTimerConfig,
	TimerConfig,
} from "@/types/node/variable-node";
import IntervalConfiger from "./interval-configer";
import ScheduleConfiger from "./schedule-configer";

interface TimerConfigComponentProps {
	timerConfig: TimerConfig;
	onTimerConfigChange: (config: TimerConfig) => void;
}

const TimerConfigComponent: React.FC<TimerConfigComponentProps> = ({
	timerConfig,
	onTimerConfigChange,
}) => {
	// 使用 ref 缓存两种模式的配置，避免切换时丢失数据
	const intervalConfigCache = React.useRef<IntervalTimerConfig | null>(null);
	const scheduledConfigCache = React.useRef<ScheduledTimerConfig | null>(null);
	const pendingInternalUpdates = React.useRef(0);

	// 实时同步当前模式的配置到缓存
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

	const emitTimerConfigChange = (config: TimerConfig) => {
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

		// 切换到目标模式，优先使用缓存的配置
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
				scheduledConfigCache.current || {
					mode: "scheduled",
					time: "09:30",
					repeatMode: "daily",
					customWeekdays: [1, 2, 3, 4, 5, 6, 7], // 默认每天都选中
					dayOfMonth: 1, // 默认第1天
				},
			);
		}
	};

	return (
		<div className="space-y-3">
			{/* 模式切换 */}
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
						固定间隔
					</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="scheduled" id="mode-scheduled" />
					<Label
						htmlFor="mode-scheduled"
						className="cursor-pointer font-normal text-sm"
					>
						定时执行
					</Label>
				</div>
			</RadioGroup>

			{/* 固定间隔模式 UI */}
			{timerConfig.mode === "interval" && (
				<IntervalConfiger
					config={timerConfig}
					onChange={handleIntervalConfigChange}
				/>
			)}

			{/* 定时执行模式 UI */}
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
