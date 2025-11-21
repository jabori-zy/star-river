import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { createBacktestStrategyStateLogStream } from "@/hooks/obs/backtest-strategy-state-log-obs";
import { useRef } from "react";
import { Subscription } from "rxjs";
import { StrategyRunState, TradeMode } from "@/types/strategy"
import { BacktestStrategyRunStatus } from "@/types/strategy/backtest-strategy";
import { BacktestNodeRunState } from "@/types/strategy/backtest-strategy";
import {
	isStrategyStateInfoLog,
	isNodeStateInfoLog,
	isNodeStateErrorLog,
	StrategyStateLogEvent,
	NodeStateLogEvent,
} from "@/types/strategy-event/strategy-state-log-event";
import { getNodeDefaultColor, NodeId, NodeType, getNodeIconName, getNodeTypeName } from "@/types/node";
import { getStrategyRunStateBadge } from "./utils";
import {DynamicIcon} from "lucide-react/dynamic";
import { useTranslation } from "react-i18next";
import { LogDisplay } from "./log";


interface StrategyLoadingDialogProps {
    title: string;
    open: boolean;
	tradeMode?: TradeMode;
	strategyId: number;
    onOpenChange: (open: boolean) => void;
	onStrategyStateChange: (state: StrategyRunState) => void;
	onOpenBacktestWindow: (strategyId: number) => void;
}



export const StrategyLoadingDialog: React.FC<StrategyLoadingDialogProps> = ({
    title,
    open,
	strategyId,
    onOpenChange,
	onStrategyStateChange,
	onOpenBacktestWindow,
}) => {

	const logStreamSubscriptionRef = useRef<Subscription | null>(null);
	const { t } = useTranslation();
	const [strategyRunState, setStrategyRunState] = useState<StrategyRunState>(BacktestStrategyRunStatus.Created);
	const [processingNode, setProcessingNode] = useState<{
		nodeId: NodeId,
		nodeName: string, 
		nodeType: NodeType, 
		nodeRunState: BacktestNodeRunState,
		message: string
	} | undefined>(undefined);
	const [logEvents, setLogEvents] = useState<(StrategyStateLogEvent | NodeStateLogEvent)[]>([]);



	const handleClearLogEvents = useCallback(() => {
		setLogEvents([]);
	}, []);

	useEffect(() => {	

		if (logStreamSubscriptionRef.current) {
			logStreamSubscriptionRef.current.unsubscribe();
			logStreamSubscriptionRef.current = null;
		}

		const logStream = createBacktestStrategyStateLogStream(true);
		logStreamSubscriptionRef.current = logStream.subscribe({
			next: (logEvent) => {
				setLogEvents(prevLogEvents => [...prevLogEvents, logEvent]);

				if (isStrategyStateInfoLog(logEvent)) {
					const currentStrategyRunState = logEvent.strategyState;
					if (currentStrategyRunState !== strategyRunState) {
						setStrategyRunState(currentStrategyRunState);
						onStrategyStateChange(currentStrategyRunState);
					}

				}

				if (isNodeStateInfoLog(logEvent)) {
					const nodeInfo = {
						nodeId: logEvent.nodeId,
						nodeName: logEvent.nodeName,
						nodeType: logEvent.nodeType,
						nodeRunState: logEvent.nodeState,
						message: logEvent.message
					};

					if (!processingNode) {
						setProcessingNode(nodeInfo);
					}

					if (processingNode && processingNode !== nodeInfo) {
						setProcessingNode(nodeInfo);
					}
				}

				if (isNodeStateErrorLog(logEvent)) {
					setStrategyRunState(BacktestStrategyRunStatus.Failed);
					onStrategyStateChange(BacktestStrategyRunStatus.Failed);
				}

			},
		});

		return () => {
			logStreamSubscriptionRef.current?.unsubscribe();
			logStreamSubscriptionRef.current = null;
		};
	}, []);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl flex flex-col min-h-100" aria-describedby={undefined}>
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center gap-2">
						{!(
							strategyRunState===BacktestStrategyRunStatus.Failed || 
							strategyRunState===BacktestStrategyRunStatus.Error ||
							strategyRunState===BacktestStrategyRunStatus.Ready ||
							strategyRunState===BacktestStrategyRunStatus.Stopped

						) && (
							<Spinner className="size-4 animate-spin" />
						)}
						{title}
						{getStrategyRunStateBadge(strategyRunState)}
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-row items-center justify-between gap-2 p-2 rounded-md border border-dashed border-gray-200 shadow-xs">

					{processingNode && (
						<>
							<div className="flex flex-row items-center gap-2 flex-1">
								<div
									className="p-1 rounded-sm flex-shrink-0"
									style={{ backgroundColor: getNodeDefaultColor(processingNode.nodeType) }}
								>
									<DynamicIcon name={getNodeIconName(processingNode.nodeType)} className="w-3 h-3 text-white flex-shrink-0" />
								</div>
								<div className="flex flex-col gap-1">
									<span className="text-sm text-gray-700 font-medium">{getNodeTypeName(processingNode.nodeType, t)}</span>
									<span className="text-xs text-gray-500">{processingNode.message}</span>
								</div>
							</div>

							{/* Pulsing dot indicator */}
							<span className="relative flex h-2 w-2 flex-shrink-0">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
							</span>
						</>
					)}
				</div>

				{/* Log display component */}
				<div className="flex-1 overflow-hidden min-h-0">
					<LogDisplay logs={logEvents} />
				</div>
				<DialogFooter>
					{strategyRunState===BacktestStrategyRunStatus.Ready && (
						<>
							<Button variant="outline" onClick={() => {
								handleClearLogEvents(); // clear log events
								onOpenChange(false); // close dialog
							}}>
								{t("common.close")}
							</Button>
							<Button onClick={() => {
								handleClearLogEvents(); // clear log events
								onOpenBacktestWindow(strategyId); // open backtest window
							}}>
								{t("desktop.strategyWorkflowPage.letGo")}
							</Button>
						</>
					)}
					{strategyRunState===BacktestStrategyRunStatus.Stopped && (
						<>
							<Button variant="outline" onClick={() => {
								handleClearLogEvents(); // clear log events
								onOpenChange(false); // close dialog
							}}>
								{t("common.close")}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};