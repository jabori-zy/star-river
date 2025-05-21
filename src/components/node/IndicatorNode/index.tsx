import { useState, useEffect } from 'react';
import { 
    Handle, 
    type NodeProps, 
    type Node,
    Position,
    useNodeConnections,
    useReactFlow
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { PencilIcon, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import IndicatorNodePanel from './panel';
import { IndicatorNodeLiveConfig, IndicatorNodeSimulateConfig, IndicatorNodeBacktestConfig } from '@/types/node/indicatorNode';
import { IndicatorType } from '@/types/indicator';
import { IndicatorValue } from '@/types/indicator/indicatorValue';
import { TradeMode } from '@/types/node';
import { useStrategyStore } from '@/store/useStrategyStore';
import { getTradingModeName, getTradingModeColor } from '@/utils/tradingModeHelper';

function IndicatorNode({id, data, isConnectable}:NodeProps) {
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "指标节点");
    const [nodeNameEditing, setNodeNameEditing] = useState(false);
    const [indicatorType, setIndicatorType] = useState<IndicatorType>(
        data.indicatorType as IndicatorType || IndicatorType.SMA
    );

    // const { event: messages, clearNodeMessages } = useStrategyEventContext();
    
    const [indicatorValue, setIndicatorValue] = useState<IndicatorValue | null>(null);
    
    // 获取当前策略的交易模式
    const { strategy } = useStrategyStore();
    const tradingMode = strategy?.tradeMode || TradeMode.LIVE;

    // useEffect(() => {
    //     // 获取实时数据节点的消息
    //     const indicator_node_message = messages[id];
    //     if (indicator_node_message && indicator_node_message.length > 0) {
    //         const lastMessage = indicator_node_message.at(-1);
    //         if (lastMessage && lastMessage.indicator_data && lastMessage.indicator_data.indicator_value) {
    //             const newValue = lastMessage.indicator_data.indicator_value;
    //             setIndicatorValue(newValue);
    //         }
    //     }

    //     clearNodeMessages(id);
    // }, [messages, id, clearNodeMessages]);

    const connections = useNodeConnections({
        handleType: 'target',
    });
    const { updateNodeData, getNode } = useReactFlow();

    let sourceNode: Node | undefined;
    if (connections.length > 0) {
        sourceNode = getNode(connections[0].source);
    }

    const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNodeName(e.target.value);
    };

    const saveNodeName = () => {
        updateNodeData(id, {
            ...data,
            nodeName: nodeName
        });
        setNodeNameEditing(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveNodeName();
            setNodeNameEditing(false);
        }
    };

    const handleSave = (newData: Record<string, unknown>) => {
        // 保存节点数据时，如果有新的指标值，则使用新的指标值
        // 如果没有，则保留现有的指标值（可能来自实时数据更新）
        const newIndicatorValue = newData.indicatorValue as IndicatorValue || indicatorValue;
        
        updateNodeData(id, {
            ...data,
            ...newData,
            nodeName: nodeName,
            indicatorType: indicatorType,
            indicatorValue: newIndicatorValue
        });
        setIsEditing(false);
    };

    // 获取指标名称
    const getIndicatorName = () => {
        switch (indicatorType) {
            case IndicatorType.SMA:
                return "简单移动平均线";
            case IndicatorType.BOLL:
                return "布林带";
            default:
                return "指标";
        }
    };

    // 获取指标图标颜色
    const getIndicatorColor = () => {
        switch (indicatorType) {
            case IndicatorType.SMA:
                return "text-purple-500";
            case IndicatorType.BOLL:
                return "text-blue-500";
            default:
                return "text-gray-500";
        }
    };

    // 获取当前模式下的配置
    const getCurrentModeConfig = (): IndicatorNodeLiveConfig | IndicatorNodeSimulateConfig | IndicatorNodeBacktestConfig => {
        const defaultConfig = {
            period: 9,
            priceSource: "close"
        };
        
        switch (tradingMode) {
            case TradeMode.LIVE:
                return (data.liveConfig as IndicatorNodeLiveConfig) || defaultConfig;
            case TradeMode.SIMULATE:
                return (data.simulateConfig as IndicatorNodeSimulateConfig) || defaultConfig;
            case TradeMode.BACKTEST:
                return (data.backtestConfig as IndicatorNodeBacktestConfig) || defaultConfig;
            default:
                return defaultConfig;
        }
    };

    // 显示当前模式下的配置参数
    const renderConfigInfo = () => {
        const config = getCurrentModeConfig();
        
        return (
            <div className="flex items-center justify-between text-xs mt-0.5">
                <span className="text-muted-foreground">周期:</span>
                <span className="font-medium">{config.period || "未设置"}</span>
            </div>
        );
    };

    // 渲染指标值
    const renderIndicatorValue = () => {
        if (!indicatorValue) return null;

        switch (indicatorType) {
            case IndicatorType.SMA:
                const smaValue = (indicatorValue as any).sma?.value;
                return (
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">SMA:</span>
                            <span className={`text-sm font-medium ${
                                smaValue ? (
                                    smaValue > 0 
                                        ? 'text-green-500' 
                                        : smaValue < 0 
                                            ? 'text-red-500' 
                                            : 'text-gray-500'
                                ) : 'text-gray-500'
                            }`}>
                                {smaValue?.toFixed(2) || '---'}
                            </span>
                        </div>
                    </div>
                );
            case IndicatorType.BOLL:
                const upperValue = (indicatorValue as any).upper?.value;
                const middleValue = (indicatorValue as any).middle?.value;
                const lowerValue = (indicatorValue as any).lower?.value;
                return (
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">上轨:</span>
                            <span className="text-sm font-medium text-blue-500">
                                {upperValue?.toFixed(2) || '---'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">中轨:</span>
                            <span className="text-sm font-medium text-purple-500">
                                {middleValue?.toFixed(2) || '---'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">下轨:</span>
                            <span className="text-sm font-medium text-green-500">
                                {lowerValue?.toFixed(2) || '---'}
                            </span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div 
                className="indicator-node relative"
                onMouseEnter={() => setShowEditButton(true)}
                onMouseLeave={() => setShowEditButton(false)}
            >
                <div className="w-[220px] h-[120px] bg-white border-2 rounded-lg shadow-sm">
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

                    <div className="p-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className={`h-4 w-4 ${getIndicatorColor()}`} />
                            <div className="text-sm font-medium">{nodeName}</div>
                            <Badge variant="secondary" className={`h-5 text-xs ${getTradingModeColor(tradingMode)}`}>
                                {getTradingModeName(tradingMode)}
                            </Badge>
                        </div>
                        
                        <div className="mt-1 flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] font-normal">
                                {getIndicatorName()}
                            </Badge>
                        </div>
                        
                        {renderConfigInfo()}
                        
                        <div className="mt-1">
                            {renderIndicatorValue()}
                        </div>
                    </div>

                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="indicator_node_input"
                        className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[30px]"
                        isConnectable={connections.length < 1}
                    />

                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id="indicator_node_output"
                        className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[30px]"
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
                    <IndicatorNodePanel
                        data={data}
                        sourceNode={sourceNode}
                        setIsEditing={setIsEditing}
                        handleSave={handleSave}
                        nodeName={nodeName}
                        nodeNameEditing={nodeNameEditing}
                        setNodeNameEditing={setNodeNameEditing}
                        handleNameChange={handleNameChange}
                        saveNodeName={saveNodeName}
                        handleKeyDown={handleKeyDown}
                        indicatorType={indicatorType}
                        setIndicatorType={setIndicatorType}
                        tradingMode={tradingMode}
                    />
                </div>
            </Drawer>
        </>
    );
};

export default IndicatorNode; 