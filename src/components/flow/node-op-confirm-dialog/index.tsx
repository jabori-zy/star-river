import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NodeOpConfirmDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	affectedNodeCount: number;
	affectedNodeNames: string[];
	onConfirm: () => void;
	onCancel: () => void;
	title?: string;
	description?: string;
	operationType?: "add" | "edit" | "delete";
}

export const NodeOpConfirmDialog: React.FC<NodeOpConfirmDialogProps> = ({
	isOpen,
	onOpenChange,
	affectedNodeCount,
	affectedNodeNames,
	onConfirm,
	onCancel,
	title,
	description,
	operationType = "edit",
}) => {
	// Generate default title based on operation type
	const getDefaultTitle = () => {
		switch (operationType) {
			case "add":
				return "确认新增";
			case "delete":
				return "确认删除";
			case "edit":
			default:
				return "确认修改";
		}
	};

	const finalTitle = title || getDefaultTitle();
	// Generate action description based on operation type
	const getActionText = () => {
		switch (operationType) {
			case "add":
				return "新增";
			case "delete":
				return "删除";
			case "edit":
			default:
				return "修改";
		}
	};

	// Generate smart description text
	const generateDescriptionElement = () => {
		const filteredNames = affectedNodeNames.filter((name) => name?.trim());
		const count = affectedNodeCount;
		const actionText = getActionText();

		if (filteredNames.length === 0) {
			return (
				<span>
					当前{actionText}将影响 <strong>{count}</strong> 个连接的节点，是否继续
					{actionText}？
				</span>
			);
		}

		if (count === 1) {
			// Only 1 node, no need for "etc"
			const nodeName = filteredNames[0] || "1个节点";
			return (
				<span>
					当前操作将影响 <strong>{nodeName}</strong>，是否继续{actionText}？
				</span>
			);
		} else if (count <= 3) {
			// 2-3 nodes, show all names, no need for "etc"
			const nodeNames = filteredNames.slice(0, count);
			return (
				<span>
					当前{actionText}将影响{" "}
					{nodeNames.map((name, index) => (
						<span key={name}>
							<strong>{name}</strong>
							{index < nodeNames.length - 1 && ", "}
						</span>
					))}{" "}
					等 <strong>{count}</strong> 个节点，是否继续{actionText}？
				</span>
			);
		} else {
			// More than 3 nodes, show first 3 + "etc"
			const nodeNames = filteredNames.slice(0, 3);
			return (
				<span>
					当前{actionText}将影响{" "}
					{nodeNames.map((name, index) => (
						<span key={name}>
							<strong>{name}</strong>
							{index < nodeNames.length - 1 && ", "}
						</span>
					))}{" "}
					等 <strong>{count}</strong> 个节点，是否继续{actionText}？
				</span>
			);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{finalTitle}</AlertDialogTitle>
					<AlertDialogDescription>
						{description || generateDescriptionElement()}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel}>取消</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>确认</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
