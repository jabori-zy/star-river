import { Clock } from "lucide-react";
import type React from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { format } from "date-fns";
import type { TimeRange } from "@/types/strategy";
import { DateTime, Settings } from "luxon";
// import useSystemConfigStore from "@/store/useSystemConfigStore";

interface TimeRangeSelectorProps {
	timeRange: TimeRange;
	setTimeRange: (timeRange: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
	timeRange,
	setTimeRange,
}) => {
	// const { systemConfig } = useSystemConfigStore();
	// 将字符串转换为Date对象
	const parseDatetime = (datetimeString: string): Date | undefined => {
		if (!datetimeString) return undefined;
		try {
			return new Date(datetimeString);
		} catch {
			return undefined;
		}
	};

	// 将Date对象格式化为 'YYYY-MM-DD HH:mm:ss' 格式
	const formatDate = (date: Date | undefined): string => {
		if (!date) return '';
		console.log("Datetime zones", Settings.defaultZone)
		// console.log(systemConfig)
		return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd HH:mm:ss ZZ") || '';
	};

	return (
		<div className="grid grid-cols-2 gap-2">
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">开始日期</span>
				</div>
				<DateTimePicker24h
					value={parseDatetime(timeRange.startDate)}
					onChange={(date) =>
						setTimeRange({
							...timeRange,
							startDate: formatDate(date),
						})
					}
					placeholder="选择开始日期和时间"
				/>
			</div>
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">结束日期</span>
				</div>
				<DateTimePicker24h
					value={parseDatetime(timeRange.endDate)}
					onChange={(date) =>
						setTimeRange({
							...timeRange,
							endDate: formatDate(date),
						})
					}
					placeholder="选择结束日期和时间"
				/>
			</div>
		</div>
	);
};

export default TimeRangeSelector;
