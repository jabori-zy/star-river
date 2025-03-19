import { useEffect, useState, useRef, useCallback } from "react";
import { flushSync } from 'react-dom';  // 引入 flushSync

const useStrategySSE = (strategyId: number, enabled: boolean = true) => {
    const eventSourceRef = useRef<EventSource | null>(null);
    const [strategeMessage, setStrategeMessage] = useState<Record<string, any[]>>({});
    const strategyMessageRef = useRef<Record<string, any[]>>({});


    // 添加清空节点消息的方法
    const clearNodeMessages = useCallback((nodeId: string) => {
        // 如果节点不存在或消息数组为空，直接返回
        if (!strategyMessageRef.current[nodeId] || strategyMessageRef.current[nodeId].length === 0) {
            return;
        }


        // 直接清空该节点的所有消息
        strategyMessageRef.current[nodeId] = [];
        
        // 更新状态
        setStrategeMessage({...strategyMessageRef.current});
        
    }, []);

    useEffect(() => {
        if (!enabled) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            return;
        }

        const sse = new EventSource("http://localhost:3100/strategy_sse?strategy_id=" + strategyId);
        eventSourceRef.current = sse;

        sse.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            const nodeId = newMessage.from_node_id;
            
            // 初始化节点消息数组和计数器
            if (!strategyMessageRef.current[nodeId]) {
                strategyMessageRef.current[nodeId] = [];
            }
            
            // 添加消息到数组
            strategyMessageRef.current[nodeId].push({
                ...newMessage,
            });
            
            // 使用 flushSync 强制同步更新
            flushSync(() => {
                setStrategeMessage({...strategyMessageRef.current});  // 创建新对象
                // console.log(`Node ${nodeId} received message`, strategyMessageRef.current[nodeId]);
            });
        };

        sse.onerror = (error) => {
            console.error('SSE错误:', error);
            sse.close();
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };

    }, [strategyId, enabled]);

    return { strategeMessage, clearNodeMessages };
}

export default useStrategySSE;
