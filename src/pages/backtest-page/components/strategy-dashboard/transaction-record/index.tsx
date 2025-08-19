import { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import type { Subscription } from "rxjs";
import { createTransactionStream } from "@/hooks/obs/backtest-strategy-data-obs";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";
import BacktestTransactionTable from "@/components/table/backtest-transaction-table";
import { getVirtualTransaction } from "@/service/backtest-strategy"


interface TransactionRecordProps {
    strategyId: number;
}

export interface TransactionRecordRef {
    clearTransactions: () => void;
}

const TransactionRecord = forwardRef<TransactionRecordRef, TransactionRecordProps>(({ strategyId }, ref) => {
    

	const [transactionData, setTransactionData] = useState<VirtualTransaction[]>([]);
	const transactionStreamSubscription = useRef<Subscription | null>(null);

    // 暴露清空交易明细的方法
    useImperativeHandle(ref, () => ({
        clearTransactions: () => {
            setTransactionData([]);
        }
    }), []);

    const getVirtualTransactionData = useCallback(async () => {
        const virtualTransactionData = await getVirtualTransaction(strategyId) as VirtualTransaction[];
        // 倒序排列
        setTransactionData(virtualTransactionData.reverse());
    }, [strategyId]);

    


    // 初始化交易明细数据
    useEffect(() => {
        getVirtualTransactionData();
    }, [getVirtualTransactionData]);

	useEffect(() => {
		if (!transactionStreamSubscription.current) {
			const transactionStream = createTransactionStream();
			const subscription = transactionStream.subscribe((transactionEvent) => {
				const transaction = transactionEvent.transaction;
                // 使用函数式更新来避免闭包问题
                setTransactionData((prev) => {
                    const existingTransaction = prev.find((t) => t.transactionId === transaction.transactionId);
                    if (existingTransaction) {
                        // 如果交易明细已经存在，则整个替换
                        return prev.map((t) => t.transactionId === transaction.transactionId ? transaction : t);
                    } else {
                        // 倒序插入，时间越晚的越靠前
                        return [transaction, ...prev];
                    }
                });
			});
			transactionStreamSubscription.current = subscription;
		}

		return () => {
			transactionStreamSubscription.current?.unsubscribe();
		};
	}, []);
    

    

	return (
        <div>
            <BacktestTransactionTable 
                title="交易明细" 
                showTitle={false} 
                data={transactionData}
            />
        </div>
    );
});

 TransactionRecord.displayName = 'TransactionRecord';

export default TransactionRecord;