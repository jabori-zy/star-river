import { DataTable } from "@/components/common-table";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";
import { transactionColumns } from "./columns";

interface TransactionTableProps {
	data: VirtualTransaction[];
}

export function TransactionTable({ data }: TransactionTableProps) {
	return (
		<DataTable
			columns={transactionColumns}
			data={data}
			enableSorting
			enableFiltering
			enablePagination
			searchKeys={["symbol", "orderId", "exchange", "nodeName"]}
			pageSize={10}
			pageSizeOptions={[5, 10, 15, 20, 25, 30, 50, 100]}
		/>
	);
}
