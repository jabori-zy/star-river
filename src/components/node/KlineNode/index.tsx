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
import KlineNodePanel from './panel';
import { Button } from '@/components/ui/button';
import { TradeMode } from '@/types/node';
import { getTradingModeName, getTradingModeColor } from '@/utils/tradingModeHelper';
import { Drawer } from '@/components/ui/drawer';
import { useStrategyStore } from '@/store/useStrategyStore';
import { type KlineNode, type KlineNodeData } from '@/types/node/KlineNode';


const KlineNode = ({ data, id, isConnectable }: NodeProps<KlineNode>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const [nodeName, setNodeName] = useState<string>(data.nodeName || "数据获取节点");
  // const { tradingMode } = useTradingModeStore();
  const { strategy } = useStrategyStore();
  const tradingMode = strategy!.tradeMode;
  const { setNodes, updateNodeData } = useReactFlow();

  const handleSave = useCallback((newData: KlineNodeData) => {
    // 使用React Flow的setNodes来更新节点数据
    console.log("准备更新节点id", id);
    setNodes(nodes => 
      nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
    // 打印节点的数据
    console.log('node data', newData);
    
    setIsEditing(false);
  }, [id, setNodes]);

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


  const panel = () => {
    // 如果策略存在，则正常显示面板
    if (strategy) {
      return (
        <KlineNodePanel
          data={data}
          strategy={strategy}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSave={handleSave}
          nodeName={nodeName}
          onNodeNameChange={setNodeName}
        />
      );
    } else {
      // 如果策略不存在，则显示错误信息
      return (
        <div className="text-red-500">策略不存在</div>
      );
    }
  };

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

          <div className="flex flex-col p-2">
            <div className="flex items-center gap-2">
              <LineChart className="h-3.5 w-3.5 text-blue-500" />
              <div className="text-xs font-medium">{nodeName}</div>
              <Badge variant="secondary" className={`h-5 text-xs ${getTradingModeColor(tradingMode)}`}>
                {getTradingModeName(tradingMode)}
              </Badge>
            </div>
            
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">交易对:</span>
                <span className="text-xs font-medium">{
                  tradingMode === TradeMode.LIVE
                    ? data.liveConfig?.symbol || "未设置"
                    : tradingMode === TradeMode.SIMULATE
                      ? data.simulateConfig?.symbol || "未设置"
                      : data.backtestConfig?.backtestStartDate || "未设置"
                }</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">时间间隔:</span>
                <span className="text-xs font-medium">{
                  tradingMode === TradeMode.LIVE
                    ? data.liveConfig?.interval || "未设置"
                    : tradingMode === TradeMode.SIMULATE
                      ? data.simulateConfig?.interval || "未设置"
                      : data.backtestConfig?.backtestEndDate || "未设置"
                }</span>
              </div>
              
              {/* 显示选择的账户 */}
              {(tradingMode === TradeMode.LIVE || tradingMode === TradeMode.SIMULATE) && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">账户:</span>
                  <span className="text-xs font-medium">{
                    tradingMode === TradeMode.LIVE 
                      ? data.liveConfig?.selectedLiveAccount?.accountName || "未选择"
                      : data.simulateConfig?.selectedSimulateAccount?.accountName || "未选择"
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
          {panel()}
        </div>
      </Drawer>
    </>
  );
};

export default KlineNode;