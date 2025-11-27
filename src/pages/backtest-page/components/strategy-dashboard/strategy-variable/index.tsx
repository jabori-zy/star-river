import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { isCustomVariable, isSystemVariable } from "@/types/variable";
import BacktestVariableTable from "@/components/table/backtest-variable-table";
import { getStrategyVariables } from "@/service/backtest-strategy/variable";
import type { Subscription } from "rxjs";
import { createCustomVariableStream, createSystemVariableStream } from "@/hooks/obs/backtest-strategy-event-obs";
import type { CustomVariableUpdateEvent, SystemVariableUpdateEvent } from "@/types/strategy-event";
import { isCustomVariableUpdateEvent, isSystemVariableUpdateEvent } from "@/types/strategy-event/backtest-strategy-event";

interface StrategyVariableProps {
	strategyId: number;
}

export interface StrategyVariableRef {
	clearVariableEvents: () => void;
}


const StrategyVariable = forwardRef<StrategyVariableRef, StrategyVariableProps>(({ strategyId }, ref) => {


    useImperativeHandle(ref, () => ({
        clearVariableEvents: () => {
            setVariableUpdateEvents([]);
            hasInitializedRef.current = false;
        }
    }), []);


    const [variableUpdateEvents, setVariableUpdateEvents] = useState<(CustomVariableUpdateEvent|SystemVariableUpdateEvent)[]>([]);

    const customVariableSubscriptionRef = useRef<Subscription | null>(null);
    const systemVariableSubscriptionRef = useRef<Subscription | null>(null);
    const isInitializingRef = useRef(false);
    const hasInitializedRef = useRef(false);
    const variableUpdateEventsRef = useRef<(CustomVariableUpdateEvent|SystemVariableUpdateEvent)[]>([]);
    
    // 同步 state 到 ref
    useEffect(() => {
        variableUpdateEventsRef.current = variableUpdateEvents;
    }, [variableUpdateEvents]);

    // 初始化变量数据
    const getInitVariableData = useCallback(async () => {
        if (isInitializingRef.current || hasInitializedRef.current) {
            return;
        }
        
        isInitializingRef.current = true;
        try {
            // 从API获取数据
            const initialVariableData = await getStrategyVariables(strategyId);
            const events: (CustomVariableUpdateEvent | SystemVariableUpdateEvent)[] = [];
            
            initialVariableData.forEach((variable) => {
                if (isCustomVariable(variable)) {
                    events.push({
                        channel: "",
                        cycleId: 0,
                        event: "custom-variable-update-event",
                        datetime: new Date().toISOString(),
                        nodeId: "",
                        nodeName: "",
                        outputHandleId: "",
                        varOperation: "get",
                        customVariable: variable,
                    });
                } else if (isSystemVariable(variable)) {
                    events.push({
                        channel: "",
                        cycleId: 0,
                        event: "sys-variable-update-event",
                        datetime: new Date().toISOString(),
                        nodeId: "",
                        nodeName: "",
                        outputHandleId: "",
                        sysVariable: variable,
                    });
                }
            });
            
            setVariableUpdateEvents(events);
            hasInitializedRef.current = true;
        } catch (error) {
            console.warn("获取策略变量失败", error);
        } finally {
            isInitializingRef.current = false;
        }
    }, [strategyId]);

    // 初始化数据
    useEffect(() => {
        getInitVariableData();
    }, [getInitVariableData]);


    // SSE实时数据订阅
    useEffect(() => {
        // 清理之前的订阅（如果存在）
        if (customVariableSubscriptionRef.current) {
            customVariableSubscriptionRef.current.unsubscribe();
            customVariableSubscriptionRef.current = null;
        }

        if (systemVariableSubscriptionRef.current) {
            systemVariableSubscriptionRef.current.unsubscribe();
            systemVariableSubscriptionRef.current = null;
        }

        // 创建自定义变量数据流订阅
        const customVariableStream = createCustomVariableStream(true);
        const customVariableSubscription = customVariableStream.subscribe(async (customVariableEvent) => {
            console.log("customVariableEvent", customVariableEvent);
            // 如果列表为空且未初始化，先获取初始数据
            if (variableUpdateEventsRef.current.length === 0 && !isInitializingRef.current && !hasInitializedRef.current) {
                await getInitVariableData();
            }
            
            // 然后执行正常的插入/更新逻辑
            setVariableUpdateEvents((prev) => {
                const newVarName = customVariableEvent.customVariable.varName;
                // 查找是否存在相同 varName 的数据
                const existingIndex = prev.findIndex(
                    (event) => isCustomVariableUpdateEvent(event) && event.customVariable.varName === newVarName
                );
                
                if (existingIndex !== -1) {
                    // 替换现有的数据
                    const newPrev = [...prev];
                    newPrev[existingIndex] = customVariableEvent;
                    return newPrev;
                } else {
                    // 不存在则在前面添加新数据
                    return [customVariableEvent, ...prev];
                }
            });
        });

        customVariableSubscriptionRef.current = customVariableSubscription;

        // 创建系统变量数据流订阅
        const systemVariableStream = createSystemVariableStream(true);
        const systemVariableSubscription = systemVariableStream.subscribe(async (systemVariableEvent) => {
            // 如果列表为空且未初始化，先获取初始数据
            if (variableUpdateEventsRef.current.length === 0 && !isInitializingRef.current && !hasInitializedRef.current) {
                await getInitVariableData();
            }
            
            // 然后执行正常的插入/更新逻辑
            setVariableUpdateEvents((prev) => {
                const newVarName = systemVariableEvent.sysVariable.varName;
                // 查找是否存在相同 varName 的数据
                const existingIndex = prev.findIndex(
                    (event) => isSystemVariableUpdateEvent(event) && event.sysVariable.varName === newVarName
                );
                
                if (existingIndex !== -1) {
                    // 替换现有的数据
                    const newPrev = [...prev];
                    newPrev[existingIndex] = systemVariableEvent;
                    return newPrev;
                } else {
                    // 不存在则在前面添加新数据
                    return [systemVariableEvent, ...prev];
                }
            });
        });
        systemVariableSubscriptionRef.current = systemVariableSubscription;

        return () => {
            customVariableSubscriptionRef.current?.unsubscribe();
            customVariableSubscriptionRef.current = null;
            systemVariableSubscriptionRef.current?.unsubscribe();
            systemVariableSubscriptionRef.current = null;
        };
    }, [getInitVariableData]);

    // 直接传入事件数组（若需要可在无 SSE 时回退为 mockData）
    // 这里保留最简实现：仅使用实时和初始化事件
    return <BacktestVariableTable data={variableUpdateEvents} title="策略变量" showTitle />;
});

export default StrategyVariable;


