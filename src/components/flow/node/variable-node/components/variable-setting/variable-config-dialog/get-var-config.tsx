import { Filter, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { SystemVariable } from "@/types/variable";
import { getVariableLabel } from "../utils";
import SymbolSelector from "./symbol-selector";
import type { SymbolSelectorOption } from "./symbol-selector";
import TimerConfig from "./timer";

interface GetVarConfigProps {
	symbol: string;
	variableName: string;
	variable: string;
	triggerType: "condition" | "timer";
	timerInterval: number;
	timerUnit: "second" | "minute" | "hour" | "day";
	symbolOptions: SymbolSelectorOption[];
	symbolPlaceholder: string;
	symbolEmptyMessage: string;
	isSymbolSelectorDisabled: boolean;
	onSymbolChange: (value: string) => void;
	onVariableNameChange: (value: string) => void;
	onVariableChange: (value: string) => void;
	onTriggerTypeChange: (value: "condition" | "timer") => void;
	onTimerIntervalChange: (value: number) => void;
	onTimerUnitChange: (value: "second" | "minute" | "hour" | "day") => void;
}

const GetVarConfig: React.FC<GetVarConfigProps> = ({
	symbol,
	variableName,
	variable,
	triggerType,
	timerInterval,
	timerUnit,
	symbolOptions,
	symbolPlaceholder,
	symbolEmptyMessage,
	isSymbolSelectorDisabled,
	onSymbolChange,
	onVariableNameChange,
	onVariableChange,
	onTriggerTypeChange,
	onTimerIntervalChange,
	onTimerUnitChange,
}) => {
	return (
		<>
			<div className="flex flex-col gap-2">
				<Label htmlFor="symbol" className="text-sm font-medium">
					交易对
				</Label>
				<div className="w-full">
					<SymbolSelector
						options={symbolOptions}
						value={symbol}
						onChange={(value) => {
							onSymbolChange(value || "");
						}}
						allowEmpty={true}
						placeholder={symbolPlaceholder}
						emptyMessage={symbolEmptyMessage}
						disabled={isSymbolSelectorDisabled}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="variableName" className="text-sm font-medium">
					变量名称
				</Label>
				<Input
					id="variableName"
					type="text"
					value={variableName}
					onChange={(e) => onVariableNameChange(e.target.value)}
					placeholder="输入变量名称"
					className="w-full"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="variable" className="text-sm font-medium">
					变量
				</Label>
				<SelectInDialog
					id="variable"
					value={variable}
					onValueChange={onVariableChange}
					placeholder="选择变量"
					options={[
						{ value: SystemVariable.POSITION_NUMBER, label: getVariableLabel(SystemVariable.POSITION_NUMBER) },
						{ value: SystemVariable.Filled_ORDER_NUMBER, label: getVariableLabel(SystemVariable.Filled_ORDER_NUMBER) },
					]}
				/>
			</div>

			<div className="space-y-1">
				<Label className="text-sm font-medium">触发方式</Label>
				<div className="flex items-center space-x-6 pt-1">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="condition-trigger"
							checked={triggerType === "condition"}
							onCheckedChange={(checked) => {
								if (checked) {
									onTriggerTypeChange("condition");
								}
							}}
						/>
						<Label
							htmlFor="condition-trigger"
							className="text-sm cursor-pointer flex items-center"
						>
							<Filter className="h-3.5 w-3.5 mr-1 text-orange-500" />
							条件触发
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="timer-trigger"
							checked={triggerType === "timer"}
							onCheckedChange={(checked) => {
								if (checked) {
									onTriggerTypeChange("timer");
								}
							}}
						/>
						<Label
							htmlFor="timer-trigger"
							className="text-sm cursor-pointer flex items-center"
						>
							<Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
							定时触发
						</Label>
					</div>
				</div>
			</div>

			{triggerType === "timer" && (
				<TimerConfig
					timerInterval={timerInterval}
					timerUnit={timerUnit}
					onTimerIntervalChange={onTimerIntervalChange}
					onTimerUnitChange={onTimerUnitChange}
				/>
			)}
		</>
	);
};

export default GetVarConfig;
