export type { VirtualTransaction } from "./virtual-transaction";

export type TransactionId = number;

// export enum TransactionType {
// 	Open = "OPEN", // Open position
// 	Close = "CLOSE", // Close position
// }

// Transaction direction
export enum TransactionSide {
	Long = "Long", // Long position
	Short = "Short", // Short position
}

// Get transaction direction style
export const getTransactionSideStyle = (side: TransactionSide): string => {
	switch (side) {
		case TransactionSide.Long:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case TransactionSide.Short:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
	}
};

// Get transaction direction text
export const getTransactionSideText = (
	side: TransactionSide,
	t: (key: string) => string,
): string => {
	switch (side) {
		case TransactionSide.Long:
			return t("market.transactionSide.long");
		case TransactionSide.Short:
			return t("market.transactionSide.short");
		default:
			return side;
	}
};
