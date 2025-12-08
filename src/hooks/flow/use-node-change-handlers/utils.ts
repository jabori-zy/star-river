import type { Variable, VarType } from "@/types/node/if-else-node";

/**
 * Create an empty right variable (keep varType, clear other fields)
 * @param varType Variable type
 * @returns Empty right variable object
 */
export const createEmptyRightVariable = (
	varType: VarType | null,
): Variable => ({
	varType, // Keep variable type
	nodeId: null, // Clear node id
	outputHandleId: null, // Clear variable output handleId
	varConfigId: null, // Clear variable config id
	varName: null, // Clear variable name
	nodeName: null, // Clear node name
});
