"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Row } from "@tanstack/react-table";
import * as React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableItemProps<TData> {
	row: Row<TData>;
}

export function TableItem<TData>({ row }: TableItemProps<TData>) {
	// Use type assertion to get id property from row for drag recognition
	const id: UniqueIdentifier =
		(row.original as { id: string | number }).id || row.id;

	const { setNodeRef, transform, transition, isDragging } = useSortable({
		id,
		transition: {
			duration: 200, // Slightly increase time to make transition smoother
			easing: "cubic-bezier(0.2, 0, 0, 1)", // Use custom easing function
		},
	});

	// Calculate styles and handle drag state
	const style = React.useMemo(() => {
		return {
			// Only apply transform when there is transformation
			...(transform
				? {
						transform: CSS.Transform.toString(transform),
						// Don't use transition when dragging to avoid bounce effect
						transition: isDragging ? undefined : transition,
					}
				: {}),
			// Set visual style during dragging
			...(isDragging
				? {
						zIndex: 999, // Ensure dragged element is on top
						boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
						background: "var(--background)",
					}
				: {}),
		};
	}, [transform, transition, isDragging]);

	return (
		<TableRow
			ref={setNodeRef}
			style={style}
			data-state={row.getIsSelected() && "selected"}
			data-dragging={isDragging}
			className={`
        relative 
        border-b 
        transition-colors 
        hover:bg-muted/50
        data-[dragging=true]:opacity-95
        data-[dragging=true]:border-primary/20
        ${isDragging ? "ring-1 ring-primary" : ""}
      `}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}
