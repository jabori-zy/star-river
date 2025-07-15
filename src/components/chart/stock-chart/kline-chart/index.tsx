import React, { useRef, useImperativeHandle, forwardRef, useState } from "react";
import { SciChartReact, TResolvedReturnType } from "scichart-react";
import { AxisBase2D, SciChartSurface } from "scichart";
import { initKlineChart } from "./init-kline-chart";
import { Kline } from "@/types/kline";
import { IndicatorValue } from "@/types/indicator";
import { VirtualOrder } from "@/types/order/virtual-order";
import { createKlineStreamFromKey, createIndicatorStreamFromKey, createOrderStreamForSymbol } from "@/hooks/obs/backtest-strategy-data-obs";
import { parseKey } from "@/utils/parse-key";
import { BacktestKlineKey } from "@/types/symbol-key";
import { Subscription } from "rxjs";
import { KlineChartConfig, SubChartConfig } from "@/types/chart";
import ChartEditButton from "../chart-edit-button";
import ChartEditDialog from "../components/chart-edit-dialog";
import { getInitialChartData } from "@/service/chart";

interface KlineChartProps {
    playIndex: number,
    klineChartConfig: KlineChartConfig;
    setMainChart?: (sciChartSurface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
    addSurfaceToGroup: (surface: SciChartSurface) => void;
    enabled?: boolean; // 是否启用Observable数据流,
    
}

interface KlineChartRef {
    clearChartData: () => void;
}

const KlineChart = forwardRef<KlineChartRef, KlineChartProps>(
    ({ playIndex, klineChartConfig, addAxis, addSurfaceToGroup, enabled = true }, ref) => {

        const chartControlsRef = useRef<{
            setKlineData: (symbolName: string, kline: Kline[]) => void;
            setXRange: (start: number, end: number) => void;
            onNewKline: (newKline: Kline) => void;
            onNewIndicator: (newIndicators: Record<string, IndicatorValue>) => void;
            onNewOrder: (newOrder: VirtualOrder) => void;
            clearChartData: () => void;
        }>(undefined);

        // 指标编辑器状态
        const [isEditorOpen, setIsEditorOpen] = useState(false);

        // 处理编辑按钮点击
        const handleEdit = () => {
            setIsEditorOpen(true);
        };

        // 处理编辑器关闭
        const handleEditorClose = () => {
            setIsEditorOpen(false);
        };

        // 处理编辑器保存
        const handleEditorSave = (config: KlineChartConfig | SubChartConfig | SubChartConfig[]) => {
            console.log("保存主图配置:", config);
            // TODO: 实现配置保存逻辑
        };

        // 暴露清空方法给父组件
        useImperativeHandle(ref, () => ({
            clearChartData: () => {
                if (chartControlsRef.current) {
                    chartControlsRef.current.clearChartData();
                }
            }
        }));

        // 创建图表初始化函数 - 参考官网示例的方式
        const initChart = React.useCallback(async (rootElement: string | HTMLDivElement) => {
            // 初始化图表
            const { sciChartSurface, controls } = await initKlineChart(rootElement, klineChartConfig);

            // 解析K线缓存键获取交易所和交易对信息
            const klineKey = parseKey(klineChartConfig.klineKeyStr) as BacktestKlineKey;

            const initialKlines = await getInitialChartData(klineChartConfig.klineKeyStr, playIndex, null) as Kline[];

            if (initialKlines && initialKlines.length > 0) {
                controls.setKlineData(klineKey.symbol + "/" + klineKey.interval, initialKlines);
                controls.setXRange(initialKlines[0].timestamp / 1000, initialKlines[initialKlines.length - 1].timestamp / 1000);
            }

            // 订阅K线、指标和订单数据流 - 独立订阅，各自更新
            const subscriptions: Subscription[] = [];
            if (enabled) {
                // 1. 订阅K线数据流
                const klineStream = createKlineStreamFromKey(klineChartConfig.klineKeyStr, enabled);
                const klineSubscription = klineStream.subscribe((klineData: Kline[]) => {
                    console.log(`=== 收到K线数据流更新 ===`);
                    console.log(`K线数据长度: ${klineData.length}`);

                    if (klineData.length > 0) {
                        const latestKline = klineData[klineData.length - 1];
                        console.log(`最新K线:`, latestKline);

                        // 独立更新K线数据
                        controls.onNewKline(latestKline);
                    }
                });
                subscriptions.push(klineSubscription);

                // 2. 订阅指标数据流 - 每个指标独立订阅
                console.log("指标配置: ", klineChartConfig.indicatorChartConfig);
                Object.keys(klineChartConfig.indicatorChartConfig).forEach((indicatorKeyStr) => {
                    const indicatorStream = createIndicatorStreamFromKey(indicatorKeyStr, enabled);
                    console.log("指标key: ", indicatorKeyStr, "指标数据流: ", indicatorStream);
                    const indicatorSubscription = indicatorStream.subscribe((indicatorData: IndicatorValue[]) => {
                        console.log(`=== 收到指标数据流更新: ${indicatorKeyStr} ===`);
                        console.log(`指标数据长度: ${indicatorData.length}`);

                        if (indicatorData.length > 0) {
                            const latestIndicator = indicatorData[indicatorData.length - 1];
                            console.log(`最新指标数据:`, latestIndicator);

                            // 独立更新指标数据 - 构建单个指标的数据对象
                            const indicatorDataMap: Record<string, IndicatorValue> = {
                                [indicatorKeyStr]: latestIndicator
                            };
                            controls.onNewIndicator(indicatorDataMap);
                        }
                    });
                    subscriptions.push(indicatorSubscription);
                });

                // 3. 订阅订单数据流 - 基于交易所和交易对过滤
                const orderStream = createOrderStreamForSymbol(klineKey.exchange, klineKey.symbol, enabled);
                const orderSubscription = orderStream.subscribe((orderData: VirtualOrder) => {
                    console.log(`=== 收到订单数据流更新: ${klineKey.exchange}:${klineKey.symbol} ===`);
                    console.log(`订单数据:`, orderData);

                    // 独立更新订单数据
                    controls.onNewOrder(orderData);
                });
                subscriptions.push(orderSubscription);
            }

            return { sciChartSurface, controls, subscriptions };
        }, [klineChartConfig, enabled, playIndex]);

        return (
            <div className="w-full h-full flex flex-col overflow-hidden relative group">
                <div className="absolute top-2 right-20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ChartEditButton isMainChart={true} onEdit={handleEdit}/>
                </div>
                <SciChartReact
                    key={`${klineChartConfig.klineKeyStr}-${Object.keys(klineChartConfig.indicatorChartConfig).join('-')}-${playIndex}`}
                    initChart={initChart}
                    style={{ flexBasis: 200, flexGrow: 1, flexShrink: 1 }}
                    onInit={(initResult: TResolvedReturnType<typeof initChart>) => {
                        const { sciChartSurface, controls, subscriptions } = initResult;
                        // setMainChart(sciChartSurface);
                        chartControlsRef.current = controls;

                        addAxis(sciChartSurface.xAxes.get(0));
                        addSurfaceToGroup(sciChartSurface);

                        // 返回清理函数 - 类似官网示例
                        return () => {
                            console.log(`=== 图表清理 ===`);
                            chartControlsRef.current = undefined;

                            // 清理所有订阅
                            subscriptions.forEach(subscription => {
                                if (subscription) {
                                    subscription.unsubscribe();
                                }
                            });
                        };
                    }}
                />

                {/* 图表编辑对话框 */}
                <ChartEditDialog
                    isOpen={isEditorOpen}
                    onClose={handleEditorClose}
                    mode="main"
                    klineChartConfig={klineChartConfig}
                    onSave={handleEditorSave}
                />
            </div>
        );
    }
);

KlineChart.displayName = 'KlineChartWithObservable';

export default KlineChart;
