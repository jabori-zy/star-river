import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useRealTimeKlineStore } from "./realTimeStore";

interface RealTimeControlsProps {
  className?: string;
}

const RealTimeControls: React.FC<RealTimeControlsProps> = ({ className = "" }) => {
  const {
    reactive,
    setReactive,
    resizeOnUpdate,
    setResizeOnUpdate,
    isRunning,
    startSimulation,
    stopSimulation,
    resetData,
  } = useRealTimeKlineStore();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">实时更新控制</CardTitle>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "运行中" : "已停止"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 控制按钮 */}
        <div className="flex gap-2">
          <Button
            variant={isRunning ? "secondary" : "default"}
            size="sm"
            onClick={isRunning ? stopSimulation : startSimulation}
            className="flex items-center gap-1"
          >
            {isRunning ? (
              <>
                <Pause className="h-3 w-3" />
                停止
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                开始
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetData}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            重置
          </Button>
        </div>

        {/* 选项控制 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="reactive-switch" className="text-sm font-normal">
              响应式更新
            </Label>
            <Switch
              id="reactive-switch"
              checked={reactive}
              onCheckedChange={setReactive}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="resize-switch" className="text-sm font-normal">
              自动调整大小
            </Label>
            <Switch
              id="resize-switch"
              checked={resizeOnUpdate}
              onCheckedChange={setResizeOnUpdate}
            />
          </div>
        </div>

        {/* 状态说明 */}
        <div className="text-xs text-muted-foreground">
          {isRunning ? "每2秒生成一个新的数据点" : "点击开始按钮启动实时更新"}
        </div>
      </CardContent>
    </Card>
  );
};

export { RealTimeControls }; 