import { DataTable } from "@/components/common-table";
import type {
	CustomVariableUpdateEvent,
	SystemVariableUpdateEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import { useVariableColumns } from "./columns";

type VariableEvent = CustomVariableUpdateEvent | SystemVariableUpdateEvent;

interface VariableTableProps {
	data: VariableEvent[];
}

export function VariableTable({ data }: VariableTableProps) {
	const columns = useVariableColumns();

	return (
		<DataTable
			columns={columns}
			data={data}
			enableSorting
			enableFiltering
			enablePagination
			searchKeys={["varName", "varDisplayName", "nodeName"]}
			pageSize={20}
			pageSizeOptions={[10, 20, 50, 100]}
		/>
	);
}
