import { Check, ChevronDown, Copy } from "lucide-react";
import { DateTime } from "luxon";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LogEvent } from "./types";
import { getLogLevelStyle } from "./utils";

interface LogSectionProps {
	logs: LogEvent[];
}

const LogSection: React.FC<LogSectionProps> = ({ logs }) => {
	// Copy state management
	const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
		{},
	);
	// Scroll container reference
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	// Whether user is near bottom (for smart scrolling)
	const [isNearBottom, setIsNearBottom] = useState(true);
	// Whether there are new logs but user is not at bottom
	const [hasNewLogs, setHasNewLogs] = useState(false);
	// Whether auto-scrolling is in progress (to prevent button flickering)
	const [isAutoScrolling, setIsAutoScrolling] = useState(false);
	// Use ref to track auto-scroll state, avoiding useEffect dependency issues
	const isAutoScrollingRef = useRef(false);

	// Detect if user is near bottom
	const handleScroll = useCallback((scrollContainer: Element) => {
		const threshold = 50; // 50px threshold
		const isAtBottom =
			scrollContainer.scrollHeight -
				scrollContainer.scrollTop -
				scrollContainer.clientHeight <=
			threshold;

		// Use debouncing to avoid frequent state updates, reduce debounce time to improve responsiveness
		setTimeout(() => {
			if (!isAutoScrollingRef.current) {
				// Only update state when not auto-scrolling
				setIsNearBottom(isAtBottom);
				if (isAtBottom) {
					setHasNewLogs(false);
				}
			}
		}, 50); // Reduce debounce time to improve responsiveness
	}, []);

	// Manually scroll to bottom
	const scrollToBottom = () => {
		const scrollContainer = scrollAreaRef.current?.querySelector(
			"[data-radix-scroll-area-viewport]",
		);
		if (scrollContainer) {
			isAutoScrollingRef.current = true;
			setIsAutoScrolling(true);
			setHasNewLogs(false);
			scrollContainer.scrollTo({
				top: scrollContainer.scrollHeight,
				behavior: "smooth",
			});

			// Reset auto-scroll state after scrolling completes
			setTimeout(() => {
				isAutoScrollingRef.current = false;
				setIsAutoScrolling(false);
				setIsNearBottom(true);
			}, 300); // Reduce reset time for manual scrolling
		}
	};

	// Auto-scroll to bottom when logs update (only when user is near bottom)
	useEffect(() => {
		if (scrollAreaRef.current && logs.length > 0) {
			if (isNearBottom && !isAutoScrollingRef.current) {
				const scrollContainer = scrollAreaRef.current.querySelector(
					"[data-radix-scroll-area-viewport]",
				);
				if (scrollContainer) {
					isAutoScrollingRef.current = true;
					setIsAutoScrolling(true);
					// Use requestAnimationFrame to ensure scrolling after DOM update completes
					requestAnimationFrame(() => {
						// Check scroll distance, use instant scroll if small, otherwise use smooth scroll
						const scrollDistance =
							scrollContainer.scrollHeight -
							scrollContainer.scrollTop -
							scrollContainer.clientHeight;
						const shouldUseInstantScroll = scrollDistance < 100; // Instant scroll when less than 100px

						scrollContainer.scrollTo({
							top: scrollContainer.scrollHeight,
							behavior: shouldUseInstantScroll ? "auto" : "smooth",
						});

						// Adjust reset time based on scroll method
						const resetTime = shouldUseInstantScroll ? 50 : 150;
						setTimeout(() => {
							isAutoScrollingRef.current = false;
							setIsAutoScrolling(false);
						}, resetTime);
					});
				}
			} else if (!isNearBottom && !isAutoScrollingRef.current) {
				// If user is not at bottom and not auto-scrolling, show new logs notification
				setHasNewLogs(true);
			}
		}
	}, [logs, isNearBottom]); // Remove isAutoScrolling dependency, use ref instead

	// Set up scroll listener
	useEffect(() => {
		const scrollContainer = scrollAreaRef.current?.querySelector(
			"[data-radix-scroll-area-viewport]",
		);
		if (scrollContainer) {
			const onScroll = () => handleScroll(scrollContainer);
			scrollContainer.addEventListener("scroll", onScroll);

			// Initial check
			handleScroll(scrollContainer);

			return () => {
				scrollContainer.removeEventListener("scroll", onScroll);
			};
		}
	}, [handleScroll]); // Depends on handleScroll

	const handleCopyError = (log: LogEvent, index: number) => {
		const logKey = `${log.datetime}-${index}`;
		const copyContent = [
			`原因: ${log.message}`,
			`错误代码: ${log.errorCode}`,
			log.errorCodeChain ? `错误链: ${log.errorCodeChain.join(" → ")}` : null,
		]
			.filter(Boolean)
			.join("\n");

		navigator.clipboard.writeText(copyContent);

		// Set copy state
		setCopiedStates((prev) => ({ ...prev, [logKey]: true }));

		// Restore after 2 seconds
		setTimeout(() => {
			setCopiedStates((prev) => ({ ...prev, [logKey]: false }));
		}, 2000);
	};

	return (
		<div className="flex flex-col h-full space-y-2">
			<div className="text-sm font-medium text-gray-700 shrink-0">
				日志
			</div>
			<div className="border border-gray-300 rounded-lg bg-gray-50 shadow-inner flex-1 min-h-0 relative">
				<ScrollArea ref={scrollAreaRef} className="h-45">
					<div className="p-4 space-y-2">
						{logs.length === 0 ? (
							<div className="text-center text-gray-500 py-8">
								等待日志数据...
							</div>
						) : (
							logs.map((log, index) => {
								const style = getLogLevelStyle(log.logLevel);
								const isStrategyLog = log.type === "strategy";
								const logKey = `${log.datetime}-${index}`;

								return (
									<div key={logKey} className="space-y-1">
										<div className="flex items-center space-x-2 text-xs">
											{style.icon}
											<span className="text-gray-400">
												[
												{DateTime.fromISO(log.datetime).toFormat(
													"yyyy-MM-dd HH:mm:ss",
												)}
												]
											</span>
											<span className="text-gray-600 font-medium">
												{isStrategyLog
													? `${"strategyName" in log ? log.strategyName || "未知策略" : "未知策略"}`
													: `${"nodeName" in log ? log.nodeName || "未知节点" : "未知节点"}`}
											</span>
										</div>
										<div className="text-gray-900 pl-6 text-sm">
											{log.message}
										</div>
										{log.errorCode && (
											<div className="pl-6 space-y-1">
												<div className="flex items-center space-x-2">
													<span className="text-xs text-red-600 font-medium">
														错误代码: {log.errorCode}
													</span>
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
																	{copiedStates[logKey] ? "已复制" : "复制详情"}
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

				{/* New log notification button */}
				{hasNewLogs && !isNearBottom && !isAutoScrolling && (
					<div className="absolute bottom-4 right-4">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="default"
										size="icon"
										onClick={scrollToBottom}
										className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200"
									>
										<ChevronDown className="w-5 h-5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>滚动到底部</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				)}
			</div>
		</div>
	);
};

export default LogSection;
