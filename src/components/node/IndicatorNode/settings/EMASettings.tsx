import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, BarChart3 } from 'lucide-react';

interface EMASettingsProps {
  config: {
    period: number;
    priceSource: string;
  };
  onConfigChange: (key: string, value: any) => void;
}

const EMASettings = ({ config, onConfigChange }: EMASettingsProps) => {
  return (
    <div className="space-y-4">
      {/* 周期设置 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">
            周期
          </Label>
        </div>
        <Input
          type="number"
          value={config.period}
          onChange={(e) => onConfigChange('period', parseInt(e.target.value))}
          min={1}
          max={500}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          设置指数移动平均线的计算周期，数值越大曲线越平滑
        </p>
      </div>

      {/* 价格来源 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">
            价格来源
          </Label>
        </div>
        <Select
          value={config.priceSource}
          onValueChange={(value) => onConfigChange('priceSource', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择价格来源" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="close">收盘价</SelectItem>
            <SelectItem value="open">开盘价</SelectItem>
            <SelectItem value="high">最高价</SelectItem>
            <SelectItem value="low">最低价</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          选择用于计算指数移动平均线的价格数据来源
        </p>
      </div>
    </div>
  );
};

export default EMASettings; 