import { VarType, Variable } from "@/types/node/if-else-node";


/**
 * 创建清空的右变量（保留varType，其他字段置空）
 * @param varType 变量类型
 * @returns 清空的右变量对象
 */
export const createEmptyRightVariable = (varType: VarType | null): Variable => ({
	varType, // 保留变量类型
	nodeId: null, // 节点id置空
	outputHandleId: null, // 变量输出handleId置空
	variableConfigId: null, // 变量配置id置空
	variable: null, // 变量名称置空
	nodeName: null, // 节点名称置空
});