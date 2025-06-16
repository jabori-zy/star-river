import { useState } from 'react';
import { 
    Handle, 
    type NodeProps,
    Position,
    useNodeConnections,
    useReactFlow
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { PencilIcon, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import IndicatorNodePanel from './panel';
import { type IndicatorNodeData } from '@/types/node/indicator-node';
import { IndicatorType } from '@/types/indicator';
import { IndicatorValue } from '@/types/indicator/indicatorValue';
import { TradeMode } from '@/types/node';
import { useStrategyStore } from '@/store/useStrategyStore';
import { getTradingModeName, getTradingModeColor } from '@/utils/tradingModeHelper';

function IndicatorNode({id, data, isConnectable}:NodeProps) {
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "指标节点");
    const [indicatorType, setIndicatorType] = useState<IndicatorType>(
        data.indicatorType as IndicatorType || IndicatorType.SMA
    );
    
    const [indicatorValue, setIndicatorValue] = useState<IndicatorValue | null>(
        data.indicatorValue as IndicatorValue || null
    );
    
    // 获取当前策略的交易模式
    const { strategy } = useStrategyStore();
    const tradingMode = strategy?.tradeMode || TradeMode.LIVE;

    const connections = useNodeConnections({
        handleType: 'target',
    });
    const { updateNodeData } = useReactFlow();

    const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    // 保存节点数据
    const handleSave = (newData: IndicatorNodeData) => {
        updateNodeData(id, {
            ...newData,
            nodeName: nodeName,
            indicatorType: indicatorType,
        });
        setIndicatorValue(newData.indicatorValue || null);
        setIsEditing(false);
    };

    // 获取指标名称
    const getIndicatorName = () => {
        switch (indicatorType) {
            case IndicatorType.SMA:
                return "简单移动平均线";
            case IndicatorType.EMA:
                return "指数移动平均线";
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
            case IndicatorType.EMA:
                return "text-green-500";
            case IndicatorType.BOLL:
                return "text-blue-500";
            default:
                return "text-gray-500";
        }
    };

    // 显示当前模式下的配置参数
    const renderConfigInfo = () => {
        const nodeData = data as IndicatorNodeData;
        let period = "未设置";
        
        switch (tradingMode) {
            case TradeMode.LIVE: {
                // 实盘模式显示交易对和时间间隔
                const liveConfig = nodeData.liveConfig;
                if (liveConfig?.symbol && liveConfig?.interval) {
                    return (
                        <div className="flex items-center justify-between text-xs mt-0.5">
                            <span className="text-muted-foreground">交易对:</span>
                            <span className="font-medium">{liveConfig.symbol} / {liveConfig.interval}</span>
                        </div>
                    );
                } else if (liveConfig?.indicatorConfig && 'period' in liveConfig.indicatorConfig) {
                    period = liveConfig.indicatorConfig.period.toString();
                }
                break;
            }
            case TradeMode.SIMULATE: {
                // 模拟模式显示周期等参数
                const simulateConfig = nodeData.simulateConfig;
                if (simulateConfig?.indicatorConfig && 'period' in simulateConfig.indicatorConfig) {
                    period = simulateConfig.indicatorConfig.period.toString();
                }
                break;
            }
            case TradeMode.BACKTEST: {
                // 回测模式显示数据源信息
                const backtestConfig = nodeData.backtestConfig;
                if (backtestConfig?.exchangeConfig?.symbol && backtestConfig?.exchangeConfig?.interval) {
                    return (
                        <div className="flex items-center justify-between text-xs mt-0.5">
                            <span className="text-muted-foreground">交易对:</span>
                            <span className="font-medium">{backtestConfig.exchangeConfig.symbol} / {backtestConfig.exchangeConfig.interval}</span>
                        </div>
                    );
                } else if (backtestConfig?.indicatorConfig && 'period' in backtestConfig.indicatorConfig) {
                    period = backtestConfig.indicatorConfig.period.toString();
                }
                break;
            }
        }
        
        // 默认显示周期信息
        return (
            <div className="flex items-center justify-between text-xs mt-0.5">
                <span className="text-muted-foreground">周期:</span>
                <span className="font-medium">{period}</span>
            </div>
        );
    };

    // 渲染指标值
    const renderIndicatorValue = () => {
        if (!indicatorValue) return null;

        switch (indicatorType) {
            case IndicatorType.SMA: {
                const smaValue = (indicatorValue as { sma?: { value: number } }).sma?.value;
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
            }
            case IndicatorType.EMA: {
                const emaValue = (indicatorValue as { ema?: { value: number } }).ema?.value;
                return (
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">EMA:</span>
                            <span className={`text-sm font-medium ${
                                emaValue ? (
                                    emaValue > 0 
                                        ? 'text-green-500' 
                                        : emaValue < 0 
                                            ? 'text-red-500' 
                                            : 'text-gray-500'
                                ) : 'text-gray-500'
                            }`}>
                                {emaValue?.toFixed(2) || '---'}
                            </span>
                        </div>
                    </div>
                );
            }
            case IndicatorType.BOLL: {
                const bollValue = indicatorValue as { 
                    upper?: { value: number }; 
                    middle?: { value: number }; 
                    lower?: { value: number } 
                };
                const upperValue = bollValue.upper?.value;
                const middleValue = bollValue.middle?.value;
                const lowerValue = bollValue.lower?.value;
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
            }
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

            {strategy && (
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
                            data={data as IndicatorNodeData}
                            strategy={strategy}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            handleSave={handleSave}
                            nodeName={nodeName}
                            onNodeNameChange={setNodeName}
                            indicatorType={indicatorType}
                            setIndicatorType={setIndicatorType}
                        />
                    </div>
                </Drawer>
            )}
        </>
    );
};

export default IndicatorNode; 