import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";

interface UseChangeNodeNameProps {
	id: string;
	initialNodeName?: string;
}

export const useChangeNodeName = ({
	id,
	initialNodeName,
}: UseChangeNodeNameProps) => {
	const { updateNodeData, getNode } = useReactFlow();

	// 节点名称状态管理
	const [nodeName, setNodeName] = useState<string>(
		initialNodeName || "未命名节点",
	);

	// 监听 nodeName 变化，同步到 ReactFlow
	useEffect(() => {
		if (nodeName && nodeName !== initialNodeName) {
			updateNodeData(id, {
				nodeName: nodeName,
			});
		}
	}, [nodeName, id, updateNodeData, initialNodeName]);

	// 监听 initialNodeName 变化
	useEffect(() => {
		if (initialNodeName) {
			setNodeName(initialNodeName);
		}
	}, [initialNodeName]);

	// 更新节点名称（供外部调用）
	const updateNodeName = useCallback(
		(newNodeName: string) => {
			const finalNodeName = newNodeName.trim() || "未命名节点";
			setNodeName(finalNodeName);
		},
		[],
	);

	return {
		nodeName,
		updateNodeName,
	};
};
