import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Subscription } from "rxjs";
import { PositionTable } from "@/components/new-table/backtest/position-table";
import BacktestPositionTable from "@/components/table/backtest-position-table";
import { createPositionStream } from "@/hooks/obs/backtest-strategy-event-obs";
import {
	getHisotryVirtualPosition,
	getVirtualPosition,
} from "@/service/backtest-strategy";
import { useBacktestUIStore } from "@/store/use-backtest-ui-store";
import type { VirtualPosition } from "@/types/position/virtual-position";
import PositionFilter from "./position-filter";

interface PositionRecordProps {
	strategyId: number;
}

export interface PositionRecordRef {
	clearPositions: () => void;
}

const PositionRecord = forwardRef<PositionRecordRef, PositionRecordProps>(
	({ strategyId }, ref) => {
		const [positionData, setPositionData] = useState<VirtualPosition[]>([]);

		const positionStreamSubscriptionRef = useRef<Subscription | null>(null);

		// Use global state management for isShowHistoryPosition
		const { getShowHistoryPosition, setShowHistoryPosition } =
			useBacktestUIStore();
		const isShowHistoryPosition = getShowHistoryPosition(strategyId);
		const setIsShowHistoryPosition = (show: boolean) =>
			setShowHistoryPosition(strategyId, show);

		// Expose method for clearing positions
		useImperativeHandle(
			ref,
			() => ({
				clearPositions: () => {
					setPositionData([]);
				},
			}),
			[],
		);

		const getVirtualPositionData = useCallback(async () => {
			const virtualPositionData = await getVirtualPosition(strategyId);
			const historyPositionData = await getHisotryVirtualPosition(strategyId);
			// If showing history positions, merge current and history positions
			if (isShowHistoryPosition) {
				setPositionData(
					[...virtualPositionData, ...historyPositionData].reverse(),
				);
			} else {
				setPositionData(virtualPositionData.reverse());
			}
		}, [strategyId, isShowHistoryPosition]);

		// Initialize position data, also re-fetch when isShowHistoryPosition changes
		useEffect(() => {
			getVirtualPositionData();
		}, [getVirtualPositionData]);

		useEffect(() => {
			// Clean up previous subscription (if exists)
			if (positionStreamSubscriptionRef.current) {
				positionStreamSubscriptionRef.current.unsubscribe();
				positionStreamSubscriptionRef.current = null;
			}

			// Create new subscription
			const positionStream = createPositionStream();
			const subscription = positionStream.subscribe((positionEvent) => {
				if (
					positionEvent.event === "position-created-event" ||
					positionEvent.event === "position-updated-event"
				) {
					const position = positionEvent.virtualPosition;
					// Use functional update to avoid closure issues
					setPositionData((prev) => {
						const existingPosition = prev.find(
							(p) => p.positionId === position.positionId,
						);
						if (existingPosition) {
							// If position already exists, replace it entirely
							return prev.map((p) =>
								p.positionId === position.positionId ? position : p,
							);
						} else {
							// Insert in reverse order, later times come first
							return [position, ...prev];
						}
					});
				} else if (positionEvent.event === "position-closed-event") {
					// If showing history positions, don't delete closed positions
					if (!isShowHistoryPosition) {
						// Delete closed positions
						setPositionData((prev) =>
							prev.filter(
								(p) =>
									p.positionId !== positionEvent.virtualPosition.positionId,
							),
						);
					}
				}
			});

			positionStreamSubscriptionRef.current = subscription;

			return () => {
				positionStreamSubscriptionRef.current?.unsubscribe();
				positionStreamSubscriptionRef.current = null;
			};
		}, [isShowHistoryPosition]);

		return (
			<div className="flex flex-col h-full">
				<div className="flex justify-start mb-2">
					<PositionFilter
						isShowHistoryPositions={isShowHistoryPosition}
						onShowHistoryPositions={setIsShowHistoryPosition}
					/>
				</div>
				<div className="h-full w-full">
					<PositionTable data={positionData} />
				</div>
			</div>
		);
	},
);

PositionRecord.displayName = "PositionRecord";

export default PositionRecord;
