import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GripHorizontal } from "lucide-react";
import { useDragAndDrop } from "./useDragAndDrop";
import { NodeItemProps } from "@/types/node";


export function NodeItem({ nodeId: id, nodeType: type, nodeName: name, nodeDescription: description, nodeColor: color, nodeData: data }: NodeItemProps) {
  const [, setNodeType] = useDragAndDrop();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeItemType: NodeItemProps) => {
    setNodeType(nodeItemType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={cn(
        "rounded-lg cursor-grab active:cursor-grabbing",
        "bg-gradient-to-r shadow-sm hover:shadow-md",
        "border border-border/50",
        "transition-all duration-200",
        color
      )}
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, {nodeId: id, nodeType: type, nodeName: name, nodeDescription: description, nodeColor: color, nodeData: data} as NodeItemProps)} 
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripHorizontal className="h-4 w-4 text-muted-foreground/50" />
            <span className="font-medium text-sm">{name}</span>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-background/50 text-[10px] px-1.5 py-0 h-4"
          >
            可拖拽
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground pl-6">
          {description}
        </p>
      </div>
    </div>
  );
}
