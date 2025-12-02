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

		// 使用全局状态管理isShowHistoryPosition
		const { getShowHistoryPosition, setShowHistoryPosition } =
			useBacktestUIStore();
		const isShowHistoryPosition = getShowHistoryPosition(strategyId);
		const setIsShowHistoryPosition = (show: boolean) =>
			setShowHistoryPosition(strategyId, show);

		// 暴露清空持仓的方法
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
			// 如果显示历史持仓，则将当前持仓和历史持仓合并
			if (isShowHistoryPosition) {
				setPositionData(
					[...virtualPositionData, ...historyPositionData].reverse(),
				);
			} else {
				setPositionData(virtualPositionData.reverse());
			}
		}, [strategyId, isShowHistoryPosition]);

		// 初始化持仓数据，当isShowHistoryPosition变化时也重新获取
		useEffect(() => {
			getVirtualPositionData();
		}, [getVirtualPositionData]);

		useEffect(() => {
			// 清理之前的订阅（如果存在）
			if (positionStreamSubscriptionRef.current) {
				positionStreamSubscriptionRef.current.unsubscribe();
				positionStreamSubscriptionRef.current = null;
			}

			// 创建新的订阅
			const positionStream = createPositionStream();
			const subscription = positionStream.subscribe((positionEvent) => {
				if (
					positionEvent.event === "position-created-event" ||
					positionEvent.event === "position-updated-event"
				) {
					const position = positionEvent.virtualPosition;
					// 使用函数式更新来避免闭包问题
					setPositionData((prev) => {
						const existingPosition = prev.find(
							(p) => p.positionId === position.positionId,
						);
						if (existingPosition) {
							// 如果持仓已经存在，则整个替换
							return prev.map((p) =>
								p.positionId === position.positionId ? position : p,
							);
						} else {
							// 倒序插入，时间越晚的越靠前
							return [position, ...prev];
						}
					});
				} else if (positionEvent.event === "position-closed-event") {
					// 如果显示历史持仓，则不删除已平仓的持仓
					if (!isShowHistoryPosition) {
						// 删除已平仓的持仓
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
