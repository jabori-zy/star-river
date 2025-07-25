import { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

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

	// 监听节点数据变化，同步外部的节点名称更新
	useEffect(() => {
		const node = getNode(id);
		if (node && node.data && typeof node.data.nodeName === "string") {
			const nodeNameFromData = node.data.nodeName || "未命名节点";
			setNodeName(nodeNameFromData);
		}
	}, [id, getNode]);

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

			// 更新节点数据
			updateNodeData(id, {
				nodeName: finalNodeName,
			});
		},
		[id, updateNodeData],
	);

	return {
		nodeName,
		updateNodeName,
	};
};
