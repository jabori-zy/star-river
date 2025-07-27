import type React from "react";
import { createContext, useEffect, useState } from "react";
import useStrategySSE from "@/hooks/use-strategySSE";

export interface StrategyEventContextProps {
	// message: StrategyMessage | null;
	event: Record<string, any[]>;
	isSSEConnected: boolean;
	connectSSE: () => void;
	disconnectSSE: () => void;
	clearNodeMessages: (nodeId: string) => void;
}

const StrategyEventContext = createContext<StrategyEventContextProps | null>(
	null,
);

function StrategyEventProvider({
	children,
	strategyId,
}: {
	children: React.ReactNode;
	strategyId: number;
}) {
	const [isSSEConnected, setIsSSEConnected] = useState(false);

	const { strategeEvent, clearNodeMessages } = useStrategySSE(
		strategyId,
		isSSEConnected,
	);
	const [event, setEvent] = useState<Record<string, any[]>>([]);

	useEffect(() => {
		setEvent(strategeEvent);
		// setStrategyMessage(strategyMessageQuene);
	}, [strategeEvent]);

	const connectSSE = () => setIsSSEConnected(true);
	const disconnectSSE = () => setIsSSEConnected(false);

	return (
		<StrategyEventContext.Provider
			value={{
				event: event,
				clearNodeMessages,
				isSSEConnected,
				connectSSE,
				disconnectSSE,
			}}
		>
			{children}
		</StrategyEventContext.Provider>
	);
}

// 分别导出 Context 和 Provider
export { StrategyEventContext as StrategyMessageContext };
export { StrategyEventProvider as StrategyMessageProvider };
