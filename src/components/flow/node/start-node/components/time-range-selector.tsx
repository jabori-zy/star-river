import DatePickerWithInput from "@/components/ui/date-picker-with-input";
import { TimeRange } from "@/types/strategy";
import React from "react";
import { Clock } from "lucide-react";



interface TimeRangeSelectorProps {
    timeRange: TimeRange;
    setTimeRange: (timeRange: TimeRange) => void;
}


const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ timeRange, setTimeRange }) => {
    return (
        <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">开始日期</span>
                </div>
                <DatePickerWithInput 
                  value={timeRange.startDate}
                  onChange={(date: string) => setTimeRange({
                    ...timeRange,
                    startDate: date
                  })}
                  ariaLabel="选择开始日期"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">结束日期</span>
                </div>
                <DatePickerWithInput
                  value={timeRange.endDate}
                  onChange={(date: string) => setTimeRange({
                    ...timeRange,
                    endDate: date
                  })}
                  ariaLabel="选择结束日期"
                />
              </div>
        </div>
    );
}

export default TimeRangeSelector;