import { useDragAndDrop } from "../useDragAndDrop";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NodeItemProps } from "@/types/node";

// 本地定义组件属性接口

export function NodeItem({
  nodeId,
  nodeType,
  nodeName,
  nodeDescription,
  nodeColor,
  nodeData
}: NodeItemProps) {
  const [, setDragNodeItem] = useDragAndDrop();

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';

    // 使用传递的数据
    setDragNodeItem({
      nodeId,
      nodeType,
      nodeName,
      nodeDescription: nodeDescription || "",
      nodeColor,
      nodeData
    });
  };

  const handleDragEnd = () => {
    setDragNodeItem(null);
    
    toast(`节点 ${nodeName} 已添加`, {
      duration: 2000
    });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "rounded-lg px-4 py-3 cursor-grab",
        "transition-all duration-200 shadow-sm",
        "active:cursor-grabbing active:scale-95",
        "border border-border/30",
        "bg-gradient-to-br",
        nodeColor
      )}
    >
      <div className="text-sm font-medium text-foreground">{nodeName}</div>
      {nodeDescription && (
        <div className="text-xs mt-1 text-muted-foreground/80">{nodeDescription}</div>
      )}
    </div>
  );
} 