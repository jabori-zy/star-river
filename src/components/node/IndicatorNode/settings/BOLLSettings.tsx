import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, BarChart3, Gauge } from 'lucide-react';

interface BOLLSettingsProps {
  config: {
    period: number;
    stdDev: number;
    priceSource: string;
  };
  onConfigChange: (key: string, value: any) => void;
}

const BOLLSettings = ({ config, onConfigChange }: BOLLSettingsProps) => {
  return (
    <div className="space-y-3">
      {/* 周期设置 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-xs font-medium">
            周期
          </Label>
        </div>
        <Input
          type="number"
          value={config.period}
          onChange={(e) => onConfigChange('period', parseInt(e.target.value))}
          min={1}
          max={500}
          className="w-full h-8 text-sm"
        />
        <p className="text-[10px] text-muted-foreground">
          设置布林带的计算周期，数值越大曲线越平滑
        </p>
      </div>

      {/* 标准差倍数 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-xs font-medium">
            标准差倍数
          </Label>
        </div>
        <Input
          type="number"
          value={config.stdDev}
          onChange={(e) => onConfigChange('stdDev', parseFloat(e.target.value))}
          min={0.1}
          max={5}
          step={0.1}
          className="w-full h-8 text-sm"
        />
        <p className="text-[10px] text-muted-foreground">
          设置布林带的标准差倍数，影响带宽
        </p>
      </div>

      {/* 价格来源 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-xs font-medium">
            价格来源
          </Label>
        </div>
        <Select
          value={config.priceSource}
          onValueChange={(value) => onConfigChange('priceSource', value)}
        >
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue placeholder="选择价格来源" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="close">收盘价</SelectItem>
            <SelectItem value="open">开盘价</SelectItem>
            <SelectItem value="high">最高价</SelectItem>
            <SelectItem value="low">最低价</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          选择用于计算布林带的价格数据来源
        </p>
      </div>
    </div>
  );
};

export default BOLLSettings; 