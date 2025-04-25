import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Check, Loader2, Play, Square, DollarSign, CreditCard, Calendar } from "lucide-react";
import { useReactFlow } from '@xyflow/react';
import { toast } from "sonner";
import { useStrategyMessages } from "@/hooks/use-strategyMessage";
import { TradeMode } from "@/types/node";
import useTradingModeStore from "@/store/useTradingModeStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 交易模式选择器组件
function TradingModeSelector() {
  const { tradingMode, setTradingMode } = useTradingModeStore();

  // 获取交易模式图标
  const getTradingModeIcon = (mode: TradeMode) => {
    switch (mode) {
      case TradeMode.LIVE:
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case TradeMode.SIMULATE:
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case TradeMode.BACKTEST:
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  // 交易模式名称
  const getTradingModeName = (mode: TradeMode) => {
    switch (mode) {
      case TradeMode.LIVE:
        return "实盘交易";
      case TradeMode.SIMULATE:
        return "模拟交易";
      case TradeMode.BACKTEST:
        return "回测交易";
      default:
        return "";
    }
  };

  // 交易模式颜色
  const getTradingModeColor = (mode: TradeMode) => {
    switch (mode) {
      case TradeMode.LIVE:
        return "text-green-500 border-green-200";
      case TradeMode.SIMULATE:
        return "text-blue-500 border-blue-200";
      case TradeMode.BACKTEST:
        return "text-purple-500 border-purple-200";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">交易模式:</span>
      <Select
        value={tradingMode}
        onValueChange={(value) => setTradingMode(value as TradeMode)}
      >
        <SelectTrigger className={`h-8 w-[110px] ${getTradingModeColor(tradingMode)}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {getTradingModeIcon(tradingMode)}
              <span>{getTradingModeName(tradingMode)}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TradeMode.LIVE} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span>实盘交易</span>
            </div>
          </SelectItem>
          <SelectItem value={TradeMode.SIMULATE} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span>模拟交易</span>
            </div>
          </SelectItem>
          <SelectItem value={TradeMode.BACKTEST} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span>回测交易</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// 保存策略按钮组件
function SaveStrategyButton({ strategyId, strategyName, strategyDescription, tradingMode }: { strategyId: number, strategyName: string, strategyDescription: string, tradingMode: TradeMode }) {
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowInstance = useReactFlow();

  // 保存策略
  const handleSaveStrategy = async () => {
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();

    console.log(tradingMode);
    const body = {
      id: strategyId,
      name: strategyName,
      description: strategyDescription,
      // 如果是Live，则trade_mode为live，如果是Simulate，则trade_mode为simulate，如果是Backtest，则trade_mode为backtest
      trade_mode: tradingMode === TradeMode.LIVE ? "live" : tradingMode === TradeMode.SIMULATE ? "simulate" : "backtest",
      status: 1,
      nodes,
      edges
    }
    console.log(body);

    setIsSaving(true);

    try {
      await fetch('http://localhost:3100/update_strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      toast.success('保存成功');
    } catch (err) {
      toast.error('保存失败' + err);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 min-w-[100px] font-medium
        border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400
        transition-all duration-200"
      onClick={handleSaveStrategy}
      disabled={isSaving}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {isSaving ? "保存中" : "保存策略"}
    </Button>
  );
}

// 初始化策略
function requestInitStrategy(strategyId: number) {
  fetch('http://localhost:3100/init_strategy', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ "strategy_id": strategyId })
  });
}

// 运行策略
function requestRunStrategy(strategyId: number) {
  fetch('http://localhost:3100/run_strategy', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ "strategy_id": strategyId })
  });
}

// 停止策略
function requestStopStrategy(strategyId: number) {
  fetch('http://localhost:3100/stop_strategy', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ "strategy_id": strategyId })
  });
}

function requestEnabelStrategyEventPush(strategyId: number) {
  fetch('http://localhost:3100/enable_strategy_event_push', {
    headers: {
      'Content-Type': 'application/json'
    },
  });
}

// 运行策略按钮组件
function RunStrategyButton({ strategyId }: { strategyId: number }) {
  // 策略是否正在运行
  const [isRunning, setIsRunning] = useState(false);
  // 策略是否初始化
  const [isInit, setIsInit] = useState(false);
  // 是否已经连接sse
  const { connectSSE, disconnectSSE, isSSEConnected } = useStrategyMessages();

  const handleRun = async () => {
    //如果策略是运行状态
    if (isRunning) {
      // 停止策略
      requestStopStrategy(strategyId);
      // 断开sse
      disconnectSSE();
      // 设置为停止状态
      setIsRunning(false);
    } 
    //如果是停止状态
    else {
      // 连接sse
      connectSSE();
      // 初始化策略
      requestInitStrategy(strategyId);
      // 运行策略
      requestRunStrategy(strategyId);
      // 设置为运行状态
      setIsRunning(true);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`
        flex items-center gap-2 min-w-[100px] font-medium
        transition-all duration-200
        ${isSSEConnected 
          ? 'border-orange-500/50 text-orange-600 hover:bg-orange-50 hover:border-orange-500' 
          : 'border-blue-500/50 text-blue-600 hover:bg-blue-50 hover:border-blue-500'
        }
      `}
      onClick={handleRun}
    >
      {isRunning ? (
        <Square className="h-4 w-4 animate-pulse" />
      ) : isSSEConnected ? (
        <Square className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      <span className="inline-block">
        {isSSEConnected ? "停止策略" : "运行策略"}
      </span>
    </Button>
  );
}




interface HeaderProps {
    strategyId: number;
    strategyName: string;
    strategyDescription: string;
}

export function Header({ strategyId, strategyName, strategyDescription }: HeaderProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(strategyName);
  const [tempName, setTempName] = useState(displayName);
  const { tradingMode, setTradingMode } = useTradingModeStore();

  const handleSave = () => {
    setDisplayName(tempName);
    setIsEditing(false);
    // 实际的保存操作由 SaveStrategyButton 处理
  };

  const handleCancel = () => {
    setTempName(displayName);
    setIsEditing(false);
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
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
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
                {displayName}
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                编辑中
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <TradingModeSelector />
          <Badge variant="outline" className="font-mono">
            最后保存: 10:30:25
          </Badge>
          <SaveStrategyButton strategyId={strategyId} strategyName={displayName} strategyDescription={strategyDescription} tradingMode={tradingMode} />
          <RunStrategyButton strategyId={strategyId} />
        </div>
      </div>
    </div>
  );
} 