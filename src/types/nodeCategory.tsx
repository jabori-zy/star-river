// 节点目录中的节点item
export type NodeItemProps = {
	nodeId: string;
	nodeType: string;
	nodeName: string;
	nodeDescription: string;
	nodeColor: string;
	nodeData?: Record<string, unknown>;
};
