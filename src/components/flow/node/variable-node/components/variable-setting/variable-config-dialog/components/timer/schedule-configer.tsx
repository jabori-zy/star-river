import { AlertCircle } from "lucide-react";
import { formatDate } from "@/components/flow/node/node-utils";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	createDefaultScheduledConfig,
	type DayOfMonth,
	type MonthlyFallbackStrategy,
	type ScheduledTimerConfig,
} from "@/types/node/variable-node";
import { calculateNextExecutionTime, generateCronExpression } from "./utils";
import { useTranslation } from "react-i18next";

// 星期选项定义（翻译键）
const WEEKDAY_I18N_KEYS = [
	{ value: 1, key: "weekdayAbbr.monday" },
	{ value: 2, key: "weekdayAbbr.tuesday" },
	{ value: 3, key: "weekdayAbbr.wednesday" },
	{ value: 4, key: "weekdayAbbr.thursday" },
	{ value: 5, key: "weekdayAbbr.friday" },
	{ value: 6, key: "weekdayAbbr.saturday" },
	{ value: 7, key: "weekdayAbbr.sunday" },
] as const;

interface ScheduleConfigerProps {
	config: ScheduledTimerConfig;
	onChange: (config: ScheduledTimerConfig) => void;
}

const ScheduleConfiger: React.FC<ScheduleConfigerProps> = ({
	config,
	onChange,
}) => {
	const { t } = useTranslation();
	// 包装 onChange，自动生成 cron 表达式
	const handleConfigChange = (newConfig: ScheduledTimerConfig) => {
		const configWithCron = {
			...newConfig,
			cronExpression: generateCronExpression(newConfig),
		};
		onChange(configWithCron);
	};

	return (
		<>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<SelectInDialog
						value={config.repeatMode}
						onValueChange={(value) => {
							const newMode = value as "hourly" | "daily" | "weekly" | "monthly";
							// 使用工厂函数创建默认配置
							const newConfig = createDefaultScheduledConfig(newMode);
							handleConfigChange(newConfig);
						}}
						placeholder="重复规则"
						options={[
							{ value: "hourly", label: t("variableNode.timerConfig.hourly") },
							{ value: "daily", label: t("variableNode.timerConfig.daily") },
							{ value: "weekly", label: t("variableNode.timerConfig.weekly") },
							{ value: "monthly", label: t("variableNode.timerConfig.monthly") },
						]}
						className="h-8 w-auto min-w-20"
					/>

					{/* 每小时模式显示间隔和分钟 */}
					{config.repeatMode === "hourly" ? (
						<>
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								{t("variableNode.timerConfig.every")}
							</span>
							<SelectInDialog
								value={String(config.hourlyInterval)}
								onValueChange={(interval) => {
									handleConfigChange({
										...config,
										hourlyInterval: Number.parseInt(interval),
									});
								}}
								placeholder="间隔"
								options={Array.from({ length: 24 }, (_, i) => ({
									value: String(i + 1),
									label: String(i + 1),
								}))}
								className="h-8 w-16"
							/>
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								{t("variableNode.timerConfig.hoursAt")}
							</span>
							<SelectInDialog
								value={String(config.minuteOfHour).padStart(2, "0")}
								onValueChange={(minute) => {
									handleConfigChange({
										...config,
										minuteOfHour: Number.parseInt(minute),
									});
								}}
								placeholder="分"
								options={Array.from({ length: 60 }, (_, i) => ({
									value: String(i).padStart(2, "0"),
									label: String(i).padStart(2, "0"),
								}))}
								className="h-8 w-16"
							/>
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								{t("variableNode.timerConfig.minutes")}
							</span>
						</>
					) : (
						<>
							<SelectInDialog
								value={config.time.split(":")[0]}
								onValueChange={(hour) => {
									const minute = config.time.split(":")[1] || "00";
									handleConfigChange({
										...config,
										time: `${hour}:${minute}`,
									});
								}}
								placeholder="时"
								options={Array.from({ length: 24 }, (_, i) => ({
									value: String(i).padStart(2, "0"),
									label: String(i).padStart(2, "0"),
								}))}
								className="h-8 w-16"
							/>
							<span className="text-sm text-muted-foreground">:</span>
							<SelectInDialog
								value={config.time.split(":")[1]}
								onValueChange={(minute) => {
									const hour = config.time.split(":")[0] || "00";
									handleConfigChange({
										...config,
										time: `${hour}:${minute}`,
									});
								}}
								placeholder="分"
								options={Array.from({ length: 60 }, (_, i) => ({
									value: String(i).padStart(2, "0"),
									label: String(i).padStart(2, "0"),
								}))}
								className="h-8 w-16"
							/>
						</>
					)}

					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{t("variableNode.timerConfig.execute")}
					</span>
				</div>
			</div>

			{/* 月份日期选择 - 使用 RadioGroup */}
			{config.repeatMode === "monthly" && (
				<RadioGroup
					value={
						typeof config.dayOfMonth === "number"
							? "custom"
							: config.dayOfMonth || "first"
					}
					onValueChange={(value) => {
						let dayValue: DayOfMonth;
						let fallbackStrategy: MonthlyFallbackStrategy | undefined;

						if (value === "first") {
							// "第一天" 使用字符串 "first"
							dayValue = "first";
							fallbackStrategy = undefined;
						} else if (value === "last") {
							// "最后一天" 使用特殊字符串 "last"
							dayValue = "last";
							fallbackStrategy = undefined;
						} else if (value === "custom") {
							// 保持当前数字值或默认为1
							dayValue =
								typeof config.dayOfMonth === "number" ? config.dayOfMonth : 1;
							// 如果是29/30/31，保留或设置回退策略
							if (typeof dayValue === "number" && dayValue >= 29) {
								fallbackStrategy = config.monthlyFallback || "last-day";
							}
						} else {
							// 兜底逻辑
							dayValue = value as DayOfMonth;
							fallbackStrategy = undefined;
						}

						handleConfigChange({
							...config,
							dayOfMonth: dayValue,
							monthlyFallback: fallbackStrategy,
						});
					}}
					className="space-y-2"
				>
					{/* 第 n 天（自定义日期） */}
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="custom" id="day-custom" />
							<Label
								htmlFor="day-custom"
								className="cursor-pointer font-normal flex items-center gap-2"
							>
								{t("variableNode.timerConfig.at")}
								<SelectInDialog
									value={
										typeof config.dayOfMonth === "number"
											? String(config.dayOfMonth)
											: "1"
									}
									onValueChange={(value) => {
										const dayValue = parseInt(value);
										handleConfigChange({
											...config,
											dayOfMonth: dayValue,
											// 当选择29/30/31时，如果没有设置回退策略，默认为 last-day
											monthlyFallback:
												dayValue >= 29
													? config.monthlyFallback || "last-day"
													: undefined,
										});
									}}
									options={Array.from({ length: 31 }, (_, i) => ({
										value: String(i + 1),
										label: String(i + 1),
									}))}
									className="h-8 w-16"
								/>
								{t("variableNode.timerConfig.day")}
							</Label>
						</div>

						{/* 策略选择 - 当选择29/30/31天时，紧跟在第n天下方 */}
						{typeof config.dayOfMonth === "number" &&
							config.dayOfMonth >= 29 && (
								<div className="ml-8 space-y-1.5 rounded-md border border-orange-200 bg-orange-50 p-2">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-3.5 w-3.5 text-orange-600" />
										<span className="text-xs font-medium text-orange-800">
											当该月没有第 {config.dayOfMonth} 天时：
										</span>
									</div>
									<div className="space-y-1 ml-5">
										<div className="flex items-center space-x-2">
											<input
												type="radio"
												id="fallback-last-day-inline"
												checked={
													config.monthlyFallback === "last-day" ||
													!config.monthlyFallback
												}
												onChange={() => {
													handleConfigChange({
														...config,
														monthlyFallback: "last-day",
													});
												}}
												className="h-3.5 w-3.5 cursor-pointer"
											/>
											<label
												htmlFor="fallback-last-day-inline"
												className="cursor-pointer text-xs text-orange-800"
											>
												在该月最后一天执行
											</label>
										</div>
										<div className="flex items-center space-x-2">
											<input
												type="radio"
												id="fallback-skip-inline"
												checked={config.monthlyFallback === "skip"}
												onChange={() => {
													handleConfigChange({
														...config,
														monthlyFallback: "skip",
													});
												}}
												className="h-3.5 w-3.5 cursor-pointer"
											/>
											<label
												htmlFor="fallback-skip-inline"
												className="cursor-pointer text-xs text-orange-800"
											>
												跳过该月
											</label>
										</div>
									</div>
								</div>
							)}
					</div>

					{/* 特殊选项 */}
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="first" id="day-first" />
						<Label htmlFor="day-first" className="cursor-pointer font-normal">
							{t("variableNode.timerConfig.firstDay")}
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="last" id="day-last" />
						<Label htmlFor="day-last" className="cursor-pointer font-normal">
							{t("variableNode.timerConfig.lastDay")}
						</Label>
					</div>
				</RadioGroup>
			)}

			{/* 星期选择 - 常驻显示 */}
			{config.repeatMode === "weekly" && (
				<div className="flex items-center gap-2 flex-wrap">
					{WEEKDAY_I18N_KEYS.map((day) => {
						const isSelected = config.dayOfWeek === day.value;
						const label = t(day.key);

						return (
							<Badge
								key={day.value}
								variant={isSelected ? "default" : "outline"}
								className={`cursor-pointer select-none ${
									isSelected
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted"
								}`}
								onClick={() => {
									// 每周模式：单选
									handleConfigChange({
										...config,
										dayOfWeek: day.value,
									});
								}}
							>
								{isSelected ? "☑" : "☐"} {label}
							</Badge>
						);
					})}
				</div>
			)}

			{/* 每天模式的星期选择 - 多选 */}
			{config.repeatMode === "daily" && (
				<div className="flex items-center gap-2 flex-wrap">
					{WEEKDAY_I18N_KEYS.map((day) => {
						const isSelected = config.daysOfWeek?.includes(day.value);
						const label = t(day.key);

						return (
							<Badge
								key={day.value}
								variant={isSelected ? "default" : "outline"}
								className={`cursor-pointer select-none ${
									isSelected
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted"
								}`}
								onClick={() => {
									// 每天模式：多选
									const currentWeekdays = config.daysOfWeek || [];
									let newWeekdays: number[];

									if (isSelected) {
										newWeekdays = currentWeekdays.filter(
											(d) => d !== day.value,
										);
									} else {
										newWeekdays = [...currentWeekdays, day.value].sort(
											(a, b) => a - b,
										);
									}

									// 确保至少有一个选中
									if (newWeekdays.length > 0) {
										handleConfigChange({
											...config,
											daysOfWeek: newWeekdays,
										});
									}
								}}
							>
								{isSelected ? "☑" : "☐"} {label}
							</Badge>
						);
					})}
				</div>
			)}

			{/* 下次执行时间预览 */}
			<div className="text-xs text-muted-foreground">
				{t("variableNode.timerConfig.nextExecutionTime")}: {formatDate(calculateNextExecutionTime(config))}
			</div>
		</>
	);
};

export default ScheduleConfiger;
