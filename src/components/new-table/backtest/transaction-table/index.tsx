import { DataTable } from "@/components/common-table";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";
import { useTransactionColumns } from "./columns";

interface TransactionTableProps {
	data: VirtualTransaction[];
}

export function TransactionTable({ data }: TransactionTableProps) {
	const columns = useTransactionColumns();

	return (
		<DataTable
			columns={columns}
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
