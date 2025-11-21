import { Clock } from "lucide-react";
import type React from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { formatDate } from "@/components/flow/node/node-utils";
import type { TimeRange } from "@/types/strategy";
import { useTranslation } from "react-i18next";

interface TimeRangeSelectorProps {
	timeRange: TimeRange;
	setTimeRange: (timeRange: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
	timeRange,
	setTimeRange,
}) => {
	const { t } = useTranslation();
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

	return (
		<div className="grid grid-cols-2 gap-2">
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">{t("startNode.startTime")}</span>
				</div>
				<DateTimePicker24h
					value={parseDatetime(timeRange.startDate)}
					showSeconds={false}
					onChange={(date) =>
						setTimeRange({
							...timeRange,
							startDate: formatDate(date),
						})
					}
					placeholder={t("startNode.startTime")}
				/>
			</div>
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">{t("startNode.endTime")}</span>
				</div>
				<DateTimePicker24h
					value={parseDatetime(timeRange.endDate)}
					onChange={(date) =>
						setTimeRange({
							...timeRange,
							endDate: formatDate(date),
						})
					}
				/>
			</div>
		</div>
	);
};

export default TimeRangeSelector;
