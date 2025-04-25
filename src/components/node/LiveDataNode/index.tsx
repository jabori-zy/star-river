import { useState, useCallback } from 'react';
import { 
    type NodeProps, 
    Handle, 
    Position, 
    useNodeConnections,
    useReactFlow,
    Node
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { LineChart, PencilIcon } from 'lucide-react';
import LiveDataNodePanel from './panel';
import { Button } from '@/components/ui/button';
import useTradingModeStore from '@/store/useTradingModeStore';
import { TradeMode } from '@/types/node';
import { getTradingModeName, getTradingModeColor } from '@/utils/tradingModeHelper';
import { Drawer } from '@/components/ui/drawer';
import { LiveTradeConfig, SimulateTradeConfig, BacktestTradeConfig } from '@/types/start_node';

// 每个交易模式的配置
interface TradingModeConfig {
  symbol: string;
  interval: string;
  selectedAccount?: string;
}

const LiveDataNode = ({ data, id, isConnectable }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const { tradingMode } = useTradingModeStore();
  const { setNodes } = useReactFlow();

  const handleSave = useCallback((newData: Record<string, unknown>) => {
    // 使用React Flow的setNodes来更新节点数据
    setNodes(nodes => 
      nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
    // 打印节点的数据
    console.log('node data', newData);

    // 如果有回调函数，也调用它
    if (typeof data.onSaveData === 'function') {
      data.onSaveData(id, newData);
    }
    
    setIsEditing(false);
  }, [data, id, setNodes]);

  const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const { getNode } = useReactFlow();
  const connections = useNodeConnections({
      handleType: 'target',
  });

  const sourceNodes = connections
      .map(connection => getNode(connection.source))
      .filter((node): node is Node => node !== null);

  // 获取当前交易模式对应的配置
  const getCurrentConfig = (): TradingModeConfig => {
    const defaultConfig: TradingModeConfig = { symbol: 'BTCUSDT', interval: '1m' };
    
    switch(tradingMode) {
      case TradeMode.LIVE:
        return (data.liveConfig as TradingModeConfig) || defaultConfig;
      case TradeMode.SIMULATE:
        return (data.simulateConfig as TradingModeConfig) || defaultConfig;
      case TradeMode.BACKTEST:
        return (data.backtestConfig as TradingModeConfig) || defaultConfig;
      default:
        return defaultConfig;
    }
  };

  const currentConfig = getCurrentConfig();

  // 构造面板数据
  const panelData = {
    liveDataNodeConfig: currentConfig,
    tradingMode,
    liveTradingConfig: data.liveTradingConfig as LiveTradeConfig | undefined,
    simulateTradingConfig: data.simulateTradingConfig as SimulateTradeConfig | undefined,
    backtestTradingConfig: data.backtestTradingConfig as BacktestTradeConfig | undefined
  };

  const panel = (
    <LiveDataNodePanel
      data={panelData}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      handleSave={handleSave}
      sourceNodes={sourceNodes}
    />
  );

  return (
    <>
      <div 
        className="live-data-node relative"
        onMouseEnter={() => setShowEditButton(true)}
        onMouseLeave={() => setShowEditButton(false)}
      >
        <div className="w-[200px] bg-white border-2 rounded-lg shadow-sm">
          {showEditButton && (
            <Button 
              variant="outline" 
              size="icon"
              className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white shadow-md hover:bg-gray-100 z-10"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="h-3 w-3" />
            </Button>
          )}

          <div className="p-2">
            <div className="flex items-center gap-2">
              <LineChart className="h-3.5 w-3.5 text-blue-500" />
              <div className="text-sm font-medium">数据获取</div>
              <Badge variant="secondary" className={`h-5 text-xs ${getTradingModeColor(tradingMode)}`}>
                {getTradingModeName(tradingMode)}
              </Badge>
            </div>
            
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">交易对:</span>
                <span className="text-xs font-medium">{currentConfig.symbol || "未设置"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">时间间隔:</span>
                <span className="text-xs font-medium">{currentConfig.interval || "未设置"}</span>
              </div>
              
              {/* 显示选择的账户 */}
              {(tradingMode === TradeMode.LIVE || tradingMode === TradeMode.SIMULATE) && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">账户:</span>
                  <span className="text-xs font-medium">{
                    tradingMode === TradeMode.LIVE 
                      ? (data.liveTradingConfig as LiveTradeConfig)?.liveAccounts?.find(acc => acc.id.toString() === currentConfig.selectedAccount)?.accountName || "未选择" 
                      : (data.simulateTradingConfig as SimulateTradeConfig)?.simulateAccounts?.find(acc => acc.id.toString() === currentConfig.selectedAccount)?.accountName || "未选择"
                  }</span>
                </div>
              )}
            </div>
          </div>

          <Handle
            type="target"
            position={Position.Left}
            id="live_data_node_input"
            className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[22px]"
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="live_data_node_output"
            className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[22px]"
            isConnectable={isConnectable}
          />
        </div>
      </div>

      <Drawer 
        open={isEditing} 
        onOpenChange={setIsEditing} 
        direction="right"
        modal={false}
      >
        <div 
          onDragStart={preventDragHandler}
          onDrag={preventDragHandler}
          onDragEnd={preventDragHandler}
          style={{ isolation: 'isolate' }}
        >
          {panel}
        </div>
      </Drawer>
    </>
  );
};

export default LiveDataNode;