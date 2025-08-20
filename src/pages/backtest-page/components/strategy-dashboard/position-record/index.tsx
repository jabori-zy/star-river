import { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import type { Subscription } from "rxjs";
import { createPositionStream } from "@/hooks/obs/backtest-strategy-data-obs";
import type { VirtualPosition } from "@/types/position/virtual-position";
import BacktestPositionTable from "@/components/table/backtest-position-table";
import { getVirtualPosition } from "@/service/backtest-strategy"


interface PositionRecordProps {
    strategyId: number;
}

export interface PositionRecordRef {
    clearPositions: () => void;
}

const PositionRecord = forwardRef<PositionRecordRef, PositionRecordProps>(({ strategyId }, ref) => {
    

	const [positionData, setPositionData] = useState<VirtualPosition[]>([]);
	const [positionStreamSubscription, setPositionStreamSubscription] = useState<Subscription | null>(null);

    // 暴露清空持仓的方法
    useImperativeHandle(ref, () => ({
        clearPositions: () => {
            setPositionData([]);
        }
    }), []);

    const getVirtualPositionData = useCallback(async () => {
        const virtualPositionData = await getVirtualPosition(strategyId) as VirtualPosition[];
        // 倒序排列
        setPositionData(virtualPositionData.reverse());
    }, [strategyId]);

    


    // 初始化持仓数据
    useEffect(() => {
        getVirtualPositionData();
    }, [getVirtualPositionData]);

	useEffect(() => {
		if (!positionStreamSubscription) {
			const positionStream = createPositionStream();
			const subscription = positionStream.subscribe((positionEvent) => {
                if (positionEvent.event === "position-created" || positionEvent.event === "position-updated") {
                    const position = positionEvent.virtualPosition;
                    // 使用函数式更新来避免闭包问题
                    setPositionData((prev) => {
                        const existingPosition = prev.find((p) => p.positionId === position.positionId);
                        if (existingPosition) {
                            // 如果持仓已经存在，则整个替换
                            return prev.map((p) => p.positionId === position.positionId ? position : p);
                        } else {
                            // 倒序插入，时间越晚的越靠前
                            return [position, ...prev];
                        }
                    });
                    
                }

                else if (positionEvent.event === "position-closed") {
                    // 删除已平仓的持仓
                    const newPositionData = positionData.filter((p) => p.positionId !== positionEvent.virtualPosition.positionId);
                    setPositionData(newPositionData);
                    
                }
				
			});
			setPositionStreamSubscription(subscription);
		}

		return () => {
			positionStreamSubscription?.unsubscribe();
		};
	}, [positionStreamSubscription, positionData.filter]);
    

    

	return (
        <div>
            <BacktestPositionTable 
                title="持仓记录" 
                showTitle={false} 
                data={positionData}
            />
        </div>
    );
});

PositionRecord.displayName = 'PositionRecord';

export default PositionRecord;