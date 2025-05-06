import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X } from "lucide-react";
import { Strategy } from "@/types/strategy";

interface HeaderProps {
    strategy: Strategy | undefined;
    setStrategy: (strategy: Strategy) => void;
    children?: React.ReactNode;
}

export function Header({ strategy, setStrategy, children }: HeaderProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  console.log("strategy", strategy);
  const [tempName, setTempName] = useState(strategy?.name || "");

  
  // 保存策略名称
  const handleSaveStrategyName = () => {
    // setDisplayName(tempName);
    setIsEditing(false);
    // 实际的保存操作由 SaveStrategyButton 处理

    if(strategy) {
      setStrategy(
        {
          ...strategy,
          name: tempName
        });
    }

      console.log("修改策略名称", strategy);


  };

  const handleCancel = () => {
    if(strategy) {
      setTempName(strategy.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="border-b shadow-sm">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-background"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-8 w-[300px] text-lg font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveStrategyName();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveStrategyName}
                className="h-8 w-8 p-0 border border-border/50 hover:border-green-500 hover:text-green-500 transition-colors"
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 border border-border/50 hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                onClick={() => setIsEditing(true)}
                className="text-lg font-semibold hover:text-primary cursor-pointer px-3 py-1.5 rounded hover:bg-accent transition-colors"
              >
                {strategy?.name}
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                编辑中
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 此处移除TradingModeSelector、SaveStrategyButton和RunStrategyButton */}
        </div>
      </div>
      {children && <div className="px-6 pb-2">{children}</div>}
    </div>
  );
} 