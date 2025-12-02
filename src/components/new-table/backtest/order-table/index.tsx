import { DataTable } from "@/components/common-table";
import type { VirtualOrder } from "@/types/order/virtual-order";
import { orderColumns } from "./columns";

interface OrderTableProps {
	data: VirtualOrder[];
}

export function OrderTable({ data }: OrderTableProps) {
	return (
		<DataTable
			columns={orderColumns}
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
