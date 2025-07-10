import React, { useState, useRef } from "react";
import { SciChartSurface, AxisBase2D, NumberRange } from "scichart";
import { SciChartVerticalGroup } from "scichart";
import { AxisSynchroniser } from "../axis-synchroniser";
import KlineChart from ".";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConnectionState, disconnectKlineStream, SSEConnectionState } from "@/hooks/obs/backtest-strategy-data-obs";

interface ObservableTestExampleProps {
    klineKeyStr: string;
    indicatorKeyStrs?: string[];
}

const ObservableTestExample: React.FC<ObservableTestExampleProps> = ({ 
    klineKeyStr, 
    indicatorKeyStrs = [] 
}) => {
    const [mainChart, setMainChart] = useState<SciChartSurface>();
    const [enabled, setEnabled] = useState<boolean>(true);
    const [connectionState, setConnectionState] = useState<SSEConnectionState>(SSEConnectionState.DISCONNECTED);

    // 图表组
    const verticalGroupRef = useRef<SciChartVerticalGroup>(new SciChartVerticalGroup());
    const axisSynchroniserRef = useRef<AxisSynchroniser>(new AxisSynchroniser(new NumberRange(200, 500)));
    
    // 创建ref来获取子组件的清空方法
    const klineChartRef = useRef<{ clearChartData: () => void }>(null);

    // 监听连接状态
    React.useEffect(() => {
        const subscription = getConnectionState().subscribe(state => {
            setConnectionState(state);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleAddAxis = (axis: AxisBase2D) => {
        axisSynchroniserRef.current.addAxis(axis);
    };

    const handleAddSurfaceToGroup = (surface: SciChartSurface) => {
        verticalGroupRef.current.addSurfaceToGroup(surface);
    };

    const handleToggleConnection = () => {
        setEnabled(!enabled);
    };

    const handleDisconnect = () => {
        disconnectKlineStream();
    };

    const handleClearChart = () => {
        if (klineChartRef.current) {
            klineChartRef.current.clearChartData();
        }
    };

    const getConnectionStateColor = (state: SSEConnectionState) => {
        switch (state) {
            case SSEConnectionState.CONNECTED:
                return "text-green-600";
            case SSEConnectionState.CONNECTING:
                return "text-yellow-600";
            case SSEConnectionState.ERROR:
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    const getConnectionStateText = (state: SSEConnectionState) => {
        switch (state) {
            case SSEConnectionState.CONNECTED:
                return "已连接";
            case SSEConnectionState.CONNECTING:
                return "连接中...";
            case SSEConnectionState.ERROR:
                return "连接错误";
            default:
                return "未连接";
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* 控制面板 */}
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="text-lg">Observable K线图表测试</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <span>连接状态:</span>
                            <span className={`font-semibold ${getConnectionStateColor(connectionState)}`}>
                                {getConnectionStateText(connectionState)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>数据流:</span>
                            <span className={enabled ? "text-green-600" : "text-red-600"}>
                                {enabled ? "启用" : "禁用"}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleToggleConnection}
                            variant={enabled ? "destructive" : "default"}
                        >
                            {enabled ? "禁用数据流" : "启用数据流"}
                        </Button>
                        
                        <Button 
                            onClick={handleDisconnect}
                            variant="outline"
                        >
                            断开连接
                        </Button>
                        
                        <Button 
                            onClick={handleClearChart}
                            variant="outline"
                        >
                            清空图表
                        </Button>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>缓存键:</strong> {klineKeyStr}</p>
                        <p><strong>指标键:</strong> {indicatorKeyStrs.length > 0 ? indicatorKeyStrs.join(', ') : '无'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* 图表区域 */}
            <div className="flex-1 border rounded-lg overflow-hidden">
                <KlineChart
                    ref={klineChartRef}
                    chartId={1}
                    klineKeyStr={klineKeyStr}
                    indicatorKeyStrs={indicatorKeyStrs}
                    setMainChart={setMainChart}
                    addAxis={handleAddAxis}
                    addSurfaceToGroup={handleAddSurfaceToGroup}
                    enabled={enabled}
                />
            </div>
        </div>
    );
};

export default ObservableTestExample;
