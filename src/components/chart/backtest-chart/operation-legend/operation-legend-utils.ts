/**
 * Parse series name: node_id:name:id -> only show name
 * Example: node_group_olzbhnj:operation_group2_output:2 -> operation_group2_output
 */
export const parseSeriesName = (name: string): string => {
	const parts = name.split(":");
	return parts.length >= 2 ? parts[1] : name;
};
