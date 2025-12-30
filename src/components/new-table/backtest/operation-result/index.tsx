import { DataTable } from "@/components/common-table";
import { useOperationResultColumns } from "./columns";

// Raw data from SSE stream
export type OperationResultData = Record<string, string | number>;

// Parsed data for table display
export interface ParsedOperationResult {
	datetime: string;
	[key: string]: string | number;
}

/**
 * Parse field name from series key
 * e.g., "series:operation_group_n31ly0z:close-ma:1" -> "close-ma"
 */
export function parseFieldName(key: string): string | null {
	if (key === "datetime") return null;
	const parts = key.split(":");
	// Format: series:group_id:field_name:index
	if (parts.length >= 3) {
		return parts[2];
	}
	return key;
}

/**
 * Extract dynamic field names from data
 */
export function extractFieldNames(
	data: OperationResultData[],
): Map<string, string> {
	const fieldMap = new Map<string, string>();

	for (const item of data) {
		for (const key of Object.keys(item)) {
			if (key !== "datetime" && !fieldMap.has(key)) {
				const fieldName = parseFieldName(key);
				if (fieldName) {
					fieldMap.set(key, fieldName);
				}
			}
		}
	}

	return fieldMap;
}

interface OperationResultTableProps {
	data: OperationResultData[];
}

export function OperationResultTable({ data }: OperationResultTableProps) {
	const fieldMap = extractFieldNames(data);
	const columns = useOperationResultColumns(fieldMap);

	return (
		<DataTable
			columns={columns}
			data={data}
			enableSorting
			enableFiltering={false}
			enablePagination
			pageSize={10}
			pageSizeOptions={[10, 20, 50, 100]}
		/>
	);
}
