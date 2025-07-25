"use client";

import * as React from "react";
import { type Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type UniqueIdentifier } from "@dnd-kit/core";

interface TableItemProps<TData> {
	row: Row<TData>;
}

export function TableItem<TData>({ row }: TableItemProps<TData>) {
	// 使用类型断言获取行中的id属性，用于拖拽识别
	const id: UniqueIdentifier =
		(row.original as { id: string | number }).id || row.id;

	const { setNodeRef, transform, transition, isDragging } = useSortable({
		id,
		transition: {
			duration: 200, // 略微增加时间使过渡更加平滑
			easing: "cubic-bezier(0.2, 0, 0, 1)", // 使用自定义缓动函数
		},
	});

	// 计算样式并处理拖拽状态
	const style = React.useMemo(() => {
		return {
			// 仅在有变换时应用变换
			...(transform
				? {
						transform: CSS.Transform.toString(transform),
						// 拖拽时不使用transition，以避免回弹效果
						transition: isDragging ? undefined : transition,
					}
				: {}),
			// 设置拖拽时的视觉样式
			...(isDragging
				? {
						zIndex: 999, // 确保拖拽元素位于顶层
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
