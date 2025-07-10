import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { SciChartReact, TResolvedReturnType } from "scichart-react";
import { AxisBase2D, SciChartSurface } from "scichart";
import { initKlineChart } from "./init-kline-chart";
import { Kline } from "@/types/kline";
import { IndicatorValue } from "@/types/indicator";
import { VirtualOrder } from "@/types/order/virtual-order";
import { createKlineStreamForCacheKey, createIndicatorStreamForCacheKey, createOrderStreamForSymbol } from "@/hooks/obs/backtest-strategy-data-obs";
import { parseCacheKey } from "@/utils/parseCacheKey";
import { BacktestKlineCacheKey } from "@/types/cache";
import { Subscription } from "rxjs";

interface KlineChartWithObservableProps {
    chartId: number;
    klineKeyStr: string;
    indicatorKeyStrs: string[];
    setMainChart: (sciChartSurface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
    addSurfaceToGroup: (surface: SciChartSurface) => void;
    enabled?: boolean; // 是否启用Observable数据流
}

interface KlineChartRef {
    clearChartData: () => void;
}

const KlineChart = forwardRef<KlineChartRef, KlineChartWithObservableProps>(
    ({ klineKeyStr, indicatorKeyStrs, setMainChart, addAxis, addSurfaceToGroup, enabled = true }, ref) => {

        const chartControlsRef = useRef<{
            setData: (symbolName: string, kline: Kline[]) => void;
            setXRange: (startDate: Date, endDate: Date) => void;
            onNewKline: (newKline: Kline) => void;
            onNewIndicator: (newIndicators: Record<string, IndicatorValue>) => void;
            onNewOrder: (newOrder: VirtualOrder) => void;
            clearChartData: () => void;
        }>(undefined);

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
            const { sciChartSurface, controls } = await initKlineChart(rootElement, klineKeyStr, indicatorKeyStrs);

            // 解析K线缓存键获取交易所和交易对信息
            const klineKey = parseCacheKey(klineKeyStr) as BacktestKlineCacheKey;

            // 订阅K线、指标和订单数据流 - 独立订阅，各自更新
            const subscriptions: Subscription[] = [];
            if (enabled) {
                // 1. 订阅K线数据流
                const klineStream = createKlineStreamForCacheKey(klineKeyStr, enabled);
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
                indicatorKeyStrs.forEach(indicatorKeyStr => {
                    const indicatorStream = createIndicatorStreamForCacheKey(indicatorKeyStr, enabled);
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
        }, [klineKeyStr, indicatorKeyStrs, enabled]);

        return (
            <div className="w-full h-full flex flex-col overflow-hidden">
                <SciChartReact
                    key={`${klineKeyStr}-${indicatorKeyStrs.join('-')}`}
                    initChart={initChart}
                    style={{ flexBasis: 200, flexGrow: 1, flexShrink: 1 }}
                    onInit={(initResult: TResolvedReturnType<typeof initChart>) => {
                        const { sciChartSurface, controls, subscriptions } = initResult;
                        setMainChart(sciChartSurface);
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
            </div>
        );
    }
);

KlineChart.displayName = 'KlineChartWithObservable';

export default KlineChart;
