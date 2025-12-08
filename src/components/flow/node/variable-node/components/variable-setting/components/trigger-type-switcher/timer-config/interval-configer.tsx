import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type {
	IntervalTimerConfig,
	TimerUnit,
} from "@/types/node/variable-node";
import { getTimeUnitOptions } from "../trigger-type-switcher-utils";

interface IntervalConfigerProps {
	config: IntervalTimerConfig;
	onChange: (config: IntervalTimerConfig) => void;
}

const IntervalConfiger: React.FC<IntervalConfigerProps> = ({
	config,
	onChange,
}) => {
	const { t } = useTranslation();
	const handleIntervalChange = (interval: number) => {
		onChange({
			...config,
			interval,
		});
	};

	const handleUnitChange = (unit: TimerUnit) => {
		onChange({
			...config,
			unit,
		});
	};

	return (
		<>
			<div className="flex items-center space-x-2">
				<Input
					type="number"
					min="1"
					step="1"
					value={config.interval}
					onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
					className="h-8 w-20"
				/>
				<SelectInDialog
					value={config.unit}
					onValueChange={(value) => handleUnitChange(value as TimerUnit)}
					placeholder={t("variableNode.timerConfig.selectTimeUnit")}
					options={getTimeUnitOptions(t)}
					className="h-8 flex-1"
				/>
			</div>
			<div className="flex flex-wrap gap-2">
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onChange({
							mode: "interval",
							interval: 1,
							unit: "second",
						});
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1s
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onChange({
							mode: "interval",
							interval: 1,
							unit: "minute",
						});
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1m
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onChange({
							mode: "interval",
							interval: 5,
							unit: "minute",
						});
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					5m
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onChange({
							mode: "interval",
							interval: 1,
							unit: "hour",
						});
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1h
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
					onClick={() => {
						onChange({
							mode: "interval",
							interval: 1,
							unit: "day",
						});
					}}
				>
					<Clock className="h-3 w-3 mr-1" />
					1d
				</Badge>
			</div>
		</>
	);
};

export default IntervalConfiger;
