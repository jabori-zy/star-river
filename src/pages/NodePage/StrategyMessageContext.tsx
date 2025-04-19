import React, { createContext, useState, useEffect } from 'react';
import useStrategySSE from '@/hooks/use-strategySSE';


export interface StrategyMessageContextType {
    // message: StrategyMessage | null;
    messages: Record<string, any[]>;
    isSSEConnected: boolean;
    connectSSE: () => void;
    disconnectSSE: () => void;
    clearNodeMessages: (nodeId: string) => void;
  }

const StrategyMessageContext = createContext<StrategyMessageContextType | null>(null);

function StrategyMessageProvider({ children, strategyId }: { children: React.ReactNode, strategyId: number }) {
    const [isSSEConnected, setIsSSEConnected] = useState(false);

    const { strategeMessage, clearNodeMessages } = useStrategySSE(strategyId, isSSEConnected);
    const [messages, setMessages] = useState<Record<string, any[]>>([]);


    useEffect(() => {
        setMessages(strategeMessage);
        // setStrategyMessage(strategyMessageQuene);
        
    }, [strategeMessage]);

   

    const connectSSE = () => setIsSSEConnected(true);
    const disconnectSSE = () => setIsSSEConnected(false);

    return (
        <StrategyMessageContext.Provider value={{ 
            messages,
            clearNodeMessages,
            isSSEConnected, 
            connectSSE, 
            disconnectSSE 
        }}>
            {children}
        </StrategyMessageContext.Provider>
    );
}

// 分别导出 Context 和 Provider
export { StrategyMessageContext };
export { StrategyMessageProvider };

