import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';

interface BacktestAccountProps {
  backtestStartDate: string;
  setBacktestStartDate: (date: string) => void;
  backtestEndDate: string;
  setBacktestEndDate: (date: string) => void;
}

export const BacktestAccount = ({
  backtestStartDate,
  setBacktestStartDate,
  backtestEndDate,
  setBacktestEndDate
}: BacktestAccountProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Label className="font-medium">回测时间范围</Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">开始日期</Label>
          <Input
            type="date"
            value={backtestStartDate}
            onChange={(e) => setBacktestStartDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">结束日期</Label>
          <Input
            type="date"
            value={backtestEndDate}
            onChange={(e) => setBacktestEndDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default BacktestAccount; 