export const getOutputHandleIds = (nodeId: string, configId: number) => {

	const handles = [
		`${nodeId}_success_output_${configId}`,
		`${nodeId}_failed_output_${configId}`,
	];
	
	
	return handles;
}
