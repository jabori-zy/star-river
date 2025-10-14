import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";

interface TimerConfigProps {
	timerInterval: number;
	timerUnit: "second" | "minute" | "hour" | "day";
	onTimerIntervalChange: (value: number) => void;
	onTimerUnitChange: (value: "second" | "minute" | "hour" | "day") => void;
}

const TimerConfig: React.FC<TimerConfigProps> = ({
	timerInterval,
	timerUnit,
	onTimerIntervalChange,
	onTimerUnitChange,
}) => {
	return (
		<div className="space-y-1">
			<Label className="text-sm font-medium">定时配置</Label>
			<div className="flex items-center space-x-2">
				<Input
					type="number"
					min="1"
					step="1"
					value={timerInterval}
					onChange={(e) =>
						onTimerIntervalChange(parseInt(e.target.value) || 1)
					}
					className="h-8 w-20"
				/>
				<SelectInDialog
					value={timerUnit}
					onValueChange={(value) =>
						onTimerUnitChange(value as "second" | "minute" | "hour" | "day")
					}
					placeholder="选择时间单位"
					options={[
						{ value: "second", label: "秒" },
						{ value: "minute", label: "分钟" },
						{ value: "hour", label: "小时" },
						{ value: "day", label: "天" },
					]}
					className="h-8 flex-1"
				/>
			</div>
			<div className="flex flex-wrap gap-2 mt-2">
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onTimerIntervalChange(1);
						onTimerUnitChange("second");
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1s
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onTimerIntervalChange(1);
						onTimerUnitChange("minute");
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1m
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onTimerIntervalChange(5);
						onTimerUnitChange("minute");
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					5m
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onTimerIntervalChange(1);
						onTimerUnitChange("hour");
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1h
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onTimerIntervalChange(1);
						onTimerUnitChange("day");
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1d
				</Badge>
			</div>
		</div>
	);
};

export default TimerConfig;
