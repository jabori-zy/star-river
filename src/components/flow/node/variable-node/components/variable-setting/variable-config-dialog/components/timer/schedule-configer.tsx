import { AlertCircle } from "lucide-react";
import { formatDate } from "@/components/flow/node/node-utils";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
	DayOfMonth,
	MonthlyFallbackStrategy,
	ScheduledTimerConfig,
} from "@/types/node/variable-node";
import { calculateNextExecutionTime, generateCronExpression } from "./utils";

interface ScheduleConfigerProps {
	config: ScheduledTimerConfig;
	onChange: (config: ScheduledTimerConfig) => void;
}

const ScheduleConfiger: React.FC<ScheduleConfigerProps> = ({
	config,
	onChange,
}) => {
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
			<div className="flex items-center gap-2">
				<SelectInDialog
					value={config.repeatMode}
					onValueChange={(value) => {
						const newMode = value as "hourly" | "daily" | "weekly" | "monthly";
						let newWeekdays: number[] | undefined;
						let newTime = config.time;
						let newDayOfMonth: DayOfMonth | undefined;

						if (newMode === "hourly") {
							// 每小时：只保留分钟部分
							newWeekdays = undefined;
							newDayOfMonth = undefined;
							const minute = config.time.split(":")[1] || "00";
							newTime = `00:${minute}`;
							// 确保有默认的小时间隔
							if (!config.hourlyInterval) {
								handleConfigChange({
									...config,
									repeatMode: newMode,
									customWeekdays: newWeekdays,
									dayOfMonth: newDayOfMonth,
									time: newTime,
									hourlyInterval: 1,
								});
								return;
							}
						} else if (newMode === "monthly") {
							// 每月不需要星期设置，但需要日期设置
							newWeekdays = undefined;
							newDayOfMonth = config.dayOfMonth || 1;
						} else if (newMode === "daily") {
							// 每天模式：默认全选
							newWeekdays = [1, 2, 3, 4, 5, 6, 7];
							newDayOfMonth = undefined;
							// 确保有完整的时间格式
							if (config.time.split(":")[0] === "00") {
								newTime = "09:30";
							}
						} else if (newMode === "weekly") {
							// 每周模式：默认选周一（单选）
							newWeekdays = [1];
							newDayOfMonth = undefined;
							// 确保有完整的时间格式
							if (config.time.split(":")[0] === "00") {
								newTime = "09:30";
							}
						}

						handleConfigChange({
							...config,
							repeatMode: newMode,
							customWeekdays: newWeekdays,
							dayOfMonth: newDayOfMonth,
							time: newTime,
						});
					}}
					placeholder="重复规则"
					options={[
						{ value: "hourly", label: "小时" },
						{ value: "daily", label: "每天" },
						{ value: "weekly", label: "每周" },
						{ value: "monthly", label: "每月" },
					]}
					className="h-8 w-20"
				/>

				<div className="flex items-center gap-2">
					{/* 每小时模式显示间隔和分钟 */}
					{config.repeatMode === "hourly" ? (
						<>
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								每隔
							</span>
							<SelectInDialog
								value={String(config.hourlyInterval || 1)}
								onValueChange={(interval) => {
									handleConfigChange({
										...config,
										hourlyInterval: parseInt(interval),
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
								小时的第
							</span>
							<SelectInDialog
								value={config.time.split(":")[1]}
								onValueChange={(minute) => {
									handleConfigChange({
										...config,
										time: `00:${minute}`,
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
								分钟
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
				</div>

				<span className="text-sm text-muted-foreground whitespace-nowrap">
					执行
				</span>
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

						if (value === "custom") {
							// 保持当前数字值或默认为1
							dayValue =
								typeof config.dayOfMonth === "number" ? config.dayOfMonth : 1;
							// 如果是29/30/31，保留或设置回退策略
							if (typeof dayValue === "number" && dayValue >= 29) {
								fallbackStrategy = config.monthlyFallback || "last-day";
							}
						} else {
							// 选择特殊日期时，清除回退策略
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
								第
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
								天
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
							第一天
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="last" id="day-last" />
						<Label htmlFor="day-last" className="cursor-pointer font-normal">
							最后一天
						</Label>
					</div>
				</RadioGroup>
			)}

			{/* 星期选择 - 常驻显示 */}
			{(config.repeatMode === "daily" || config.repeatMode === "weekly") && (
				<div className="flex items-center gap-2 flex-wrap">
					{[
						{ value: 1, label: "一" },
						{ value: 2, label: "二" },
						{ value: 3, label: "三" },
						{ value: 4, label: "四" },
						{ value: 5, label: "五" },
						{ value: 6, label: "六" },
						{ value: 7, label: "日" },
					].map((day) => {
						const isSelected = config.customWeekdays?.includes(day.value);
						const isWeeklyMode = config.repeatMode === "weekly";

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
									const currentWeekdays = config.customWeekdays || [];
									let newWeekdays: number[];

									if (isWeeklyMode) {
										// 每周模式：单选
										newWeekdays = [day.value];
									} else {
										// 每天模式：多选
										if (isSelected) {
											newWeekdays = currentWeekdays.filter(
												(d) => d !== day.value,
											);
										} else {
											newWeekdays = [...currentWeekdays, day.value].sort(
												(a, b) => a - b,
											);
										}
									}

									handleConfigChange({
										...config,
										customWeekdays:
											newWeekdays.length > 0 ? newWeekdays : undefined,
									});
								}}
							>
								{isSelected ? "☑" : "☐"} 周{day.label}
							</Badge>
						);
					})}
				</div>
			)}

			{/* 下次执行时间预览 */}
			<div className="text-xs text-muted-foreground">
				下次执行时间: {formatDate(calculateNextExecutionTime(config))}
			</div>
		</>
	);
};

export default ScheduleConfiger;
