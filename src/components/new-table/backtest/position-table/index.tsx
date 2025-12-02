import { DataTable } from "@/components/common-table";
import type { VirtualPosition } from "@/types/position/virtual-position";
import { positionColumns } from "./columns";

interface PositionTableProps {
	data: VirtualPosition[];
}

export function PositionTable({ data }: PositionTableProps) {
	return (
		<DataTable
			columns={positionColumns}
			data={data}
			enableSorting
			enableFiltering
			enablePagination
			searchKeys={["symbol", "positionId", "exchange"]}
			pageSize={10}
			pageSizeOptions={[5, 10, 15, 20, 25, 30, 50, 100]}
		/>
	);
}
