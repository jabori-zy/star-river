import { DataTable } from "@/components/common-table";
import type { VirtualOrder } from "@/types/order/virtual-order";
import { useOrderColumns } from "./columns";

interface OrderTableProps {
	data: VirtualOrder[];
}

export function OrderTable({ data }: OrderTableProps) {
	const columns = useOrderColumns();

	return (
		<DataTable
			columns={columns}
			data={data}
			enableSorting
			enableFiltering
			enablePagination
			searchKeys={["symbol", "orderId", "exchange"]}
			pageSize={10}
			pageSizeOptions={[10, 20, 50, 100]}
		/>
	);
}
