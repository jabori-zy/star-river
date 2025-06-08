import BaseNode from "./index";
import { Play } from "lucide-react";
import { type StartNode } from "@/types/node/startNode";
import { NodeProps, Position } from "@xyflow/react";
import { useState } from "react";
import BaseHandle from "../BaseHandle";




const NewStartNode: React.FC<NodeProps<StartNode>> = (props) => {
    const { data, selected, isConnectable, id } = props;
    const [nodeName, setNodeName] = useState(data?.nodeName || "策略起点");

  return (
    <BaseNode
      {...props}
      nodeName={nodeName}
      icon={Play}
      selectedBorderColor="border-red-500"
    >
    <BaseHandle
      id="start_node_output"
      type="source"
      position={Position.Right}
      isConnectable={isConnectable}
    />
    </BaseNode>
  );
}

export default NewStartNode;