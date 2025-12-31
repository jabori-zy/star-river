import { Check, Copy, Terminal } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	isNodeStateErrorLog,
	isStrategyStateErrorLog,
	type NodeStateLogEvent,
	type StrategyStateLogEvent,
} from "@/types/strategy-event/strategy-state-log-event";
import { formatTimeOnly } from "@/utils/date-format";
import { getLogLevelStyle } from "./utils";
import { useTranslation } from "react-i18next";

interface LogDisplayProps {
	logs: (StrategyStateLogEvent | NodeStateLogEvent)[];
}

export const LogDisplay: React.FC<LogDisplayProps> = ({ logs }) => {
	const { t } = useTranslation();
	const lastLogRef = useRef<HTMLDivElement>(null);
	const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
		{},
	);

	// Auto-scroll to latest log
	// biome-ignore lint/correctness/useExhaustiveDependencies: logs is need
	useEffect(() => {
		if (lastLogRef.current) {
			lastLogRef.current.scrollIntoView({
				behavior: "smooth",
				block: "end",
			});
		}
	}, [logs]);

	// Copy error details to clipboard
	const handleCopyError = (
		log: StrategyStateLogEvent | NodeStateLogEvent,
		index: number,
	) => {
		const logKey = `${log.datetime}-${index}`;

		// Build copy content
		const copyContent = [
			`Reason: ${log.message}`,
			`Error Code: ${"errorCode" in log ? log.errorCode : "N/A"}`,
			"errorCodeChain" in log && log.errorCodeChain
				? `Error Chain: ${log.errorCodeChain.join(" → ")}`
				: null,
			"report" in log && log.report ? `Report: ${log.report}` : null,
		]
			.filter(Boolean)
			.join("\n");

		// Copy to clipboard
		navigator.clipboard.writeText(copyContent);

		// Set copied state
		setCopiedStates((prev) => ({ ...prev, [logKey]: true }));

		// Reset after 2 seconds
		setTimeout(() => {
			setCopiedStates((prev) => ({ ...prev, [logKey]: false }));
		}, 2000);
	};

	return (
		<div className="flex flex-col h-full space-y-2">
			<div className="flex items-center space-x-2 text-sm font-medium text-gray-700 shrink-0">
				<Terminal className="w-4 h-4 text-gray-500" />
				<span className="text-gray-700 font-medium">Logs</span>
			</div>
			<div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 flex-1 min-h-0 relative">
				<ScrollArea className="h-64">
					<div className="p-4 space-y-2">
						{logs.length === 0 ? (
							<div className="text-center text-gray-500 py-8">
								Waiting for log data...
							</div>
						) : (
							logs.map((log, index) => {
								const style = getLogLevelStyle(log.logLevel);
								const logKey = `${log.datetime}-${index}`;
								const isLastLog = index === logs.length - 1;

								// Use type guards to check if error log
								const isErrorLog =
									isStrategyStateErrorLog(log) || isNodeStateErrorLog(log);
								const errorCode = "errorCode" in log ? log.errorCode : null;

								return (
									<div
										key={logKey}
										className="space-y-1"
										ref={isLastLog ? lastLogRef : null}
									>
										<div className="flex items-center space-x-2 text-xs">
											{style.icon}
											<span className="text-gray-400">
												{formatTimeOnly(log.datetime, t)}
											</span>
										</div>
										<div className="text-gray-900 pl-6 text-sm">
											{log.message}
										</div>
										{isErrorLog && (
											<div className="pl-6 space-y-1">
												<div className="flex items-center space-x-2">
													<span className="text-xs text-red-600 font-medium">
														Error Code: {errorCode}
													</span>

													{/* Copy button */}
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => handleCopyError(log, index)}
																	disabled={copiedStates[logKey]}
																	className={`h-6 w-6 p-0 transition-all duration-200 ${
																		copiedStates[logKey]
																			? "text-red-600 bg-red-50 hover:bg-red-50"
																			: "text-gray-500 hover:text-red-600 hover:bg-red-50"
																	}`}
																>
																	{copiedStates[logKey] ? (
																		<Check className="w-3 h-3" />
																	) : (
																		<Copy className="w-3 h-3" />
																	)}
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<p>
																	{copiedStates[logKey]
																		? "Copied"
																		: "Copy Details"}
																</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											</div>
										)}
									</div>
								);
							})
						)}
					</div>
					<ScrollBar orientation="vertical" />
				</ScrollArea>
			</div>
		</div>
	);
};
