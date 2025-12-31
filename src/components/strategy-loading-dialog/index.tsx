// import { DateTime } from "luxon";
// import type React from "react";
// import { useEffect, useRef } from "react";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// } from "@/components/ui/dialog";
// import { StrategyState } from "@/types/strategy-event/strategy-state-log-event";
// import LogSection from "./log-section";
// import StatusSection from "./status-section";
// import type { StrategyLoadingDialogProps } from "./types";

// const StrategyLoadingDialog: React.FC<StrategyLoadingDialogProps> = ({
// 	open,
// 	onOpenChange,
// 	logs,
// 	currentStage,
// 	title = "Strategy Loading", // Default title
// 	onStrategyStateChange,
// }) => {
// 	// Track triggered callback states to avoid duplicate calls
// 	const triggeredStatesRef = useRef<Set<string>>(new Set());

// 	// Listen for strategy state changes
// 	useEffect(() => {
// 		if (!onStrategyStateChange) return;

// 		// Filter strategy logs
// 		const strategyLogs = logs.filter((log) => "strategyState" in log);
// 		if (strategyLogs.length === 0) return;

// 		// Get the latest strategy log
// 		const latestStrategyLog = strategyLogs.sort(
// 			(a, b) =>
// 				DateTime.fromISO(b.datetime).toMillis() -
// 				DateTime.fromISO(a.datetime).toMillis(),
// 		)[0];

// 		if ("strategyState" in latestStrategyLog) {
// 			const strategyState = latestStrategyLog.strategyState;
// 			const stateKey = `${strategyState}-${latestStrategyLog.datetime}`;

// 			// Check if this state callback has already been triggered
// 			if (!triggeredStatesRef.current.has(stateKey)) {
// 				if (strategyState === StrategyState.Ready) {
// 					onStrategyStateChange("ready");
// 					triggeredStatesRef.current.add(stateKey);
// 				} else if (strategyState === StrategyState.Failed) {
// 					onStrategyStateChange("failed");
// 					triggeredStatesRef.current.add(stateKey);
// 				}
// 			}
// 		}
// 	}, [logs, onStrategyStateChange]);

// 	// Add type markers to logs and sort them
// 	const allLogs = logs
// 		.map((log) => ({
// 			...log,
// 			type: ("strategyState" in log ? "strategy" : "node") as
// 				| "strategy"
// 				| "node",
// 		}))
// 		.sort(
// 			(a, b) =>
// 				DateTime.fromISO(a.datetime).toMillis() -
// 				DateTime.fromISO(b.datetime).toMillis(),
// 		);

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			{/* [&>button:last-child]:hidden */}
// 			<DialogContent
// 				className="max-w-2xl flex flex-col "
// 				aria-describedby={undefined}
// 			>
// 				<DialogHeader className="shrink-0">
// 					<DialogTitle>{title}</DialogTitle>
// 				</DialogHeader>

// 				<div className="flex-1 flex flex-col space-y-4 overflow-hidden">
// 					{/* Top status section */}
// 					<div className="shrink-0">
// 						<StatusSection currentStage={currentStage} logs={logs} />
// 					</div>

// 					{/* Log section - fixed height */}
// 					<div className="flex-1 min-h-0 overflow-hidden">
// 						<LogSection logs={allLogs} />
// 					</div>
// 				</div>
// 			</DialogContent>
// 		</Dialog>
// 	);
// };

// export default StrategyLoadingDialog;
