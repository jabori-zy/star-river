"use client"

import { useSortable } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { GripVertical } from "lucide-react"

interface DragHandleProps {
  id: string | number
}

export function DragHandle({ id }: DragHandleProps) {
  const { attributes, listeners, isDragging } = useSortable({
    id,
  })

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`
        size-7 
        cursor-grab 
        text-muted-foreground 
        hover:bg-muted/50
        ${isDragging ? 'bg-muted' : 'hover:bg-transparent'}
      `}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-3.5 text-muted-foreground" />
      <span className="sr-only">拖拽排序</span>
    </Button>
  )
} 