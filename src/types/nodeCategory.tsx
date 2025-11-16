import { IconName } from "lucide-react/dynamic";

// 节点目录中的节点item
export type NodeItemProps = {
	nodeId: string;
	nodeType: string;
	nodeIcon: IconName;
	nodeIconBackgroundColor: string;
	nodeDescription: string;

};
