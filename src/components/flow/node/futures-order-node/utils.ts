import type { OrderType } from "@/types/order";


export const getOutputHandleIds = (nodeId: string, orderConfigId: number, orderType: OrderType) => {
	const isLimitType = orderType.includes("LIMIT");
	
	const handles = [
		`${nodeId}_all_status_output_${orderConfigId}`,
		`${nodeId}_created_output_${orderConfigId}`,
	];
	
	// Only limit-type orders have 'placed' status
	if (isLimitType) {
		handles.push(`${nodeId}_placed_output_${orderConfigId}`);
	}
	
	handles.push(
		`${nodeId}_partial_output_${orderConfigId}`,
		`${nodeId}_filled_output_${orderConfigId}`,
		`${nodeId}_canceled_output_${orderConfigId}`,
		`${nodeId}_expired_output_${orderConfigId}`,
		`${nodeId}_rejected_output_${orderConfigId}`,
		`${nodeId}_error_output_${orderConfigId}`,
	);
	
	return handles;
}
