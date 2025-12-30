import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Subscription } from "rxjs";
import { TransactionTable } from "@/components/new-table/backtest/transaction-table";
import { createTransactionStream } from "@/hooks/obs/backtest-strategy-event-obs";
import { getVirtualTransaction } from "@/service/backtest-strategy";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";

interface TransactionRecordProps {
	strategyId: number;
}

export interface TransactionRecordRef {
	clearTransactions: () => void;
}

const TransactionRecord = forwardRef<
	TransactionRecordRef,
	TransactionRecordProps
>(({ strategyId }, ref) => {
	const [transactionData, setTransactionData] = useState<VirtualTransaction[]>(
		[],
	);
	const transactionStreamSubscription = useRef<Subscription | null>(null);

	// Expose method for clearing transaction records
	useImperativeHandle(
		ref,
		() => ({
			clearTransactions: () => {
				setTransactionData([]);
			},
		}),
		[],
	);

	const getVirtualTransactionData = useCallback(async () => {
		const virtualTransactionData = (await getVirtualTransaction(
			strategyId,
		)) as VirtualTransaction[];
		// Sort in reverse order
		setTransactionData(virtualTransactionData.reverse());
	}, [strategyId]);

	// Initialize transaction record data
	useEffect(() => {
		getVirtualTransactionData();
	}, [getVirtualTransactionData]);

	useEffect(() => {
		if (!transactionStreamSubscription.current) {
			const transactionStream = createTransactionStream();
			const subscription = transactionStream.subscribe((transactionEvent) => {
				const transaction = transactionEvent.transaction;
				// Use functional update to avoid closure issues
				setTransactionData((prev) => {
					const existingTransaction = prev.find(
						(t) => t.transactionId === transaction.transactionId,
					);
					if (existingTransaction) {
						// If transaction record already exists, replace it entirely
						return prev.map((t) =>
							t.transactionId === transaction.transactionId ? transaction : t,
						);
					} else {
						// Insert in reverse order, later times come first
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
			<TransactionTable data={transactionData} />
		</div>
	);
});

TransactionRecord.displayName = "TransactionRecord";

export default TransactionRecord;
