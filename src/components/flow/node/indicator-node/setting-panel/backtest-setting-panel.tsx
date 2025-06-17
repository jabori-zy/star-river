import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { IndicatorNodeData } from "@/types/node/indicator-node";
import { useNodeConnections } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useUpdateBacktestConfig } from "@/hooks/node/indicator-node/use-update-backtest-config";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Activity, Calendar } from 'lucide-react';
import IndicatorSelector from "@/components/flow/node/indicator-node/components/indicator-selector";
import { NodeDefaultInputHandleId } from "@/types/node/index";

const IndicatorNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    const indicatorNodeData = data as IndicatorNodeData;
    const connections = useNodeConnections({ id, handleType: 'target', handleId: NodeDefaultInputHandleId.IndicatorNodeInput });
    const [isConnected, setIsConnected] = useState(false);

    const exchangeConfig = indicatorNodeData.backtestConfig?.exchangeConfig

    // 使用自定义hook管理指标配置
    const {
        updateSelectedIndicators
    } = useUpdateBacktestConfig({
        id,
        initialConfig: indicatorNodeData.backtestConfig
    });

    useEffect(() => {
        console.log('connections:', connections)
        const hasConnection = connections.length === 1;
        setIsConnected(hasConnection);
    }, [connections]);

    return (
        <div className="space-y-4">
            {/* 连接状态显示 */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    连接状态
                </Label>
                {isConnected ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        已连接到K线节点
                    </Badge>
                ) : (
                    <Badge variant="destructive">
                        未连接
                    </Badge>
                )}
            </div>
            <IndicatorSelector 
                selectedIndicators={exchangeConfig?.selectedIndicators || []}
                onSelectedIndicatorsChange={updateSelectedIndicators}
            />

            {/* 配置信息显示 */}
            {exchangeConfig && isConnected ? (
                <div className="space-y-3">
                    <Label className="text-sm font-medium">从K线节点获取的配置信息</Label>
                    
                    {/* 交易所信息 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-sm text-muted-foreground">交易所:</span>
                        <span className="text-sm font-medium">
                            {exchangeConfig.exchange || '未配置'}
                        </span>
                    </div>

                    {/* 交易对信息 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-sm text-muted-foreground">交易对:</span>
                        <span className="text-sm font-medium">
                            {exchangeConfig.symbol || '未配置'}
                        </span>
                    </div>

                    {/* 时间周期信息 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-sm text-muted-foreground">时间周期:</span>
                        <span className="text-sm font-medium">
                            {exchangeConfig.interval || '未配置'}
                        </span>
                    </div>

                    {/* 时间范围信息 */}
                    {exchangeConfig.timeRange && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                回测时间范围
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <div className="text-xs text-muted-foreground mb-1">开始时间</div>
                                    <div className="text-sm font-medium">
                                        {exchangeConfig.timeRange.startDate || '未配置'}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <div className="text-xs text-muted-foreground mb-1">结束时间</div>
                                    <div className="text-sm font-medium">
                                        {exchangeConfig.timeRange.endDate || '未配置'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        请先连接到K线节点以获取回测配置信息
                    </AlertDescription>
                </Alert>
            )}

            {/* 指标配置提示 */}
            {exchangeConfig && Object.keys(exchangeConfig.selectedIndicators || {}).length === 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        请在指标设置中选择要计算的指标
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default IndicatorNodeBacktestSettingPanel;