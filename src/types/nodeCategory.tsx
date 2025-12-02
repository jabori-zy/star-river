import type { IconName } from "lucide-react/dynamic";
import type { NodeType } from "./node";

// 节点目录中的节点item
export type NodeItemProps = {
	nodeId: string;
	nodeType: NodeType;
	nodeIcon: IconName;
	nodeIconBackgroundColor: string;
	nodeDescription: string;
};
