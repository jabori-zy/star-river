import { DataTable } from "@/components/common-table";
import type {
	NodeRunningLogEvent,
	StrategyRunningLogEvent,
} from "@/types/strategy-event/running-log-event";
import { useLogColumns } from "./columns";

interface LogTableProps {
	data: (StrategyRunningLogEvent | NodeRunningLogEvent)[];
}

export function LogTable({ data }: LogTableProps) {
	const columns = useLogColumns();

	return (
		<DataTable
			columns={columns}
			data={data}
			enableSorting
			enableFiltering
			enablePagination
			enableRowExpansion
			renderExpandedRow={(row) => (
				<pre className="text-sm whitespace-pre-wrap overflow-x-auto bg-gray-50 dark:bg-gray-800 p-3 rounded border">
					<code>{JSON.stringify(row.detail, null, 2)}</code>
				</pre>
			)}
			searchKeys={["message", "nodeName"]}
			pageSize={20}
			pageSizeOptions={[10, 20, 50, 100, 200]}
		/>
	);
}
