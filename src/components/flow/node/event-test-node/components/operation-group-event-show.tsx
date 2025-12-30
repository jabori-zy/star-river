import { useMemo } from "react";
import { DateTime } from "luxon";
import { Layers, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReceiveOperationGroupEvent } from "@/types/strategy-event/event-received-event";
import { parseKey } from "@/utils/parse-key";
import type { OperationKey } from "@/types/symbol-key";

interface OperationGroupEventStats {
	operationName: string;
	eventName: string;
	resultLength: number;
	latestCycleId: number;
	receiveCount: number;
	lastDatetime: string;
}

interface OperationGroupEventShowProps {
	events: ReceiveOperationGroupEvent[];
	sourceHandleId: string | null;
}

export function OperationGroupEventShow({ events, sourceHandleId }: OperationGroupEventShowProps) {
	// Filter events based on sourceHandleId and group by operationName + eventName
	const stats = useMemo(() => {
		if (events.length === 0) return [];

		// Filter events based on the connected output
		const filteredEvents = events.filter((event) => {
			if (!sourceHandleId) {
				return false;
			}
			return event.outputHandleId === sourceHandleId;
		});

		const statsMap = new Map<string, OperationGroupEventStats>();

		for (const event of filteredEvents) {
			// Parse operationKey to get name
			let operationName = "Unknown";
			try {
				const parsedKey = parseKey(event.operationKey) as OperationKey;
				operationName = parsedKey.name;
			} catch (error) {
				console.error("Failed to parse operationKey:", event.operationKey, error);
			}

			const key = `${operationName}-${event.eventName}`;

			if (!statsMap.has(key)) {
				statsMap.set(key, {
					operationName: operationName,
					eventName: event.eventName,
					resultLength: event.resultLength,
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
					stat.resultLength = event.resultLength;
				}
			}
		}

		return Array.from(statsMap.values()).sort((a, b) => {
			return (
				DateTime.fromISO(b.lastDatetime).toMillis() -
				DateTime.fromISO(a.lastDatetime).toMillis()
			);
		});
	}, [events, sourceHandleId]);

	const lastUpdate =
		stats.length > 0
			? DateTime.fromISO(stats[0].lastDatetime).toFormat("yyyy-MM-dd HH:mm:ss")
			: "";

	const formatTime = (datetime: string) => {
		const dt = DateTime.fromISO(datetime);
		return dt.isValid ? dt.toFormat("HH:mm:ss") : datetime;
	};

	return (
		<div className="w-full min-w-[260px] max-w-md rounded-lg border">
			{/* Header */}
			<div className="pb-2 px-3 pt-2">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1.5 text-xs font-semibold">
						<Layers className="h-3.5 w-3.5 text-primary" />
						<span className="whitespace-nowrap">Operation Group Events</span>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="pb-2 px-3">
				{stats.length === 0 ? (
					<div className="text-center text-xs text-muted-foreground py-4">
						No operation group events received yet
					</div>
				) : (
					<>
						<ScrollArea className="max-h-[120px] pr-1.5 -mr-1.5">
							<div className="space-y-1.5 pr-1.5">
								{stats.map((stat, index) => (
									<div
										key={`${stat.operationName}-${stat.eventName}-${index}`}
										className="rounded-md border bg-card p-2 transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:border-primary/30"
									>
										<div className="flex items-start justify-between mb-1 gap-1.5">
											<div className="flex items-center gap-1.5 flex-1 min-w-0">
												<Badge
													variant="secondary"
													className="text-[10px] shrink-0 font-medium px-1.5 py-0"
												>
													{stat.operationName}
												</Badge>
												<span className="text-xs font-medium truncate" title={stat.eventName}>
													{stat.eventName}
												</span>
											</div>
											<Badge
												variant="outline"
												className="text-[10px] ml-1 shrink-0 font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50 px-1.5 py-0"
											>
												×{stat.receiveCount}
											</Badge>
										</div>
										<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
											<span>Length: {stat.resultLength}</span>
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
