import { useMemo } from "react";
import { DateTime } from "luxon";
import { GitBranch, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReceiveIfElseNodeEvent } from "@/types/strategy-event/event-received-event";

interface IfElseNodeEventStats {
	eventName: string;
	caseId: number | null;
	latestCycleId: number;
	receiveCount: number;
	lastDatetime: string;
}

interface IfElseNodeEventShowProps {
	events: ReceiveIfElseNodeEvent[];
	sourceHandleId: string | null;
}

export function IfElseNodeEventShow({ events, sourceHandleId }: IfElseNodeEventShowProps) {
	// Filter events based on sourceHandleId and group by eventName + caseId
	const stats = useMemo(() => {
		if (events.length === 0) return [];

		// Parse sourceHandleId to get caseId for if-else node
		// Returns: { isElse: true } for else output, { isElse: false, caseId: number } for case output
		const parseIfElseHandleId = (handleId: string | null) => {
			if (!handleId) return null;
			
			// Check if it's else output: ends with "_else_output"
			if (handleId.endsWith("_else_output")) {
				return { isElse: true, caseId: null };
			}
			
			// Check if it's case output: ends with "_output_<number>"
			const match = handleId.match(/_output_(\d+)$/);
			if (match) {
				const caseId = Number.parseInt(match[1], 10);
				return { isElse: false, caseId };
			}
			
			return null;
		};

		// Parse handle to determine which output this node is connected to
		const handleInfo = parseIfElseHandleId(sourceHandleId);
		if (!handleInfo) {
			// Cannot determine handle type, show no events
			return [];
		}

		// Filter events based on the connected output
		const filteredEvents = events.filter((event) => {
			if (handleInfo.isElse) {
				// Connected to else output, only accept events with caseId === null
				return event.caseId === null;
			}
			// Connected to case output, only accept events with matching caseId
			return event.caseId === handleInfo.caseId;
		});

		const statsMap = new Map<string, IfElseNodeEventStats>();

		for (const event of filteredEvents) {
			const key = `${event.eventName}-${event.caseId ?? "none"}`;

			if (!statsMap.has(key)) {
				statsMap.set(key, {
					eventName: event.eventName,
					caseId: event.caseId,
					latestCycleId: event.cycleId,
					receiveCount: 0,
					lastDatetime: event.datetime,
				});
			}

			const stat = statsMap.get(key);
			if (stat) {
				stat.receiveCount++;
				// Update if this event has a larger cycleId
				if (event.cycleId > stat.latestCycleId) {
					stat.latestCycleId = event.cycleId;
					stat.lastDatetime = event.datetime;
				}
			}
		}

		return Array.from(statsMap.values()).sort((a, b) => {
			// Sort by latest datetime descending
			return (
				DateTime.fromISO(b.lastDatetime).toMillis() -
				DateTime.fromISO(a.lastDatetime).toMillis()
			);
		});
	}, [events, sourceHandleId]);

	const totalCount = events.length;
	const lastUpdate =
		stats.length > 0
			? DateTime.fromISO(stats[0].lastDatetime).toFormat("yyyy-MM-dd HH:mm:ss")
			: "";

	// Format time to HH:mm:ss
	const formatTime = (datetime: string) => {
		const dt = DateTime.fromISO(datetime);
		return dt.isValid ? dt.toFormat("HH:mm:ss") : datetime;
	};

	// Get badge color based on event name
	const getEventBadgeColor = (eventName: string) => {
		if (eventName === "case-true") {
			return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/50";
		}
		if (eventName === "case-false") {
			return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/50";
		}
		if (eventName === "else-true") {
			return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50";
		}
		if (eventName === "else-false") {
			return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/50";
		}
		return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-300 dark:border-gray-800/50";
	};

	return (
		<div className="w-full min-w-[260px] max-w-md rounded-lg border">
			{/* Header */}
			<div className="pb-2 px-3 pt-2">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1.5 text-xs font-semibold">
						<GitBranch className="h-3.5 w-3.5 text-primary" />
						<span className="whitespace-nowrap">If-Else Node Events</span>
					</div>
					<Badge variant="default" className="text-[10px] font-semibold shrink-0 px-1.5 py-0">
						{totalCount}
					</Badge>
				</div>
			</div>

			{/* Content */}
			<div className="pb-2 px-3">
				{stats.length === 0 ? (
					<div className="text-center text-xs text-muted-foreground py-4">
						No if-else node events received yet
					</div>
				) : (
					<>
						<ScrollArea className="max-h-[120px] pr-1.5 -mr-1.5">
							<div className="space-y-1.5 pr-1.5">
								{stats.map((stat, index) => (
									<div
										key={`${stat.eventName}-${stat.caseId}-${index}`}
										className="rounded-md border bg-card p-2 transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:border-primary/30"
									>
										<div className="flex items-start justify-between mb-1 gap-1.5">
											<div className="flex items-center gap-1.5 flex-1 min-w-0">
												{stat.caseId !== null && (
													<Badge
														variant="secondary"
														className="text-[10px] shrink-0 font-medium px-1.5 py-0"
													>
														Case #{stat.caseId}
													</Badge>
												)}
												<Badge
													variant="outline"
													className={`text-[10px] shrink-0 font-medium px-1.5 py-0 ${getEventBadgeColor(stat.eventName)}`}
												>
													{stat.eventName}
												</Badge>
											</div>
											<Badge
												variant="outline"
												className="text-[10px] ml-1 shrink-0 font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50 px-1.5 py-0"
											>
												×{stat.receiveCount}
											</Badge>
										</div>
										<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
											<span className="font-medium">Cycle #{stat.latestCycleId}</span>
											<span className="text-muted-foreground/50">•</span>
											<span className="tabular-nums">{formatTime(stat.lastDatetime)}</span>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
						<div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 pt-2 border-t">
							<Calendar className="h-2.5 w-2.5 shrink-0" />
							<span className="tabular-nums">Last: {lastUpdate}</span>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

