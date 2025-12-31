import { Search } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import type React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { nodeList } from "@/constants/node-list";
import { useDndNodeStore } from "@/store/use-dnd-node-store";
import { getNodeTypeName, type NodeType } from "@/types/node";
import type { NodeItemProps } from "@/types/nodeCategory";

function NodeItem(props: NodeItemProps) {
	const { setDragNodeItem } = useDndNodeStore();
	const { t } = useTranslation();

	const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
		event.dataTransfer.setData("application/reactflow", props.nodeType);
		event.dataTransfer.effectAllowed = "move";

		// Use zustand store to set drag data
		setDragNodeItem({
			nodeId: props.nodeId,
			nodeType: props.nodeType,
			nodeIcon: props.nodeIcon,
			nodeIconBackgroundColor: props.nodeIconBackgroundColor,
			nodeDescription: props.nodeDescription || "",
		});
	};

	const handleDragEnd = () => {
		// Don't immediately clear dragNodeItem here, because onDrop may not have triggered yet
		// setDragNodeItem should be cleared after onDrop completes
		// Toast should also be shown after actually adding the node, not when drag ends
	};

	return (
		<div
			className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-50 cursor-grab active:cursor-grabbing"
			draggable
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			{props.nodeIcon && (
				<div
					className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0"
					style={{ backgroundColor: props.nodeIconBackgroundColor }}
				>
					<DynamicIcon
						name={props.nodeIcon}
						className="w-3.5 h-3.5 text-white"
					/>
				</div>
			)}
			{getNodeTypeName(props.nodeType as NodeType, t)}
		</div>
	);
}

// Node list panel
const NodeListPanel: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const { t } = useTranslation();

	const filteredCategories = useMemo(() => {
		const lowercasedFilter = searchTerm.trim().toLowerCase();
		if (!lowercasedFilter) {
			return nodeList;
		}

		return nodeList
			.map((item) => {
				const categoryTitleMatches = item.title
					.toLowerCase()
					.includes(lowercasedFilter);

				const filteredItems = item.items.filter((item) =>
					getNodeTypeName(item.nodeType as NodeType, t)
						.toLowerCase()
						.includes(lowercasedFilter),
				);

				if (categoryTitleMatches) {
					return item;
				}

				if (filteredItems.length > 0) {
					return { ...item, items: filteredItems };
				}

				return null;
			})
			.filter((item): item is NonNullable<typeof item> => item !== null);
	}, [searchTerm, t]);

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 pb-3 pt-8 w-[240px] relative">
			{/* Search box - absolutely positioned at top, leaving space for close button */}
			<div className="pt-0">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="搜索节点..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>
			<Separator className="mt-4" />

			{/* Node list */}
			<ScrollArea className="h-[420px] ">
				<div className="space-y-3 py-2 pr-2">
					{filteredCategories.length > 0 ? (
						filteredCategories.map((item) => (
							<div key={item.title} className="space-y-1">
								<div className="text-xs text-gray-500 px-2 py-1 flex items-center">
									<item.icon className="w-3 h-3 mr-1" />
									{t(item.title)}
								</div>
								<div className="space-y-1">
									{item.items.map((item) => (
										<NodeItem key={item.nodeId} {...item} />
									))}
								</div>
							</div>
						))
					) : (
						<div className="text-sm text-center text-gray-500 py-10">
							未找到匹配的节点
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default NodeListPanel;
