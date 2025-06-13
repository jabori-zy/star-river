import { useState } from "react";
import { 
    Handle, 
    type NodeProps, 
    Position,
    useReactFlow
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { PencilIcon, Variable, Plus, Clock, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { TradeMode } from "@/types/node";
import { useStrategyStore } from "@/store/useStrategyStore";
import { getTradingModeName, getTradingModeColor } from "@/utils/tradingModeHelper";
import { StrategySysVariable, GetVariableType } from "@/types/node/getVariableNode";
import GetVariableNodePanel from './panel';
import { type GetVariableNode, GetVariableConfig } from "@/types/node/getVariableNode";

function GetVariableNode({id, data}:NodeProps<GetVariableNode>) {
    
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "获取变量节点");

    // 获取策略信息
    const { strategy } = useStrategyStore();
    const tradingMode = strategy!.tradeMode;

    // 获取当前配置下的变量列表
    const getVariables = () => {
        let variables: GetVariableConfig[] = [];
        if (tradingMode === TradeMode.LIVE && data.liveConfig) {
            variables = data.liveConfig.variables || [];
        } else if (tradingMode === TradeMode.SIMULATE && data.simulateConfig) {
            variables = data.simulateConfig.variables || [];
        } else if (tradingMode === TradeMode.BACKTEST && data.backtestConfig) {
            variables = data.backtestConfig.variables || [];
        }
        
        return variables;
    };
    
    // 获取当前交易模式下的账户和交易对
    const getCurrentAccount = () => {
        if (tradingMode === TradeMode.LIVE && data.liveConfig) {
            return data.liveConfig.selectedLiveAccount;
        } else if (tradingMode === TradeMode.SIMULATE && data.simulateConfig) {
            return data.simulateConfig.selectedSimulateAccount;
        }
        return null;
    };
    
    const getCurrentSymbol = () => {
        if (tradingMode === TradeMode.LIVE && data.liveConfig) {
            return data.liveConfig.symbol;
        } else if (tradingMode === TradeMode.SIMULATE && data.simulateConfig) {
            return data.simulateConfig.symbol;
        } else if (tradingMode === TradeMode.BACKTEST && data.backtestConfig) {
            return data.backtestConfig.exchangeModeConfig?.symbol;
        }
        return null;
    };

    const variables = getVariables();
    const currentAccount = getCurrentAccount();
    const currentSymbol = getCurrentSymbol();

    const { updateNodeData } = useReactFlow();

    const handleSave = (updatedData: GetVariableNode["data"]) => {
        updateNodeData(id, updatedData);
        setIsEditing(false);
    };
    
    // 获取变量类型的显示文本
    const getVariableTypeText = (variable: string = StrategySysVariable.POSITION_NUMBER) => {
        switch (variable) {
            case StrategySysVariable.POSITION_NUMBER:
                return "持仓数量";
            case StrategySysVariable.Filled_ORDER_NUMBER:
                return "已成交订单数量";
            default:
                return "未知变量";
        }
    };

    // 获取当前交易模式下的触发方式及定时配置
    const getVariableTriggerType = () => {
        if (tradingMode === TradeMode.LIVE && data.liveConfig) {
            return {
                type: data.liveConfig.getVariableType,
                timerConfig: data.liveConfig.timerConfig
            };
        } else if (tradingMode === TradeMode.SIMULATE && data.simulateConfig) {
            return {
                type: data.simulateConfig.getVariableType,
                timerConfig: data.simulateConfig.timerConfig
            };
        } else if (tradingMode === TradeMode.BACKTEST && data.backtestConfig) {
            return {
                type: data.backtestConfig.getVariableType,
                timerConfig: data.backtestConfig.timerConfig
            };
        }
        return {
            type: GetVariableType.CONDITION,
            timerConfig: undefined
        };
    };

    const { type: triggerType, timerConfig } = getVariableTriggerType();

    return (
        <>
            <div 
                className="variable-node relative"
                onMouseEnter={() => setShowEditButton(true)}
                onMouseLeave={() => setShowEditButton(false)}
            >
                <div className="w-[220px] bg-white border-2 rounded-lg shadow-sm">
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

                    <div className="p-2 border-b">
                        <div className="flex items-center gap-2">
                            <Variable className="h-3.5 w-3.5 text-green-500" />
                            <div className="text-xs font-medium">{nodeName}</div>
                            <Badge variant="secondary" className={`h-5 text-xs ${getTradingModeColor(tradingMode)}`}>
                                {getTradingModeName(tradingMode)}
                            </Badge>
                        </div>
                    </div>

                    {/* 通用输入Handle */}
                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="variable_node_input"
                        className="!w-3 !h-3 !border-2 !border-white !bg-green-400"
                        style={{ top: '30px' }}
                        title="输入"
                    />

                    {/* 账户和交易对信息 */}
                    <div className="px-3 py-2 border-b">
                        <div className="space-y-1">
                            {/* 显示账户信息 */}
                            {(tradingMode === TradeMode.LIVE || tradingMode === TradeMode.SIMULATE) && (
                                <div className="flex items-start gap-1">
                                    <span className="text-[10px] text-muted-foreground">账户:</span>
                                    <span className="text-[10px]">
                                        {currentAccount ? 
                                            currentAccount.accountName : 
                                            "未设置"}
                                    </span>
                                </div>
                            )}
                            
                            {/* 显示交易对 */}
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">交易对:</span>
                                <span className="text-[10px]">{currentSymbol || "未设置"}</span>
                            </div>

                            {/* 显示触发方式 */}
                            <div className="flex items-center gap-1 mt-1">
                                {triggerType === GetVariableType.TIMER ? (
                                    <Badge className="h-5 text-[10px] bg-blue-100 text-blue-800">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {timerConfig ? 
                                            `${timerConfig.interval}${
                                                timerConfig.unit === "second" ? "s" : 
                                                timerConfig.unit === "minute" ? "m" : 
                                                timerConfig.unit === "hour" ? "h" : "d"
                                            }` : "定时触发"}
                                    </Badge>
                                ) : (
                                    <Badge className="h-5 text-[10px] bg-orange-100 text-orange-800">
                                        <Filter className="h-3 w-3 mr-1" />
                                        条件触发
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 变量列表 */}
                    {variables.length > 0 ? (
                        <div className="px-3 py-2 space-y-2">
                            {variables.map((variable) => (
                                <div key={variable.configId} className="relative pl-4 py-1 border-l-2 border-green-200">
                                    {/* 变量名称和类型 */}
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs font-medium">{variable.variableName}</div>
                                        <Badge variant="outline" className="text-[10px] h-5 bg-green-100 text-green-800">
                                            {getVariableTypeText(variable.variable)}
                                        </Badge>
                                    </div>
                                    
                                    {/* 输出Handle */}
                                    <Handle 
                                        type="source" 
                                        position={Position.Right} 
                                        id={`${variable.configId}`}
                                        className="!w-3 !h-3 !border-2 !border-white !bg-green-400"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-3 py-6 flex flex-col items-center justify-center">
                            <div className="text-xs text-muted-foreground text-center mb-2">未配置任何变量</div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => setIsEditing(true)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                添加变量
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Drawer 
                open={isEditing} 
                onOpenChange={setIsEditing} 
                direction="right"
                modal={false}
            >
                <div style={{ isolation: 'isolate' }}>
                    <GetVariableNodePanel
                        data={data}
                        strategy={strategy || null}
                        nodeName={nodeName}
                        onNodeNameChange={setNodeName}
                        handleSave={handleSave}
                        setIsEditing={setIsEditing}
                    />
                </div>
            </Drawer>
        </>
    );
}

export default GetVariableNode; 