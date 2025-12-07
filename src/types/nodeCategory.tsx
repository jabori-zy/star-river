import type { IconName } from "lucide-react/dynamic";
import type { NodeType } from "./node";

// Node item in the node directory
export type NodeItemProps = {
	nodeId: string;
	nodeType: NodeType;
	nodeIcon: IconName;
	nodeIconBackgroundColor: string;
	nodeDescription: string;
};
