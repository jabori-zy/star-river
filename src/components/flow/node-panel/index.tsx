import { useReactFlow } from "@xyflow/react";
import { Play } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import BasePanel from "@/components/flow/base/BasePanel";
import type { NodeData, NodeType } from "@/types/node/index";
import { PanelComponentMap } from "./constants";

interface NodePanelProps {
	selectedNodeId: string;
	setSelectedNodeId: (id: string | undefined) => void;
}

/**
 * Panel for all nodes. Based on the selected node, switch different node panels within the same panel
 * Inspired by dify framework implementation, use mapping table to manage different node settings panels
 */
const NodePanel: React.FC<NodePanelProps> = ({
	selectedNodeId,
	setSelectedNodeId,
}) => {
	// Get node instance
	const { getNodes } = useReactFlow();
	// Currently selected node type
	const [selectedNodeType, setSelectedNodeType] = useState<string | undefined>(
		undefined,
	);
	// Currently selected node data

	// Listen for node selection state changes
	useEffect(() => {
		// const checkSelectedNodes = () => {
		const nodes = getNodes();

		const selectedNode = nodes.find((node) => node.id === selectedNodeId);
		// console.log("selectedNode", selectedNode?.id);

		// If the selected node exists, set node id and type, and show panel
		if (selectedNode) {
			// setSelectedNodeId(selectedNodeId);
			setSelectedNodeType(selectedNode.type || undefined);
			// setIsShow(true);
		} else {
			// setSelectedNodeId(undefined);
			setSelectedNodeType(undefined);
			// setIsShow(false);
		}
		// };

		// Check immediately once
		// checkSelectedNodes();

		// Set timer to check periodically
		// const interval = setInterval(checkSelectedNodes, 400);

		// return () => clearInterval(interval);
	}, [selectedNodeId, getNodes]);

	// Use useMemo to optimize performance, get current node's settings panel configuration
	const currentPanelConfig = useMemo(() => {
		// console.log("selectedNodeType", selectedNodeType);
		if (!selectedNodeType) {
			// Return default settings panel
			return {
				icon: Play,
				iconBackgroundColor: "bg-red-400",
				liveModeSettingPanel: (
					<div className="p-4">
						<div className="text-sm text-gray-500">请选择一个支持的节点</div>
					</div>
				),
				backtestModeSettingPanel: (
					<div className="p-4">
						<div className="text-sm text-gray-500">请选择一个支持的节点</div>
					</div>
				),
				simulationModeSettingPanel: (
					<div className="p-4">
						<div className="text-sm text-gray-500">请选择一个支持的节点</div>
					</div>
				),
			};
		}

		const nodePanelConfig = PanelComponentMap[selectedNodeType as NodeType];
		if (nodePanelConfig) {
			return nodePanelConfig;
		}

		// If node type is not in mapping table, return default panel
		return {
			icon: Play,
			iconBackgroundColor: "bg-red-400",
			liveModeSettingPanel: (
				<div className="p-4">
					<div className="text-sm text-gray-500">该节点类型暂不支持设置</div>
				</div>
			),
			backtestModeSettingPanel: (
				<div className="p-4">
					<div className="text-sm text-gray-500">该节点类型暂不支持设置</div>
				</div>
			),
			simulationModeSettingPanel: (
				<div className="p-4">
					<div className="text-sm text-gray-500">该节点类型暂不支持设置</div>
				</div>
			),
		};
	}, [selectedNodeType]);

	return (
		<BasePanel
			key={selectedNodeId} // Use selectedNodeId as key to force re-render
			id={selectedNodeId}
			settingPanel={currentPanelConfig}
			setSelectedNodeId={setSelectedNodeId}
			tradeMode="backtest" // Default trading mode
		>
			<div>
				{selectedNodeId ? (
					<div className="text-sm text-gray-600">
						当前选中节点: {selectedNodeId}
						<br />
						节点类型: {selectedNodeType}
					</div>
				) : (
					<div className="text-sm text-gray-500">请选择一个节点以查看设置</div>
				)}
			</div>
		</BasePanel>
	);
};

export default memo(NodePanel);
