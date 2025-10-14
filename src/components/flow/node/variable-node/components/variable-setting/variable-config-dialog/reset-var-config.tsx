import { Filter, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import type { CustomVariable } from "@/types/variable";
import TimerConfig from "./timer";

interface ResetVarConfigProps {
	variable: string;
	triggerType: "condition" | "timer";
	timerInterval: number;
	timerUnit: "second" | "minute" | "hour" | "day";
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	onVariableChange: (value: string) => void;
	onTriggerTypeChange: (value: "condition" | "timer") => void;
	onTimerIntervalChange: (value: number) => void;
	onTimerUnitChange: (value: "second" | "minute" | "hour" | "day") => void;
}

const ResetVarConfig: React.FC<ResetVarConfigProps> = ({
	variable,
	triggerType,
	timerInterval,
	timerUnit,
	customVariables,
	customVariableOptions,
	onVariableChange,
	onTriggerTypeChange,
	onTimerIntervalChange,
	onTimerUnitChange,
}) => {
	return (
		<>
			{/* RESET 模式的 UI */}
			<div className="flex flex-col gap-2">
				<Label htmlFor="resetVariable" className="text-sm font-medium">
					选择变量
				</Label>
				<SelectInDialog
					id="resetVariable"
					value={variable}
					onValueChange={onVariableChange}
					placeholder={customVariables.length === 0 ? "无自定义变量" : "选择要重置的变量"}
					options={customVariableOptions}
					disabled={customVariables.length === 0}
					emptyMessage="未配置自定义变量，请在策略起点配置"
				/>
			</div>

			{/* 触发方式 */}
			<div className="space-y-1">
				<Label className="text-sm font-medium">触发方式</Label>
				<div className="flex items-center space-x-6 pt-1">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="reset-condition-trigger"
							checked={triggerType === "condition"}
							onCheckedChange={(checked) => {
								if (checked) {
									onTriggerTypeChange("condition");
								}
							}}
						/>
						<Label
							htmlFor="reset-condition-trigger"
							className="text-sm cursor-pointer flex items-center"
						>
							<Filter className="h-3.5 w-3.5 mr-1 text-orange-500" />
							条件触发
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="reset-timer-trigger"
							checked={triggerType === "timer"}
							onCheckedChange={(checked) => {
								if (checked) {
									onTriggerTypeChange("timer");
								}
							}}
						/>
						<Label
							htmlFor="reset-timer-trigger"
							className="text-sm cursor-pointer flex items-center"
						>
							<Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
							定时触发
						</Label>
					</div>
				</div>
			</div>

			{/* 定时配置 */}
			{triggerType === "timer" && (
				<TimerConfig
					timerInterval={timerInterval}
					timerUnit={timerUnit}
					onTimerIntervalChange={onTimerIntervalChange}
					onTimerUnitChange={onTimerUnitChange}
				/>
			)}

			{/* 说明文案 */}
			<div className="rounded-md bg-blue-50 p-3 border border-blue-200">
				<p className="text-xs text-blue-800">
					<strong>重置操作</strong>将把变量恢复为在策略起点定义的初始值。
				</p>
			</div>
		</>
	);
};

export default ResetVarConfig;
