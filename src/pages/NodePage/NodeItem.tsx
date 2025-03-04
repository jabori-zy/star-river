import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GripHorizontal } from "lucide-react";

interface NodeItemProps {
  name: string;
  description: string;
  color: string;
}

export function NodeItem({ name, description, color }: NodeItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-lg cursor-grab active:cursor-grabbing",
        "bg-gradient-to-r shadow-sm hover:shadow-md",
        "border border-border/50",
        "transition-all duration-200",
        color
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/reactflow', name);
      }}
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
    </motion.div>
  );
}
